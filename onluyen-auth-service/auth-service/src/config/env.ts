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
  cookieDomain: process.env.COOKIE_DOMAIN ?? "localhost",

  passwordResetTtlMin: Number(process.env.PASSWORD_RESET_TTL_MIN ?? 60),
};
