#!/usr/bin/env node
/*
  Seed an admin user into MongoDB.
  Reads env vars:
    - MONGODB_URI (required)
    - MONGODB_DB (optional; defaults to 'nyaltx')
    - ADMIN_USERNAME (optional; defaults to 'admin')
    - ADMIN_EMAIL (optional; defaults to 'admin@example.com')
    - ADMIN_PASSWORD (optional; defaults to 'admin123' for dev)

  Run: npm run seed:admin
*/

// Load environment variables from .env
require('dotenv').config();

const crypto = require('crypto');
const { MongoClient } = require('mongodb');

const ITERATIONS = 310000;
const DIGEST = 'sha256';

function b64(buf) {
  return buf.toString('base64');
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITERATIONS, 32, DIGEST, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `pbkdf2$${DIGEST}$${ITERATIONS}$${b64(salt)}$${b64(derived)}`;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'nyaltx';
  if (!uri) {
    console.error('MONGODB_URI is required. Set it in your environment or .env file.');
    process.exit(1);
  }

  const username = (process.env.ADMIN_USERNAME || 'admin').trim();
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').trim();
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const usernameLower = username.toLowerCase();
  const emailLower = email.toLowerCase();

  const passwordHash = await hashPassword(password);

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');

    console.log(`[seed] Using DB: ${dbName}`);

    // Ensure helpful indexes (safe to call repeatedly)
    await users.createIndex({ role: 1, usernameLower: 1 });
    await users.createIndex({ role: 1, emailLower: 1 });
    await users.createIndex({ usernameLower: 1 }, { unique: false });
    await users.createIndex({ emailLower: 1 }, { unique: false });

    const now = new Date();
    const update = {
      $setOnInsert: { createdAt: now },
      $set: {
        role: 'admin',
        username,
        usernameLower,
        email,
        emailLower,
        passwordHash, // always refresh to match ADMIN_PASSWORD
        updatedAt: now,
      },
    };

    const res = await users.updateOne(
      { role: 'admin', $or: [ { usernameLower }, { emailLower } ] },
      update,
      { upsert: true }
    );

    if (res.upsertedCount || res.matchedCount) {
      console.log('✅ Admin user seeded/updated:');
      console.log(`  username: ${username}`);
      console.log(`  email:    ${email}`);
      console.log('  Note: password set from ADMIN_PASSWORD (or default).');
    } else {
      console.log('No changes applied.');
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
