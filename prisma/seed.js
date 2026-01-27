import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

async function seedAdmin() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log("⚠️ Admin already exists. Skipping.");
    return;
  }

  const hashed = await hashPassword(ADMIN_PASSWORD);

  await prisma.user.create({
    data: {
      name: "admin",
      email: ADMIN_EMAIL,
      passwordHash: hashed,
      role: "admin",

      gender: "مذکر",
      mood: null,
      Motivation: [],
      Age: "۱۸–۲۵",
      author: [],
      book_length: [],
      recommendedBooksIds: [],
      categories: ["educational"],
    },
  });

  console.log("✅ Admin user created.");
}

async function main() {
  console.log("🌱 Seeding database...");
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

  // 🔑 ALWAYS seed admin (both prod & dev)
  await seedAdmin();

  // 🚀 PRODUCTION → STOP HERE
  if (process.env.NODE_ENV === "production") {
    console.log("🚀 Production mode — only admin seeded.");
    return;
  }

  // 🛠 DEVELOPMENT → FULL SEED
  console.log("🛠 Development mode — full seed.");

  const authorsData = [
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
  ];

  const booksData = [
    { id: 1, title: "بوف کور", description: "رمانی نمادین و فلسفی درباره تاریکی ذهن انسان.", authorId: 2, publish_date: new Date("1937-01-01"), category: "literature", mood: ["احساسی"], Motivation: ["سرگرمی"], Age: "۱۲–۱۷", length: 220 },
    { id: 2, title: "کلیدر", description: "حماسه‌ای ایرانی.", authorId: 3, publish_date: new Date("1978-01-01"), category: "literature", mood: ["پرهیجان"], Motivation: ["یادگیری"], Age: "۱۲–۱۷", length: 1200 },
    { id: 3, title: "کیمیایی", description: "رمانی الهام‌بخش.", authorId: 6, publish_date: new Date("1988-01-01"), category: "self_growth", mood: ["الهام_بخش"], Motivation: ["رشد_فردی"], Age: "۱۸–۲۵", length: 200 },
    // ... (rest unchanged)
  ];

  const usersData = [
    {
      id: 1,
      name: "الیاس",
      gender: "مذکر",
      email: "elyas@example.com",
      passwordHash: await hashPassword("pass1"),
      role: "user",
      categories: ["literature"],
      mood: "آرام",
      Motivation: ["یادگیری"],
      Age: "۱۸–۲۵",
      author: [1, 6],
      book_length: ["کوتاه"],
      recommendedBooksIds: [1, 3],
    },
  ];

  const favoritesData = [
    { id: 1, userId: 1, bookId: 1 },
  ];

  const readingProgressData = [
    { id: 1, userId: 1, bookId: 1, lastPage: 50 },
  ];

  await prisma.author.createMany({ data: authorsData, skipDuplicates: true });
  await prisma.book.createMany({ data: booksData, skipDuplicates: true });
  await prisma.user.createMany({ data: usersData, skipDuplicates: true });
  await prisma.favorite.createMany({ data: favoritesData, skipDuplicates: true });
  await prisma.reading_Progress.createMany({
    data: readingProgressData,
    skipDuplicates: true,
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
