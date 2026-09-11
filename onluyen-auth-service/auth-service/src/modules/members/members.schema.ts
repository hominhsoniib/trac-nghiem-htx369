import { z } from "zod";

export const memberInputSchema = z.object({
  memberCode: z.string().trim().min(1).max(50),
  type: z.enum(["ca_nhan", "phap_nhan"]),
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  password: z.string().trim().max(100).optional().or(z.literal("")),
  taxCode: z.string().trim().max(50).optional(),

  representative: z.string().trim().max(200).optional(),
  role: z.string().trim().max(100).optional(),
  status: z.enum(["STUDYING", "PASSED"]),
  examScore: z.number().int().min(0).max(100).nullable().optional(),
  certId: z.string().trim().max(50).nullable().optional(),
  progressCount: z.number().int().min(0).optional(),
});

export const memberPatchSchema = memberInputSchema.partial();

