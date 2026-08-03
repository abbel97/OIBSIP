require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const createAdmin = async () => {
  await connectDB();

  const {ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD} = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${existing.email}`);
    await mongoose.connection.close();
    return process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    role: 'admin',
    isVerified: true,
  });

  console.log(`Admin account created: ${admin.email}`);
  await mongoose.connection.close();
  process.exit(0);
};

createAdmin().catch((err) => {
  console.error('Admin creation failed:', err);
  process.exit(1);
});