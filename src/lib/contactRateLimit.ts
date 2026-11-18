import { createHash } from 'crypto';
import { getCollection } from '@/lib/mongodb';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

type ContactRateLimitRecord = {
  count: number;
  expiresAt: Date;
};

let expiryIndexPromise: Promise<string> | null = null;

export async function checkContactRateLimit(ipAddress: string, now = Date.now()) {
  const collection = await getCollection<ContactRateLimitRecord>('contact_rate_limits');

  if (!expiryIndexPromise) {
    expiryIndexPromise = collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  }
  await expiryIndexPromise;

  const windowStart = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  const salt = process.env.CONTACT_RATE_LIMIT_SALT || process.env.SMTP_PASS || 'nyaltx-contact';
  const ipHash = createHash('sha256').update(`${salt}:${ipAddress}`).digest('hex');
  const record = await collection.findOneAndUpdate(
    { _id: `${ipHash}:${windowStart}` },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date(windowStart + WINDOW_MS * 2) },
    },
    { upsert: true, returnDocument: 'after', includeResultMetadata: false }
  );

  return {
    allowed: (record?.count ?? 0) <= MAX_REQUESTS,
    retryAfterSeconds: Math.max(1, Math.ceil((windowStart + WINDOW_MS - now) / 1000)),
  };
}
