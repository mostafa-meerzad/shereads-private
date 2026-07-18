import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyApiRequest } from "@/lib/serverAuth";
import { UserEditSchema } from "@/app/services/userEditSchema";
import { hashPassword } from "@/lib/auth";

export async function GET(req, { params }) {
  const auth = await verifyApiRequest();
  if (auth instanceof NextResponse) return auth;
  try {
    const awaitedParams = await params;
    const userId = Number(awaitedParams.id);

    if (!userId) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        favorites: {
          include: { book: true },
        },
        readingProgress: {
          include: { book: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Exclude passwordHash
    const { passwordHash, ...userSafe } = user;

    return NextResponse.json({ user: userSafe }, { status: 200 });
  } catch (err) {
    console.error("GET User Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const auth = await verifyApiRequest();
  if (auth instanceof NextResponse) return auth;
  try {
    const awaitedParams = await params;
    const id = awaitedParams.id;
    const body = await req.json();

    // Validate only provided fields
    const parsed = UserEditSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.format() }, { status: 400 });
    }

    const dataToUpdate = {};

    const { name, gender, email, password, Age, isActive, role, categories } = parsed.data;

    // --- Conditionally add fields to update ----
    if (name !== undefined) dataToUpdate.name = name;
    if (gender !== undefined) dataToUpdate.gender = gender;
    if (Age !== undefined) dataToUpdate.Age = Age;
    if (isActive !== undefined) dataToUpdate.isActive = isActive; 
    if (role !== undefined) dataToUpdate.role = role;
    if (categories !== undefined) dataToUpdate.categories = categories;

    // Email update with uniqueness check
    if (email !== undefined) {
      const exists = await prisma.user.findFirst({
        where: { email, NOT: { id: Number(id) } },
      });

      if (exists) {
        return Response.json(
          { error: "این ایمیل قبلاً استفاده شده است." },
          { status: 400 }
        );
      }

      dataToUpdate.email = email;
    }

    // Password update
    if (password !== undefined) {
      dataToUpdate.passwordHash = await hashPassword(password);
    }

    // Update
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        role: true,
        isActive: true, 
        Age: true,
        categories: true,
        createdAt: true,
      },
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error("PATCH USER ERROR:", error);
    return Response.json(
      { error: "Failed to update user", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {

  try {
    const awaitedParams = await params;
    const userId = Number(awaitedParams.id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Deactivate user
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: "User deactivated successfully",
      user: updated,
    });
  } catch (error) {
    console.error("DEACTIVATE USER ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
