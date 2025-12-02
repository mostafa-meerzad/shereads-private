import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { LoginSchema } from "@/app/services/loginSchema";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const body = await req.json();

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const { email, password } = parsed.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ایمیل یا رمز عبور نامعتبر است" },
        { status: 401 }
      );
    }

    // Prevent login for deactivated users
    if (user.isActive === false || user.isActive === 0) {
      return NextResponse.json(
        { error: "حساب شما غیرفعال شده است. برای کسب اطلاعات بیشتر با پشتیبانی تماس بگیرید." },
        { status: 403 }
      );
    }

    // Compare password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "ایمیل یا رمز عبور نامعتبر است" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();

    // set token in cookie
    cookieStore.set({
      name: "token",
      value: token,
      path: "/",
      httpOnly: true,
      // Only set Secure in production so cookies work in local dev (http).
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Remove password hash before sending
    const { passwordHash: _, ...userSafe } = user;

    return NextResponse.json(
      {
        user: userSafe,
        token,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
