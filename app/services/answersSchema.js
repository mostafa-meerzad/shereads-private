import { z } from "zod";

export const GenderEnum = z.enum(["مذکر", "مونث"]);
export const RoleEnum = z.enum(["admin", "user"]);


export const MoodEnum = z.enum([
  "آرام", "الهام_بخش", "احساسی", "معلوماتی", "پرهیجان", "احساس_خوب"
]);

export const MotivationEnum = z.enum([
  "سرگرمی", "یادگیری", "رشد_فردی", "بهبود_مهارت_ها"
]);

export const LengthEnum = z.enum(["کوتاه", "متوسط", "بلند"]);

export const AgeEnum = z.enum(["۱۲–۱۷", "۱۸–۲۵", "۲۶–۳۵", "۳۶–۵۰", "۵۰+"])

// Categories are now dynamic (stored in DB). Use integer IDs.
// CategoryEnum is kept as a no-op to avoid breaking any lingering imports.
export const CategoryEnum = z.number().int().positive().optional().nullable();