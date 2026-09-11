import { pool } from "../../db/pool";

export const authRepository = {
  async createRefreshToken(params: { userId: string; tokenHash: string; expiresAt: Date; userAgent?: string; ip?: string }) {
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [params.userId, params.tokenHash, params.expiresAt, params.userAgent ?? null, params.ip ?? null]
    );
  },

  async findValidRefreshToken(tokenHash: string) {
    const { rows } = await pool.query<{ id: string; user_id: string; expires_at: Date; revoked_at: Date | null }>(
      `SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = $1`,
      [tokenHash]
    );
    const row = rows[0];
    if (!row) return null;
    if (row.revoked_at) return null;
    if (row.expires_at.getTime() < Date.now()) return null;
    return row;
  },

  async revokeRefreshTokenByHash(tokenHash: string) {
    await pool.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`, [tokenHash]);
  },

  async revokeAllForUser(userId: string) {
    await pool.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [userId]);
  },

  async createPasswordResetToken(params: { userId: string; tokenHash: string; expiresAt: Date }) {
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [params.userId, params.tokenHash, params.expiresAt]
    );
  },

  async findValidPasswordResetToken(tokenHash: string) {
    const { rows } = await pool.query<{ id: string; user_id: string; expires_at: Date; used_at: Date | null }>(
      `SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = $1`,
      [tokenHash]
    );
    const row = rows[0];
    if (!row) return null;
    if (row.used_at) return null;
    if (row.expires_at.getTime() < Date.now()) return null;
    return row;
  },

  async markPasswordResetTokenUsed(id: string) {
    await pool.query(`UPDATE password_reset_tokens SET used_at = now() WHERE id = $1`, [id]);
  },
};
