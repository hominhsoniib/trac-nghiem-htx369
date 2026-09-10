import crypto from "crypto";
import { ApiError } from "../../utils/apiError";
import { hashPassword, verifyPassword } from "../../utils/password";
import { generateRefreshToken, hashToken, signAccessToken } from "../../utils/jwt";
import { env } from "../../config/env";
import { usersRepository, toPublicUser } from "../users/users.repository";
import { authRepository } from "./auth.repository";
import type { LoginInput, RegisterInput } from "./auth.schema";

type RequestMeta = { userAgent?: string; ip?: string };

function refreshExpiry(): Date {
  return new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
}

async function issueTokenPair(user: { id: string; email: string; role: "user" | "admin" }, meta: RequestMeta) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const { token: refreshToken, tokenHash } = generateRefreshToken();
  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt: refreshExpiry(),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput, meta: RequestMeta) {
    const existing = await usersRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict("An account with this email already exists");

    const passwordHash = await hashPassword(input.password);
    const user = await usersRepository.create({ email: input.email, passwordHash, name: input.name });
    const tokens = await issueTokenPair(user, meta);
    return { user: toPublicUser(user), ...tokens };
  },

  async login(input: LoginInput, meta: RequestMeta) {
    const user = await usersRepository.findByEmail(input.email);
    if (!user || !user.is_active) throw ApiError.unauthorized("Invalid email or password");

    const valid = await verifyPassword(input.password, user.password_hash);
    if (!valid) throw ApiError.unauthorized("Invalid email or password");

    const tokens = await issueTokenPair(user, meta);
    return { user: toPublicUser(user), ...tokens };
  },

  /** Rotates a refresh token: the old one is revoked and a new pair is issued. */
  async refresh(refreshTokenRaw: string, meta: RequestMeta) {
    const tokenHash = hashToken(refreshTokenRaw);
    const stored = await authRepository.findValidRefreshToken(tokenHash);
    if (!stored) throw ApiError.unauthorized("Refresh token is invalid or expired");

    const user = await usersRepository.findById(stored.user_id);
    if (!user || !user.is_active) throw ApiError.unauthorized("Account is no longer active");

    await authRepository.revokeRefreshTokenByHash(tokenHash);
    const tokens = await issueTokenPair(user, meta);
    return { user: toPublicUser(user), ...tokens };
  },

  async logout(refreshTokenRaw: string | undefined) {
    if (!refreshTokenRaw) return;
    await authRepository.revokeRefreshTokenByHash(hashToken(refreshTokenRaw));
  },

  /**
   * Always resolves without revealing whether the email exists (avoids
   * user enumeration). In development the raw token is returned so it
   * can be exercised without a real mail sender wired up.
   */
  async forgotPassword(email: string) {
    const user = await usersRepository.findByEmail(email);
    if (!user) return { devToken: undefined };

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.passwordResetTtlMin * 60 * 1000);
    await authRepository.createPasswordResetToken({ userId: user.id, tokenHash, expiresAt });

    // TODO: wire up a real transactional email provider here (e.g. Postmark, SES).
    if (env.nodeEnv !== "production") {
      console.log(`[password-reset] token for ${email}: ${rawToken}`);
      return { devToken: rawToken };
    }
    return { devToken: undefined };
  },

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken);
    const stored = await authRepository.findValidPasswordResetToken(tokenHash);
    if (!stored) throw ApiError.badRequest("Reset token is invalid or expired");

    const passwordHash = await hashPassword(newPassword);
    await usersRepository.updatePasswordHash(stored.user_id, passwordHash);
    await authRepository.markPasswordResetTokenUsed(stored.id);
    // Revoke all existing sessions so a leaked password can't keep a session alive.
    await authRepository.revokeAllForUser(stored.user_id);
  },
};
