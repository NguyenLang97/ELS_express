require('dotenv').config();
const mongoose = require('mongoose');

const sourceURI = process.env.MONGO_URI_TEST; // URI của database test
const targetURI = process.env.MONGO_URI_DEV; // URI của database dev

// Kết nối tới database test
const sourceConnection = mongoose.createConnection(sourceURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Kết nối tới database dev
const targetConnection = mongoose.createConnection(targetURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateCollection(collectionName) {
  const sourceCollection = sourceConnection.collection(collectionName);
  const targetCollection = targetConnection.collection(collectionName);

  // Lấy tất cả dữ liệu từ source collection
  const data = await sourceCollection.find().toArray();

  if (data.length > 0) {
    // Chèn dữ liệu vào target collection
    await targetCollection.insertMany(data);
    console.log(`Migrated ${data.length} documents from ${collectionName}`);
  } else {
    console.log(`No data to migrate in ${collectionName}`);
  }
}

async function migrateDatabase() {
  try {
    const collections = await sourceConnection.db.listCollections().toArray();
    for (const { name } of collections) {
      await migrateCollection(name);
    }
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    sourceConnection.close();
    targetConnection.close();
  }
}

migrateDatabase();
