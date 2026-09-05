require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "Connected to MongoDB"
    );

    const email =
      process.env.ADMIN_EMAIL;

    const password =
      process.env.ADMIN_PASSWORD;

    const name =
      process.env.ADMIN_NAME ||
      "Campus FM Admin";

    if (!email || !password) {
      console.error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required in .env"
      );

      process.exit(1);
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      console.log(
        "Admin already exists."
      );

      process.exit(0);
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();

    console.log(
      "Admin account created successfully."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Admin creation failed:",
      error
    );

    process.exit(1);
  }
};

createAdmin();