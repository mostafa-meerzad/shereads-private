import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ============================
  //  Authors
  // ============================
  const authors = await prisma.author.createMany({
    data: [
      { id: 1, name: "جلال آل‌احمد", biography: "نویسنده و روشنفکر ایرانی، صاحب آثار متعدد در حوزه داستان و جامعه‌شناسی." },
      { id: 2, name: "صادق هدایت", biography: "نویسنده مطرح ایرانی با سبک مدرن و تفکر فلسفی." },
      { id: 3, name: "محمود دولت‌آبادی", biography: "نویسنده برجسته رمان‌های اجتماعی و واقع‌گرا." },
      { id: 4, name: "احمد شاملو", biography: "شاعر، نویسنده و نظریه‌پرداز ادبی." },
      { id: 5, name: "ژان پل سارتر", biography: "فیلسوف و نویسنده فرانسوی؛ بنیان‌گذار مکتب اگزیستانسیالیسم." },
      { id: 6, name: "پائولو کوئیلو", biography: "نویسنده محبوب برزیلی با آثار الهام‌بخش." },
      { id: 7, name: "داستايفسکی", biography: "نویسنده مشهور روس با رمان‌های عمیق روانشناختی." },
      { id: 8, name: "اورول", biography: "نویسنده انگلیسی، خالق آثار دیستوپیایی." },
      { id: 9, name: "نیل گیمن", biography: "نویسنده انگلیسی ژانر فانتزی و تخیلی." },
      { id: 10, name: "جین آستن", biography: "نویسنده انگلیسی ژانر رمانتیک و اجتماعی." }
    ],
  });

  // ============================
  //  Books
  // ============================
  const books = await prisma.book.createMany({
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
        length: 220
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
        length: 1200
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
        length: 200
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
        length: 160
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
        length: 700
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
        length: 328
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
        length: 480
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
        length: 300
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
        length: 150
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
        length: 400
      }
    ]
  });

  // ============================
  //  Users
  // ============================
  const users = await prisma.user.createMany({
    data: [
      {
        id: 1,
        name: "الیاس",
        gender: "مذکر",
        email: "elyas@example.com",
        passwordHash: "hashed_pass",
        role: "user",
        Genre: ["ادبیات", "توسعه_فردی"],
        mood: "آرام",
        Motivation: ["یادگیری"],
        Age: "۱۸–۲۵",
        author: [1, 6],
        book_length: ["کوتاه", "متوسط"],
        recommendedBooksIds: [1, 3, 6]
      },
      {
        id: 2,
        name: "سمانه",
        gender: "مونث",
        email: "samane@example.com",
        passwordHash: "pass",
        role: "user",
        Genre: ["رمانتیک", "داستان"],
        mood: "احساس_خوب",
        Motivation: ["سرگرمی"],
        Age: "۱۸–۲۵",
        author: [10],
        book_length: ["متوسط"],
        recommendedBooksIds: [8]
      },
      {
        id: 3,
        name: "حمید",
        gender: "مذکر",
        email: "hamid@example.com",
        passwordHash: "x",
        role: "admin",
        Genre: ["معلوماتی", "تاریخی"],
        mood: "معلوماتی",
        Motivation: ["یادگیری"],
        Age: "۲۶–۳۵",
        author: [5, 7],
        book_length: ["بلند"],
        recommendedBooksIds: [5, 6]
      },
      {
        id: 4,
        name: "نرگس",
        gender: "مونث",
        email: "narges@example.com",
        passwordHash: "x",
        role: "user",
        Genre: ["فانتزی"],
        mood: "پرهیجان",
        Motivation: ["سرگرمی"],
        Age: "۳۶–۵۰",
        author: [9],
        book_length: ["بلند"],
        recommendedBooksIds: [7]
      },
      {
        id: 5,
        name: "مهیار",
        gender: "مذکر",
        email: "mahiyar@example.com",
        passwordHash: "x",
        role: "user",
        Genre: ["ادبیات", "بیوگرافی"],
        mood: "الهام_بخش",
        Motivation: ["رشد_فردی"],
        Age: "۳۶–۵۰",
        author: [6, 3],
        book_length: ["متوسط", "بلند"],
        recommendedBooksIds: [3, 10]
      }
    ]
  });

  // ============================
  // Favorites
  // ============================
  const favorites = await prisma.favorite.createMany({
    data: [
      { id: 1, userId: 1, bookId: 1 },
      { id: 2, userId: 1, bookId: 3 },
      { id: 3, userId: 2, bookId: 8 },
      { id: 4, userId: 3, bookId: 6 }
    ]
  });

  // ============================
  // Reading Progress
  // ============================
  const progress = await prisma.reading_Progress.createMany({
    data: [
      { id: 1, userId: 1, bookId: 1, lastPage: 50 },
      { id: 2, userId: 1, bookId: 3, lastPage: 60 },
      { id: 3, userId: 2, bookId: 8, lastPage: 120 },
      { id: 4, userId: 3, bookId: 6, lastPage: 200 }
    ]
  });

  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
