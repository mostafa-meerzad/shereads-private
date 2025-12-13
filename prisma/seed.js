import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================
  // 🚀 PRODUCTION MODE — seed ONLY the admin user
  // ============================================================
  if (process.env.NODE_ENV === "production") {
    console.log("🚀 Production mode detected — seeding ONLY admin user.");

    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@gmail.com" },
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists. Skipping creation.");
      return;
    }

    const hashed = await hashPassword("123456");

    await prisma.user.create({
      data: {
        name: "admin",
        email: "admin@gmail.com",
        passwordHash: hashed,
        role: "admin",

        // Required fields
        gender: "مذکر",
        Genre: [],
        mood: null,
        Motivation: [],
        Age: "۱۸–۲۵",
        author: [],
        book_length: [],
        recommendedBooksIds: [],
      },
    });

    console.log("✅ Admin user created.");
    return; // STOP HERE IN PRODUCTION
  }

  // ============================================================
  // 🛠 DEVELOPMENT MODE — FULL SEED
  // ============================================================
  console.log("🛠 Development mode — full database seed.");

  // -----------------------
  // Authors
  // -----------------------
  await prisma.author.createMany({
    data: [
      { id: 1, name: "جلال آل‌احمد" },
      { id: 2, name: "صادق هدایت" },
      { id: 3, name: "محمود دولت‌آبادی" },
      { id: 4, name: "احمد شاملو" },
      { id: 5, name: "ژان پل سارتر" },
      { id: 6, name: "پائولو کوئیلو" },
      { id: 7, name: "داستايفسکی" },
      { id: 8, name: "اورول" },
      { id: 9, name: "نیل گیمن" },
      { id: 10, name: "جین آستن" },
    ],
  });

  // -----------------------
  // Books
  // -----------------------
  await prisma.book.createMany({
    data: [
      {
        id: 1,
        title: "بوف کور",
        description: "رمانی نمادین و فلسفی درباره تاریکی ذهن انسان.",
        authorId: 2,
        publish_date: new Date("1937-01-01"),
        Genre: ["ادبیات", "داستان"],
        mood: ["احساسی", "احساس_خوب"],
        Motivation: ["سرگرمی", "یادگیری"],
        Age: "۱۲–۱۷",
        length: 220,
      },
      {
        id: 2,
        title: "کلیدر",
        description: "حماسه‌ای ایرانی با نثری قدرتمند و شخصیت‌پردازی عمیق.",
        authorId: 3,
        publish_date: new Date("1978-01-01"),
        Genre: ["تاریخی", "ادبیات"],
        mood: ["پرهیجان"],
        Motivation: ["یادگیری", "رشد_فردی"],
        Age: "۱۲–۱۷",
        length: 1200,
      },
      {
        id: 3,
        title: "کیمیایی",
        description: "رمانی الهام‌بخش درباره جستجوی هدف و معنی زندگی.",
        authorId: 6,
        publish_date: new Date("1988-01-01"),
        Genre: ["توسعه_فردی", "ادبیات"],
        mood: ["الهام_بخش"],
        Motivation: ["رشد_فردی"],
        Age: "۱۸–۲۵",
        length: 200,
      },
      {
        id: 4,
        title: "بیگانه",
        description: "رمانی اگزیستانسیالیستی درباره پوچی و بیگانگی انسان.",
        authorId: 5,
        publish_date: new Date("1942-01-01"),
        Genre: ["ادبیات", "معلوماتی"],
        mood: ["آرام"],
        Motivation: ["یادگیری"],
        Age: "۲۶–۳۵",
        length: 160,
      },
      {
        id: 5,
        title: "جنایت و مکافات",
        description: "بررسی عمیق وجدان، اخلاق و روان انسان.",
        authorId: 7,
        publish_date: new Date("1866-01-01"),
        Genre: ["تاریخی", "ادبیات"],
        mood: ["احساسی", "پرهیجان"],
        Motivation: ["یادگیری"],
        Age: "۵۰+",
        length: 700,
      },
      {
        id: 6,
        title: "1984",
        description: "رمانی دیستوپیایی درباره کنترل ذهن و آزادی.",
        authorId: 8,
        publish_date: new Date("1949-01-01"),
        Genre: ["تخیلی", "تاریخی"],
        mood: ["معلوماتی"],
        Motivation: ["یادگیری", "رشد_فردی"],
        Age: "۳۶–۵۰",
        length: 328,
      },
      {
        id: 7,
        title: "گورستان کتاب‌های فراموش‌شده",
        description: "رمانی پرهیجان و عاشقانه در دنیایی مرموز.",
        authorId: 9,
        publish_date: new Date("2001-01-01"),
        Genre: ["فانتزی", "ادبیات"],
        mood: ["پرهیجان"],
        Motivation: ["سرگرمی"],
        Age: "۳۶–۵۰",
        length: 480,
      },
      {
        id: 8,
        title: "غرور و تعصب",
        description: "رمانی عاشقانه درباره طبقه اجتماعی و روابط انسانی.",
        authorId: 10,
        publish_date: new Date("1813-01-01"),
        Genre: ["رمانتیک", "ادبیات"],
        mood: ["احساس_خوب"],
        Motivation: ["سرگرمی"],
        Age: "۳۶–۵۰",
        length: 300,
      },
      {
        id: 9,
        title: "در خدمت و خیانت روشنفکران",
        description: "تحلیلی درباره نقش روشنفکر در جامعه ایران.",
        authorId: 1,
        publish_date: new Date("1963-01-01"),
        Genre: ["معلوماتی"],
        mood: ["آرام"],
        Motivation: ["یادگیری"],
        Age: "۳۶–۵۰",
        length: 150,
      },
      {
        id: 10,
        title: "دیوان شاملو",
        description: "مجموعه‌ای از اشعار عاشقانه و اجتماعی.",
        authorId: 4,
        publish_date: new Date("1990-01-01"),
        Genre: ["ادبیات"],
        mood: ["احساسی"],
        Motivation: ["سرگرمی"],
        Age: "۲۶–۳۵",
        length: 400,
      },
    ],
  });

  // -----------------------
  // Users
  // -----------------------
  await prisma.user.createMany({
    data: [
      {
        id: 1,
        name: "الیاس",
        gender: "مذکر",
        email: "elyas@example.com",
        passwordHash: await hashPassword("pass1"),
        role: "user",
        Genre: ["ادبیات", "توسعه_فردی"],
        mood: "آرام",
        Motivation: ["یادگیری"],
        Age: "۱۸–۲۵",
        author: [1, 6],
        book_length: ["کوتاه", "متوسط"],
        recommendedBooksIds: [1, 3, 6],
      },
      {
        id: 2,
        name: "سمانه",
        gender: "مونث",
        email: "samane@example.com",
        passwordHash: await hashPassword("pass2"),
        role: "user",
        Genre: ["رمانتیک", "داستان"],
        mood: "احساس_خوب",
        Motivation: ["سرگرمی"],
        Age: "۱۸–۲۵",
        author: [10],
        book_length: ["متوسط"],
        recommendedBooksIds: [8],
      },
      {
        id: 3,
        name: "حمید",
        gender: "مذکر",
        email: "hamid@example.com",
        passwordHash: await hashPassword("pass3"),
        role: "admin",
        Genre: ["معلوماتی", "تاریخی"],
        mood: "معلوماتی",
        Motivation: ["یادگیری"],
        Age: "۲۶–۳۵",
        author: [5, 7],
        book_length: ["بلند"],
        recommendedBooksIds: [5, 6],
      },
    ],
  });

  // -----------------------
  // Favorites
  // -----------------------
  await prisma.favorite.createMany({
    data: [
      { id: 1, userId: 1, bookId: 1 },
      { id: 2, userId: 1, bookId: 3 },
      { id: 3, userId: 2, bookId: 8 },
      { id: 4, userId: 3, bookId: 6 },
    ],
  });

  // -----------------------
  // Reading Progress
  // -----------------------
  await prisma.reading_Progress.createMany({
    data: [
      { id: 1, userId: 1, bookId: 1, lastPage: 50 },
      { id: 2, userId: 1, bookId: 3, lastPage: 60 },
      { id: 3, userId: 2, bookId: 8, lastPage: 120 },
      { id: 4, userId: 3, bookId: 6, lastPage: 200 },
    ],
  });

  console.log("🌱 Full development seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
