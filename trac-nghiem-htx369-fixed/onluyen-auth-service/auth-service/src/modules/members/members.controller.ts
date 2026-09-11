import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { membersService } from "./members.service";

export const membersController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const members = await membersService.list();
    res.json({ members });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const member = await membersService.create(req.body);
    res.status(201).json({ member });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const member = await membersService.update(req.params.id, req.body);
    res.json({ member });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await membersService.remove(req.params.id);
    res.status(204).send();
  }),
};
