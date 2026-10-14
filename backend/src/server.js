require("dotenv").config();
require("./config/dns");

const bcrypt = require("bcryptjs");
const app = require("./app");
const connectDB = require("./config/db");
const User = require("./models/User");
const { describeMailer } = require("./services/mailer");

const PORT = process.env.PORT || 5000;

async function makeSureAdminExists() {
  const email = (process.env.ADMIN_EMAIL || "admin@shelter.com").toLowerCase();
  const found = await User.findOne({ email });
  if (found) return;
  const hashed = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "admin123",
    10,
  );
  await User.create({
    name: "Shelter Admin",
    email,
    password: hashed,
    role: "admin",
  });
  console.log("Seeded admin:", email);
}

async function start() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pet_adoption";
  await connectDB(uri);
  await makeSureAdminExists();
  console.log(`[mail] transport: ${await describeMailer()}`);
  app.listen(PORT, () =>
    console.log(`Backend running on http://localhost:${PORT}`),
  );
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
