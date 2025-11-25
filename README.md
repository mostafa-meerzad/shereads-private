# She Reads Project

Next.js + Tailwind CSS + Prisma (MySQL) project for the online book-reading platform.
This guide will get you running locally and describes the newly added Admin Panel and the backend endpoints it expects.

---

## Project Setup 

## 1. Clone the repository

```bash
git clone https://github.com/Webistan-cloud/shereads.git
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

---

## Admin Panel (Frontend)

The app includes a role-gated Admin Panel that is only visible to users with `role = "admin"`.

- Access: A button labeled "پنل ادمین" appears in the sidebar for admin users. Clicking it opens `/admin`.
- Tabs:
  - کاربران: Manage users (search, soft-delete, reset password)
  - کتاب‌ها: Manage books (list/search, soft-delete, create new book with uploads)
- UI aligns with the existing RTL emerald theme and is responsive.

### Admin Frontend → Expected Backend APIs

The following endpoints are expected by the admin UI. Implement them on the backend to enable full functionality.

All protected endpoints should validate the caller is an admin (e.g., via JWT) and return `401/403` when unauthorized.

#### Users

1) GET `/api/admin/users?page=1&search=`
- Returns a paginated list of users (excluding password hash).
- Response:
```
{
  "page": 1,
  "limit": 20,
  "total": 123,
  "totalPages": 7,
  "users": [
    { "id": 1, "name": "...", "email": "...", "role": "admin"|"user", "deletedAt": null }
  ]
}
```

2) PATCH `/api/admin/users/:id/soft-delete`
- Soft deletes a user by setting `deletedAt = new Date()` (do not hard delete rows).
- Response: `{ success: true }`.

3) PATCH `/api/admin/users/:id/password`
- Body: `{ password: string (min 6) }`
- Hash the password and update `passwordHash`.
- Response: `{ success: true }`.

#### Books

1) GET `/api/book?page=1&limit=20&title=...`
- Already implemented in this repo; used by admin list view.

2) POST `/api/admin/books` (multipart/form-data)
- Creates a new book and uploads files. FormData fields:
  - `title`: string (required)
  - `description`: string (optional)
  - `publish_date`: string (YYYY-MM-DD) optional
  - `author`: string (required) — if your schema has an `author` relation, resolve/attach it accordingly
  - `cover`: image/* file (optional)
  - `pdf`: application/pdf file (required)
- File storage: Save under Next.js `public/` directory so they are accessible at `/<filename>`.
- Filenames MUST be unique. Recommended format:
  - `yyyyMMddHHmmss-<random6>-<slugified-originalname>.<ext>`
  - Alternatively use UUID v4 + timestamp.
- In DB, store relative web paths (e.g., `/uploads/covers/20251126-abc123-cover.jpg`, `/uploads/pdfs/20251126-def456-book.pdf`).
- Response example:
```
{
  "id": 10,
  "title": "...",
  "description": "...",
  "publish_date": "2025-11-26",
  "coverPath": "/uploads/covers/20251126-abc123-cover.jpg",
  "pdfPath": "/uploads/pdfs/20251126-def456-book.pdf",
  "author": { "id": 7, "name": "..." }
}
```

3) PATCH `/api/admin/books/:id/soft-delete`
- Soft delete by setting `deletedAt` on the Book.
- Response: `{ success: true }`.

### Database expectations

Minimum fields used by the UI:
- User: `id, name, email, role, deletedAt, passwordHash`
- Book: `id, title, description, publish_date, coverPath, pdfPath, authorId, deletedAt`
- Author: `id, name`

If you have different schema names (e.g., `publish_date` vs `publishDate`), normalize in your API.

### File storage under public/

- Ensure folders exist: `public/uploads/covers`, `public/uploads/pdfs`.
- When receiving uploads, write files to those folders and return the public path starting with `/`.
- Do not expose server file system paths, only web paths.

### Security notes

- All admin endpoints must verify the caller has `role = admin`.
- Validate and sanitize filenames; generate unique filenames as described.
- Restrict uploaded file types and sizes (e.g., max 10MB for images, 150MB for PDFs; configurable).

---

## Development Tips

- The PDF reader uses `react-pdf` with a locally bundled worker, and saves per-user/book progress.
- Books in the UI can be served from `public/` using relative paths returned by the backend.

