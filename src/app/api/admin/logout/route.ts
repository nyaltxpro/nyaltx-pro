import { NextResponse } from "next/server";
import { AdminCookie } from "@/lib/adminAuth";

export async function POST() {
  const res = NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL ));
  // Clear JWT cookie
  res.cookies.set({
    name: AdminCookie.name,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  // Clear legacy flag cookie if present
  res.cookies.set({
    name: "admin_auth",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
