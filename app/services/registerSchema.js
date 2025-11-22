import z from "zod";
import {
  GenderEnum,
  RoleEnum,
  GenreEnum,
  MoodEnum,
  MotivationEnum,
  LengthEnum,
} from '@/app/services/answersSchema'; 

export const RegisterSchema = z.object({
  name: z.string().min(1),
  gender: GenderEnum, // uses your zod enum
  email: z.string().email(),
  password: z.string().min(6),
  profileImgURL: z.string().url().optional().nullable(),

  // optional role but validate if provided
  role: RoleEnum.optional().default('user'),

  // JSON array fields (optional)
  Genre: z.array(GenreEnum).optional().nullable(),
  mood: MoodEnum.optional().nullable(),
  Motivation: z.array(MotivationEnum).optional().nullable(),
  Age: z.number().int().positive().optional().nullable(),
  author: z.array(z.number().int().positive()).optional().nullable(),
  book_length: z.array(LengthEnum).optional().nullable(),
  recommendedBooksIds: z.array(z.number().int().positive()).optional().nullable(),
});