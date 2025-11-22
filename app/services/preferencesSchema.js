import { z } from "zod";
import {
  GenreEnum,
  MoodEnum,
  MotivationEnum,
  LengthEnum,
  AgeEnum
} from "@/app/services/answersSchema";

export const PreferencesSchema = z.object({
  Genre: z.array(GenreEnum).optional().nullable(),
  mood: MoodEnum.optional().nullable(),
  Motivation: z.array(MotivationEnum).optional().nullable(),
  Age: AgeEnum.optional().nullable(),

  // Array of author IDs
  author: z.array(z.number().int().positive()).optional().nullable(),

  // Book length category (short/medium/long)
  book_length: z.array(LengthEnum).optional().nullable(),

  // Optional — system-generated recommended list
  recommendedBooksIds: z.array(z.number().int().positive()).optional().nullable(),
});
