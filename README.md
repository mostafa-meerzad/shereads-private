# She Reads Project

Next.js + Tailwind CSS + Prisma (MySQL) project for the online book-reading platform.
This guide will get you running locally.

---

## Project Setup 

## 1. Clone the repository

```bash
git clone <your-repo-url>
cd she-reads-project
```

## 2. Install dependencies

```bash
npm install
```

## 3. Setup environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
```

Replace the placeholders with your MySQL credentials.

---

## 4. Setup database with Prisma

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev --name init
```

---

## 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 Note

* If you add new Prisma models, run:

```bash
npx prisma generate
npx prisma migrate dev --name <migration_name>
```

