import z from "zod";
import { AgeEnum, GenderEnum, RoleEnum } from "./answersSchema";

export const UserEditSchema = z.object({
  name: z.string().min(1, "نام نمی‌تواند خالی باشد").optional(),
  gender: GenderEnum.optional(),
  email: z.string().email("ایمیل معتبر نیست").optional(),
  role: RoleEnum.optional(),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ حرف باشد").optional(),
  Age: AgeEnum.optional().nullable(),
  isActive: z.boolean().nullable().optional(),
  categories: z.array(z.number().int().positive()).optional().nullable(),
});
