import z from "zod";
import { AgeEnum, GenderEnum } from "./answersSchema";

export const UserEditSchema = z.object({
  name: z.string().min(1).optional(),
  gender: GenderEnum.optional(), 
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  Age: AgeEnum.optional().nullable(),
  isActive: z.boolean().nullable().optional(),
});
