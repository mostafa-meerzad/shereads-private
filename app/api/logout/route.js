import { NextResponse } from "next/server";
export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" });

    // Destroy JWT cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });

    // If you have refreshToken cookie:
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });

    // If you use session cookies:
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Logout failed:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}