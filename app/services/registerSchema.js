import z from "zod";
import {
  GenderEnum,
  RoleEnum,
  MoodEnum,
  MotivationEnum,
  LengthEnum,
  AgeEnum,
} from '@/app/services/answersSchema'; 
import { CategoryEnum } from '@/app/services/answersSchema';

export const RegisterSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  gender: GenderEnum, // uses your zod enum
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ حرف باشد"),

  // optional role but validate if provided
  role: RoleEnum.optional().default('user'),

  // JSON array fields (optional)
  mood: MoodEnum.optional().nullable(),
  Motivation: z.array(MotivationEnum).optional().nullable(),
  Age: AgeEnum.optional().nullable(),
  author: z.array(z.number().int().positive()).optional().nullable(),
  book_length: z.array(LengthEnum).optional().nullable(),
  recommendedBooksIds: z.array(z.number().int().positive()).optional().nullable(),
  // categories collected from onboarding / getstarted
  categories: z.array(CategoryEnum).optional().nullable(),
});