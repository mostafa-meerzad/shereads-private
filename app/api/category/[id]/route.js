import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { enforceAdminApi } from "@/lib/adminAuth";
import z from "zod";

const UpdateCategorySchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است"),
});

// PATCH /api/category/[id] — rename a category (admin only)
export async function PATCH(req, { params }) {
  const admin = await enforceAdminApi();
  if (admin instanceof NextResponse) return admin;
  try {
    const { id } = await params;
    const catId = Number(id);
    if (!catId || isNaN(catId)) {
      return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = UpdateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id: catId },
      data: { name: parsed.data.name },
    });
    return NextResponse.json(category);
  } catch (err) {
    console.error("PATCH category error:", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/category/[id] — delete a category (admin only)
export async function DELETE(req, { params }) {
  const admin = await enforceAdminApi();
  if (admin instanceof NextResponse) return admin;
  try {
    const { id } = await params;
    const catId = Number(id);
    if (!catId || isNaN(catId)) {
      return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 });
    }

    // Guard: can't delete if books are assigned
    const bookCount = await prisma.book.count({ where: { categoryId: catId } });
    if (bookCount > 0) {
      return NextResponse.json(
        { error: `این دسته‌بندی دارای ${bookCount} کتاب است. ابتدا کتاب‌ها را جابجا کنید.` },
        { status: 409 }
      );
    }

    // Guard: can't delete parent if it has children
    const childCount = await prisma.category.count({ where: { parentId: catId } });
    if (childCount > 0) {
      return NextResponse.json(
        { error: `این دسته‌بندی دارای ${childCount} زیرشاخه است. ابتدا زیرشاخه‌ها را حذف کنید.` },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id: catId } });
    return NextResponse.json({ message: "دسته‌بندی حذف شد" });
  } catch (err) {
    console.error("DELETE category error:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
