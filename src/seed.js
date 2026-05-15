const { ConnectToDatabase, CloseDatabase } = require('./db');
const devices = require('./devices');

async function Seed() {
  const collection = await ConnectToDatabase();
  await collection.deleteMany({});
  const result = await collection.insertMany(devices);
  console.log(`Inserted ${result.insertedCount} devices.`);
}

Seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(CloseDatabase);