import crypto from 'crypto';

const ITERATIONS = 310000; // OWASP recommendation range; adjust for performance
const KEYLEN = 32; // 256-bit key
const DIGEST = 'sha256';

function b64(buf: Buffer) {
  return buf.toString('base64');
}

function fromB64(s: string) {
  return Buffer.from(s, 'base64');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITERATIONS, KEYLEN, DIGEST, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `pbkdf2$${DIGEST}$${ITERATIONS}$${b64(salt)}$${b64(derived)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, algo, itStr, saltB64, hashB64] = stored.split('$');
    if (scheme !== 'pbkdf2' || algo !== DIGEST) return false;
    const it = parseInt(itStr, 10);
    if (!it || !saltB64 || !hashB64) return false;
    const salt = fromB64(saltB64);
    const expected = fromB64(hashB64);
    const derived = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(password, salt, it, expected.length, algo, (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
