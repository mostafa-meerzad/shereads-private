import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyApiRequest } from "@/lib/serverAuth";
import { UserEditSchema } from "@/app/services/userEditSchema";
import { hashPassword } from "@/lib/auth";

export async function GET(req, { params }) {
  verifyApiRequest();
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
  try {
    const awaitedParams = await params;
    const id = awaitedParams.id;
    const body = await req.json();

    // Validate only provided fields
    const parsed = UserEditSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const dataToUpdate = {};

    const { name, gender, email, password, Age } = parsed.data;

    // --- Conditionally add fields to update ----
    if (name !== undefined) dataToUpdate.name = name;
    if (gender !== undefined) dataToUpdate.gender = gender;
    if (Age !== undefined) dataToUpdate.Age = Age;

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
        Age: true,
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
