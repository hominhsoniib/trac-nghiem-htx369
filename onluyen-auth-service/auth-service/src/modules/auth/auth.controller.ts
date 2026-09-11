import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { env } from "../../config/env";
import { authService } from "./auth.service";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_PATH = "/api/auth";

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    domain: env.cookieDomain,
    path: REFRESH_COOKIE_PATH,
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  };
}

function meta(req: Request) {
  return { userAgent: req.headers["user-agent"], ip: req.ip };
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken, ...result } = await authService.register(req.body, meta(req));
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken, ...result } = await authService.login(req.body, meta(req));
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
    res.json(result);
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw ApiError.unauthorized("Missing refresh token");
    const { refreshToken, ...result } = await authService.refresh(token, meta(req));
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
    res.json(result);
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
    res.status(204).send();
  }),


  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { devToken } = await authService.forgotPassword(req.body.email);
    res.json({
      message: "If an account exists for this email, a reset link has been sent.",
      ...(devToken ? { devToken } : {}),
    });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ message: "Password has been reset. Please log in again." });
  }),
};
