// Copies every document from a source MongoDB to a target MongoDB,
// preserving _id so relationships between users, pets and applications
// survive the move intact.
//
// Usage:
//   SOURCE=mongodb://127.0.0.1:27017/pet_adoption \
//   TARGET=<atlas-uri> node src/scripts/migrate.js
//
// The target collections are emptied first so re-running is safe.

require("dotenv").config();
require("../config/dns");

const mongoose = require("mongoose");

const COLLECTIONS = ["users", "pets", "applications"];

// Mongoose indexes are not copied along with the documents, so they are
// declared here and built on the target afterwards.
const INDEXES = [
  {
    collection: "users",
    keys: { email: 1 },
    options: { unique: true, name: "email_1" },
  },
  {
    collection: "pets",
    keys: { species: 1, status: 1 },
    options: { name: "species_1_status_1" },
  },
  {
    collection: "applications",
    keys: { user: 1, pet: 1 },
    options: { name: "user_1_pet_1" },
  },
  {
    collection: "applications",
    keys: { createdAt: -1 },
    options: { name: "createdAt_-1" },
  },
];

async function main() {
  const source = process.env.SOURCE;
  const target = process.env.TARGET || process.env.MONGO_URI;

  if (!source || !target) {
    throw new Error("Both SOURCE and TARGET are required");
  }
  if (source === target) {
    throw new Error("SOURCE and TARGET point at the same database");
  }

  const from = mongoose.createConnection(source, { serverSelectionTimeoutMS: 10000 });
  const to = mongoose.createConnection(target, { serverSelectionTimeoutMS: 20000 });

  await Promise.all([from.asPromise(), to.asPromise()]);

  // A URI with no path connects to the "test" database by default, which
  // is an easy mistake to make and a confusing one to debug later.
  const name = to.name;
  if (name === "test" || name === "admin") {
    await Promise.all([from.close(), to.close()]);
    throw new Error(`Target resolved to the "${name}" database. Add /pet_adoption to the URI.`);
  }

  console.log(`Source: ${from.name}`);
  console.log(`Target: ${name}`);

  for (const name of COLLECTIONS) {
    const docs = await from.db.collection(name).find({}).toArray();

    // Wipe first. Without this a re-run would hit duplicate key errors
    // on the unique email index.
    await to.db.collection(name).deleteMany({});

    if (docs.length) {
      await to.db.collection(name).insertMany(docs, { ordered: true });
    }
    console.log(`  ${name.padEnd(14)} ${docs.length} document(s)`);
  }

  for (const { collection, keys, options } of INDEXES) {
    await to.db.collection(collection).createIndex(keys, options);
    console.log(`  index on ${collection}: ${JSON.stringify(keys)}`);
  }

  await Promise.all([from.close(), to.close()]);
  console.log("\nMigration complete");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nMigration failed:", err.message);
    process.exit(1);
  });