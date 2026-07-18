import z from "zod";
import {
  MoodEnum,
  MotivationEnum,
  AgeEnum,
} from "@/app/services/answersSchema";

export const EditBookSchema = z.object({
  title: z.string().min(1, "عنوان کتاب نمی‌تواند خالی باشد").optional(),
  description: z.string().min(1, "توضیحات نمی‌تواند خالی باشد").optional(),

  authorName: z.string().optional().nullable(),

  publish_date: z.string().datetime().optional().nullable(),
  pdfURL: z.string().optional().nullable(),
  coverURL: z.string().optional().nullable(),

  mood: z.array(MoodEnum).optional().nullable(),
  Motivation: z.array(MotivationEnum).optional().nullable(),
  categoryId: z.number().int().positive().optional().nullable(),

  Age: AgeEnum.optional().nullable(),
  length: z.number().int().positive().optional().nullable(),
});
