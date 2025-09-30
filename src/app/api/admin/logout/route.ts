import { NextRequest, NextResponse } from "next/server";
import { AdminCookie } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    // Get the origin from the request headers for proper redirect
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const loginUrl = new URL("/admin/login", origin);
    
    const res = NextResponse.redirect(loginUrl);
    
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
    
    console.log('🚪 Admin logout successful, redirecting to:', loginUrl.toString());
    return res;
  } catch (error) {
    console.error('❌ Admin logout error:', error);
    
    // Fallback: return JSON response if redirect fails
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
    
    // Still clear cookies even if redirect fails
    response.cookies.set({
      name: AdminCookie.name,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    
    response.cookies.set({
      name: "admin_auth",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    
    return response;
  }
}
