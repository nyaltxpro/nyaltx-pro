import { MongoClient, Db, Collection, Document } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'nyaltx';

if (!uri) {
  // Intentionally do not throw at import time to avoid build crashes.
  // The API routes will return a 500 with a clear message if URI is missing.
  // eslint-disable-next-line no-console
  console.warn('MONGODB_URI is not set. API routes depending on DB will fail until it is configured.');
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getClient(): Promise<MongoClient> {
  // For mongodb v6+, there is no public topology API. If we have a cached client, reuse it.
  if (client) return client;
  if (!clientPromise) {
    clientPromise = MongoClient.connect(uri, {});
  }
  client = await clientPromise;
  return client;
}

export async function getDb(): Promise<Db> {
  const c = await getClient();
  return c.db(dbName);
}

export async function getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}
