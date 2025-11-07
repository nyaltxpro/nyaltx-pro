import { getDb } from '@/lib/mongodb';

export default async function testNews() {
  try {
    const db = await getDb();
    const collection = db.collection('corporate_news');

    // Count total documents
    const total = await collection.countDocuments();
    console.log(`Total news articles in database: ${total}`);

    // Get a few sample articles
    const news = await collection.find({}).limit(5).toArray();
    console.log('Sample news articles:', news);

    return { total, news };
  } catch (error) {
    console.error('Error testing news:', error);
    return { error: error.message };
  }
}
