import { Router } from "express";
import { validateBody } from "../../middleware/validate.middleware";
import { authRateLimiter } from "../../middleware/rateLimit.middleware";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.schema";
import { authController } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, validateBody(registerSchema), authController.register);
authRouter.post("/login", authRateLimiter, validateBody(loginSchema), authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", authRateLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/reset-password", authRateLimiter, validateBody(resetPasswordSchema), authController.resetPassword);
