import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

async function seedCategories() {
  const parents = [
    { name: "کتاب‌های تعلیمی" },
    { name: "آمادگی کانکور" },
    { name: "کتاب‌های زبان آموزی" },
    { name: "مهارت‌های زندگی و فنی" },
    { name: "رشد فردی و روان‌شناسی" },
    { name: "ادبیات و فرهنگ" },
  ];

  const subCategories = {
    "کتاب‌های تعلیمی": [
      "صنف اول",
      "صنف دوم",
      "صنف سوم",
      "صنف چهارم",
      "صنف پنجم",
      "صنف ششم",
      "صنف هفتم",
      "صنف هشتم",
      "صنف نهم",
      "صنف دهم",
      "صنف یازدهم",
      "صنف دوازدهم",
    ],
    "رشد فردی و روان‌شناسی": [
      "رشد فردی و موفقیت",
      "سلامت روان",
      "روابط و ارتباطات",
    ],
    "ادبیات و فرهنگ": [
      "رمان و داستان",
      "شعر",
      "ادبیات کلاسیک و معاصر",
    ],
  };

  for (const parent of parents) {
    const existing = await prisma.category.findFirst({ where: { name: parent.name, parentId: null } });
    if (existing) continue;

    const created = await prisma.category.create({ data: { name: parent.name } });

    const subs = subCategories[parent.name];
    if (subs) {
      await prisma.category.createMany({
        data: subs.map((name) => ({ name, parentId: created.id })),
        skipDuplicates: true,
      });
    }
  }

  console.log("✅ Categories seeded.");
}

async function seedAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: "admin@shereads.af" } });
  if (existing) {
    console.log("⚠️  Admin already exists. Skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash("shereads@admin", SALT_ROUNDS);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@shereads.af",
      passwordHash,
      role: "admin",
      gender: "مذکر",
      categories: [],
      Motivation: [],
      author: [],
      book_length: [],
      recommendedBooksIds: [],
    },
  });

  console.log("✅ Admin user created.");
}

async function main() {
  console.log("🌱 Seeding database...");
  await seedCategories();
  await seedAdmin();
  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
