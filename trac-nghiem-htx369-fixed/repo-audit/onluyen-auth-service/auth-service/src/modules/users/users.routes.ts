import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { usersController } from "./users.controller";

const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, usersController.me);
usersRouter.patch("/me", requireAuth, validateBody(updateMeSchema), usersController.updateMe);
