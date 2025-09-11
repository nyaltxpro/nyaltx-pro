import { NextResponse } from "next/server";
import { AdminCookie, signAdminJWT } from "@/lib/adminAuth";
import { getCollection } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/passwords";

export async function POST(req: Request) {
  const { identifier, password } = await req.json().catch(() => ({ identifier: "", password: "" }));
  if (!password) {
    return NextResponse.json({ message: "Password required" }, { status: 400 });
  }

  // Try MongoDB user lookup first
  let authed = false;
  try {
    const users = await getCollection<any>('users');
    let user: any | null = null;
    if (identifier && typeof identifier === 'string') {
      const idLower = identifier.toLowerCase();
      user = await users.findOne({ role: 'admin', $or: [ { emailLower: idLower }, { usernameLower: idLower } ] });
    }
    if (user && user.passwordHash) {
      const ok = await verifyPassword(password, user.passwordHash);
      if (ok) authed = true;
    }
  } catch {}

  // Fallback to env password if not authed via DB
  if (!authed) {
    const expected = process.env.ADMIN_PASSWORD || "admin123"; // default for dev
    if (password !== expected) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
  }

  const token = await signAdminJWT({});
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: AdminCookie.name,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AdminCookie.maxAge,
  });
  // Remove legacy cookie if present
  res.cookies.set({ name: "admin_auth", value: "", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
