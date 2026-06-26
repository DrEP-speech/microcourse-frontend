require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME   = process.env.MONGO_DBNAME || "microcourse";

(async () => {
  try {
    await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
    const email = "owner@example.com";
    const pass  = "ChangeMe123?";
    const hash = bcrypt.hashSync(pass, 10);

    await User.updateOne(
      { email },
      { $set: { email, password: hash, role: "owner" } },
      { upsert: true }
    );

    console.log("Owner ready:", email);
    process.exit(0);
  } catch (e) { console.error(e); process.exit(1); }
})();
