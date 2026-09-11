import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { memberInputSchema, memberPatchSchema } from "./members.schema";
import { membersController } from "./members.controller";

export const membersRouter = Router();

// Every route here is admin-only: this is the PII that used to be
// hard-coded in the client bundle. It now never leaves the server
// unless the caller holds a valid admin access token.
membersRouter.use(requireAuth, requireRole("admin"));

membersRouter.get("/", membersController.list);
membersRouter.post("/", validateBody(memberInputSchema), membersController.create);
membersRouter.patch("/:id", validateBody(memberPatchSchema), membersController.update);
membersRouter.delete("/:id", membersController.remove);

