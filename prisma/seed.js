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

    const hashed = await hashPassword("admin123");

    await prisma.user.create({
      data: {
        name: "admin",
        email: "admin@gmail.com",
        passwordHash: hashed,
        role: "admin",

        // Required fields
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
    return; // STOP HERE IN PRODUCTION
  }

  // ============================================================
  // 🛠 DEVELOPMENT MODE — FULL SEED
  // ============================================================
  console.log("🛠 Development mode — full database seed.");

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
    { id: 1, title: "بوف کور", description: "رمانی نمادین و فلسفی درباره تاریکی ذهن انسان.", authorId: 2, publish_date: new Date("1937-01-01"), category: "literature", mood: ["احساسی", "احساس_خوب"], Motivation: ["سرگرمی", "یادگیری"], Age: "۱۲–۱۷", length: 220 },
    { id: 2, title: "کلیدر", description: "حماسه‌ای ایرانی با نثری قدرتمند و شخصیت‌پردازی عمیق.", authorId: 3, publish_date: new Date("1978-01-01"), category: "literature", mood: ["پرهیجان"], Motivation: ["یادگیری", "رشد_فردی"], Age: "۱۲–۱۷", length: 1200 },
    { id: 3, title: "کیمیایی", description: "رمانی الهام‌بخش درباره جستجوی هدف و معنی زندگی.", authorId: 6, publish_date: new Date("1988-01-01"), category: "self_growth", mood: ["الهام_بخش"], Motivation: ["رشد_فردی"], Age: "۱۸–۲۵", length: 200 },
    { id: 4, title: "بیگانه", description: "رمانی اگزیستانسیالیستی درباره پوچی و بیگانگی انسان.", authorId: 5, publish_date: new Date("1942-01-01"), category: "literature", mood: ["آرام"], Motivation: ["یادگیری"], Age: "۲۶–۳۵", length: 160 },
    { id: 5, title: "جنایت و مکافات", description: "بررسی عمیق وجدان، اخلاق و روان انسان.", authorId: 7, publish_date: new Date("1866-01-01"), category: "literature", mood: ["احساسی", "پرهیجان"], Motivation: ["یادگیری"], Age: "۵۰+", length: 700 },
    { id: 6, title: "1984", description: "رمانی دیستوپیایی درباره کنترل ذهن و آزادی.", authorId: 8, publish_date: new Date("1949-01-01"), category: "literature", mood: ["معلوماتی"], Motivation: ["یادگیری", "رشد_فردی"], Age: "۳۶–۵۰", length: 328 },
    { id: 7, title: "گورستان کتاب‌های فراموش‌شده", description: "رمانی پرهیجان و عاشقانه در دنیایی مرموز.", authorId: 9, publish_date: new Date("2001-01-01"), category: "literature", mood: ["پرهیجان"], Motivation: ["سرگرمی"], Age: "۳۶–۵۰", length: 480 },
    { id: 8, title: "غرور و تعصب", description: "رمانی عاشقانه درباره طبقه اجتماعی و روابط انسانی.", authorId: 10, publish_date: new Date("1813-01-01"), category: "literature", mood: ["احساس_خوب"], Motivation: ["سرگرمی"], Age: "۳۶–۵۰", length: 300 },
    { id: 9, title: "در خدمت و خیانت روشنفکران", description: "تحلیلی درباره نقش روشنفکر در جامعه ایران.", authorId: 1, publish_date: new Date("1963-01-01"), category: "educational", mood: ["آرام"], Motivation: ["یادگیری"], Age: "۳۶–۵۰", length: 150 },
    { id: 10, title: "دیوان شاملو", description: "مجموعه‌ای از اشعار عاشقانه و اجتماعی.", authorId: 4, publish_date: new Date("1990-01-01"), category: "literature", mood: ["احساسی"], Motivation: ["سرگرمی"], Age: "۲۶–۳۵", length: 400 },
    // New books added for additional cases (ids 11-15)
    { id: 11, title: "زبانِ نو", description: "مجموعه‌ای آموزشی برای یادگیری زبان و مهارت‌های ارتباطی.", authorId: 1, publish_date: new Date("2010-01-01"), category: "educational", mood: ["معلوماتی"], Motivation: ["یادگیری"], Age: "۱۸–۲۵", length: 120 },
    { id: 12, title: "شعرِ تازه", description: "مجموعه‌ای نو از شعر معاصرِ فارسی.", authorId: 4, publish_date: new Date("2015-01-01"), category: "poetry", mood: ["احساسی"], Motivation: ["سرگرمی"], Age: "۲۶–۳۵", length: 90 },
    { id: 13, title: "جادوی خیال", description: "داستانی فانتزی و ماجراجویانه برای مخاطبانِ جوان.", authorId: 9, publish_date: new Date("2005-01-01"), category: "fantasy", mood: ["پرهیجان"], Motivation: ["سرگرمی"], Age: "۱۲–۱۷", length: 350 },
    { id: 14, title: "تاریخِ کوتاهِ ایران", description: "خلاصه‌ای از رویدادهای مهم تاریخی ایران برای مطالعه سریع.", authorId: 3, publish_date: new Date("2000-01-01"), category: "history", mood: ["معلوماتی"], Motivation: ["یادگیری"], Age: "۳۶–۵۰", length: 200 },
    { id: 15, title: "راهنمای رشد فردی", description: "مجموعه‌ای عملی برای توسعه مهارت‌های فردی و هدف‌گذاری.", authorId: 6, publish_date: new Date("2018-01-01"), category: "self_growth", mood: ["الهام_بخش"], Motivation: ["رشد_فردی"], Age: "۱۸–۲۵", length: 180 },
  ];

  const usersData = [
    { id: 1, name: "الیاس", gender: "مذکر", email: "elyas@example.com", passwordHash: await hashPassword("pass1"), role: "user", categories: ["literature", "self_growth"], mood: "آرام", Motivation: ["یادگیری"], Age: "۱۸–۲۵", author: [1, 6], book_length: ["کوتاه", "متوسط"], recommendedBooksIds: [1, 3, 6, 15] },
    { id: 2, name: "سمانه", gender: "مونث", email: "samane@example.com", passwordHash: await hashPassword("pass2"), role: "user", categories: ["literature"], mood: "احساس_خوب", Motivation: ["سرگرمی"], Age: "۱۸–۲۵", author: [10], book_length: ["متوسط"], recommendedBooksIds: [8, 12] },
    { id: 3, name: "حمید", gender: "مذکر", email: "hamid@example.com", passwordHash: await hashPassword("pass3"), role: "admin", categories: ["educational", "literature"], mood: "معلوماتی", Motivation: ["یادگیری"], Age: "۲۶–۳۵", author: [5, 7], book_length: ["بلند"], recommendedBooksIds: [5, 6, 14] },
    // New user to exercise new book cases
    { id: 4, name: "نسترن", gender: "مونث", email: "nastaran@example.com", passwordHash: await hashPassword("pass4"), role: "user", categories: ["educational", "poetry"], mood: "معلوماتی", Motivation: ["یادگیری", "سرگرمی"], Age: "۱۸–۲۵", author: [1,4], book_length: ["کوتاه"], recommendedBooksIds: [11, 12] },
  ];

  const favoritesData = [
    { id: 1, userId: 1, bookId: 1 },
    { id: 2, userId: 1, bookId: 3 },
    { id: 3, userId: 2, bookId: 8 },
    { id: 4, userId: 3, bookId: 6 },
    { id: 5, userId: 4, bookId: 11 },
  ];

  const readingProgressData = [
    { id: 1, userId: 1, bookId: 1, lastPage: 50 },
    { id: 2, userId: 1, bookId: 3, lastPage: 60 },
    { id: 3, userId: 2, bookId: 8, lastPage: 120 },
    { id: 4, userId: 3, bookId: 6, lastPage: 200 },
    { id: 5, userId: 4, bookId: 11, lastPage: 30 },
  ];

  // Create authors, books, users, favorites, and reading progress
  await prisma.author.createMany({ data: authorsData, skipDuplicates: true });
  await prisma.book.createMany({ data: booksData, skipDuplicates: true });
  await prisma.user.createMany({ data: usersData, skipDuplicates: true });
  await prisma.favorite.createMany({ data: favoritesData, skipDuplicates: true });
  await prisma.reading_Progress.createMany({ data: readingProgressData, skipDuplicates: true });

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
