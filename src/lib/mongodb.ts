import { MongoClient, Db, Collection, Document } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'nyaltx';

// Only log MongoDB configuration in development or when explicitly needed
if (process.env.NODE_ENV === 'development' && process.env.DEBUG_MONGODB) {
  console.log('MongoDB Configuration:', {
    hasUri: !!uri,
    uriPrefix: uri ? uri.substring(0, 20) + '...' : 'NOT SET',
    dbName,
    nodeEnv: process.env.NODE_ENV,
  });
}

if (!uri && process.env.NODE_ENV !== 'production') {
  // Only warn in non-production environments to avoid build noise
  console.warn(
    'MONGODB_URI is not set. API routes depending on DB will fail until it is configured.'
  );
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getClient(): Promise<MongoClient> {
  // Prevent MongoDB connections during build time
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('MongoDB connections are disabled during build time');
  }

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // For mongodb v6+, there is no public topology API. If we have a cached client, reuse it.
  if (client) return client;
  if (!clientPromise) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Connecting to MongoDB...');
    }
    clientPromise = MongoClient.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  try {
    client = await clientPromise;
    if (process.env.NODE_ENV === 'development') {
      console.log('MongoDB connected successfully');
    }
    return client;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('MongoDB connection error:', error);
    }
    clientPromise = null; // Reset promise so we can retry
    throw error;
  }
}

export async function getDb(): Promise<Db> {
  const c = await getClient();
  return c.db(dbName);
}

export async function getCollection<T extends Document = Document>(
  name: string
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}
