import { MongoClient, Db, Collection, Document } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'nyaltx';

console.log('MongoDB Configuration:', {
  hasUri: !!uri,
  uriPrefix: uri ? uri.substring(0, 20) + '...' : 'NOT SET',
  dbName,
  nodeEnv: process.env.NODE_ENV
});

if (!uri) {
  // Intentionally do not throw at import time to avoid build crashes.
  // The API routes will return a 500 with a clear message if URI is missing.
  // eslint-disable-next-line no-console
  console.warn('MONGODB_URI is not set. API routes depending on DB will fail until it is configured.');
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  
  // For mongodb v6+, there is no public topology API. If we have a cached client, reuse it.
  if (client) return client;
  if (!clientPromise) {
    console.log('Connecting to MongoDB...');
    clientPromise = MongoClient.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }
  
  try {
    client = await clientPromise;
    console.log('MongoDB connected successfully');
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    clientPromise = null; // Reset promise so we can retry
    throw error;
  }
}

export async function getDb(): Promise<Db> {
  const c = await getClient();
  return c.db(dbName);
}

export async function getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}
