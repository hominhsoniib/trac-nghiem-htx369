import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { usersService } from "./users.service";

export const usersController = {
  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const profile = await usersService.getProfile(req.user.sub);
    res.json({ user: profile });
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const profile = await usersService.updateProfile(req.user.sub, req.body);
    res.json({ user: profile });
  }),
};
