import z from "zod";
import {
  GenreEnum,
  MoodEnum,
  MotivationEnum,
  AgeEnum,
} from "@/app/services/answersSchema";

export const EditBookSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),

  authorName: z.string().min(1).optional(),

  publish_date: z.string().datetime().optional().nullable(),
  pdfURL: z.string().optional().nullable(),
  coverURL: z.string().optional().nullable(),

  Genre: z.array(GenreEnum).optional().nullable(),
  mood: z.array(MoodEnum).optional().nullable(),
  Motivation: z.array(MotivationEnum).optional().nullable(),

  Age: AgeEnum.optional().nullable(),
  length: z.number().int().positive().optional().nullable(),
});
