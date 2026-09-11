import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: { message: err.message, details: err.details } });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      message: "Internal server error",
      ...(env.nodeEnv !== "production" && err instanceof Error ? { stack: err.stack } : {}),
    },
  });
}
