import { z } from "zod";

export const readingProgressSchema = z.object({
  bookId: z.number().int().positive("bookId must be a positive integer"),
  lastPage: z.number().int().positive("lastPage must be a positive integer"),
});
