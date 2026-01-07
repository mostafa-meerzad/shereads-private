import z from "zod";
import {
  GenreEnum,
  MoodEnum,
  MotivationEnum,
  AgeEnum,
} from "@/app/services/answersSchema";
import { CategoryEnum } from "@/app/services/answersSchema";

// Schema for author creation (name only)
export const AddAuthorSchema = z.object({
  name: z.string().min(1, "نام نویسنده لازم است"),
});

// Schema for adding a book (author NAME instead of authorId)
export const AddBookSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),

  // Instead of authorId we take name
  authorName: z.string().optional().nullable(),

  publish_date: z.string().datetime().optional().nullable(),
  pdfURL: z.string().optional().nullable(),
  coverURL: z.string().optional().nullable(),

  Genre: z.array(GenreEnum).optional().nullable(),
  mood: z.array(MoodEnum).optional().nullable(),
  Motivation: z.array(MotivationEnum).optional().nullable(),
  category: CategoryEnum,

  Age: AgeEnum.optional().nullable(),
  length: z.number().int().positive().optional().nullable(),
});
