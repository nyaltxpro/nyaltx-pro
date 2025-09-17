import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyMessage } from "viem";
import { AdminCookie, signAdminJWT } from "@/lib/adminAuth";

function getAllowedAdminAddresses(): string[] {
  const csv = "0x77B6321d2888aa62f2A42620852FEe8eeDcfA77b,0x81ba7b98e49014bff22f811e9405640bc2b39cc0";
  return csv
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const { address, signature, nonce, timestamp } = await req.json();
    if (!address || !signature || !nonce) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const cookieNonce = cookieStore.get("admin_login_nonce")?.value;
    if (!cookieNonce || cookieNonce !== nonce) {
      return NextResponse.json({ message: "Invalid or expired nonce" }, { status: 400 });
    }

    const addrLower = String(address).toLowerCase();
    const allowed = getAllowedAdminAddresses();
    if (allowed.length > 0 && !allowed.includes(addrLower)) {
      return NextResponse.json({ message: "Address not allowed" }, { status: 403 });
    }

    const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "nyax-admin";
    const ts = timestamp ? Number(timestamp) : Date.now();

    const message = `NYAX Admin Login\nDomain: ${domain}\nAddress: ${addrLower}\nNonce: ${nonce}\nTimestamp: ${ts}`;

    const ok = await verifyMessage({
      address: addrLower as `0x${string}`,
      message,
      signature,
    });

    if (!ok) {
      return NextResponse.json({ message: "Signature verification failed" }, { status: 401 });
    }

    const token = await signAdminJWT({ address: addrLower });
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
    // clear nonce cookie
    res.cookies.set({ name: "admin_login_nonce", value: "", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });

    return res;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("admin wallet login error", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
