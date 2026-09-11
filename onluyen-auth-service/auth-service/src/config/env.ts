import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? ["http://localhost:5173", "http://localhost:3000"],

  databaseUrl: required("DATABASE_URL"),

  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7),

  cookieSecure: (process.env.COOKIE_SECURE ?? "false") === "true",
  // Left unset by default (host-only cookie). Only set COOKIE_DOMAIN if the
  // frontend and backend share a parent domain (e.g. both under
  // *.onluyen369.vn) — it must be omitted, not set to the frontend's
  // domain, when they're on unrelated hosts like a *.vercel.app frontend
  // talking to a VPS backend; a mismatched Domain makes the browser
  // silently drop the Set-Cookie header.
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  // "strict"/"lax" for same-domain deployments (dev, or reverse-proxied
  // under one domain). Frontend on Vercel + backend on a separate host
  // (the normal case for this project) is cross-site, so the refresh
  // cookie MUST be "none" there, which in turn requires cookieSecure=true
  // (browsers refuse SameSite=None without Secure).
  cookieSameSite: (process.env.COOKIE_SAME_SITE ?? "lax") as "strict" | "lax" | "none",

  passwordResetTtlMin: Number(process.env.PASSWORD_RESET_TTL_MIN ?? 60),
};
