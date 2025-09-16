import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  // Generate a short-lived nonce and set it in an HttpOnly cookie
  const nonce = crypto.randomUUID();

  const res = NextResponse.json({ nonce });
  res.cookies.set({
    name: "admin_login_nonce",
    value: nonce,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });
  return res;
}
