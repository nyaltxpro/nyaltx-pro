import { cookies } from 'next/headers';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const COOKIE_NAME = 'admin_jwt';
const DEFAULT_TTL_SECONDS = 60 * 60 * 6; // 6 hours

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET || '';
  if (!secret) throw new Error('ADMIN_JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function signAdminJWT(payload: Record<string, any> = {}, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttlSeconds;
  const token = await new SignJWT({ role: 'admin', ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .setSubject('admin')
    .sign(getSecret());
  return token;
}

export async function verifyAdminJWT(token: string): Promise<JWTPayload & { role?: string }> {
  const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'], audience: undefined });
  if (payload.sub !== 'admin' || payload.role !== 'admin') {
    throw new Error('Invalid admin token');
  }
  return payload as any;
}

export async function getAdminFromRequest() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = await verifyAdminJWT(token);
    return payload;
  } catch {
    return null;
  }
}

export const AdminCookie = {
  name: COOKIE_NAME,
  maxAge: DEFAULT_TTL_SECONDS,
};
