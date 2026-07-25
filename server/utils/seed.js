require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await User.create([
    { name: 'Admin User', email: 'admin@test.com', password: 'admin123', role: 'admin' },
    { name: 'Member One', email: 'member1@test.com', password: 'member123', role: 'member' },
    { name: 'Member Two', email: 'member2@test.com', password: 'member123', role: 'member' }
  ]);
  console.log('Users seeded successfully');
  process.exit();
};

seedUsers().catch(err => {
  console.error(err);
  process.exit(1);
}); 