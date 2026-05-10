import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { enforceAdminApi } from "@/lib/adminAuth";
import z from "zod";

const CreateCategorySchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است"),
  parentId: z.number().int().positive().optional().nullable(),
});

// GET /api/category — returns flat list of all categories
export async function GET(req) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("GET categories error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/category — create a category (admin only)
export async function POST(req) {
  const admin = await enforceAdminApi();
  if (admin instanceof NextResponse) return admin;
  try {
    const body = await req.json();
    const parsed = CreateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, parentId } = parsed.data;

    // Validate parent exists if parentId provided
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "دسته‌بندی والد یافت نشد" },
          { status: 404 },
        );
      }
      // Only one level of nesting allowed
      if (parent.parentId !== null) {
        return NextResponse.json(
          { error: "زیرشاخه نمی‌تواند زیرشاخه دیگری داشته باشد" },
          { status: 400 },
        );
      }
    }

    const category = await prisma.category.create({
      data: { name, parentId: parentId ?? null },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("POST category error:", err);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
