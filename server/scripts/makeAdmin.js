require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Make a user an admin by username
async function makeUserAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beer-review-app');
    console.log('Connected to MongoDB');

    // Get username from command line arguments
    const username = process.argv[2];
    
    if (!username) {
      console.log('Usage: node scripts/makeAdmin.js <username>');
      process.exit(1);
    }

    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`User with username "${username}" not found`);
      process.exit(1);
    }

    // Grant admin privileges
    user.isAdmin = true;
    user.role = 'admin';
    await user.save();

    console.log(`✅ User "${username}" is now an admin!`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Email: ${user.email}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// List all users in the database
async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beer-review-app');
    
    const users = await User.find({}).select('username firstName lastName email isAdmin role');
    
    console.log('\nAll users:');
    console.log('==========');
    users.forEach(user => {
      const adminStatus = user.isAdmin ? ' (ADMIN)' : '';
      console.log(`${user.username} - ${user.firstName} ${user.lastName} - ${user.email}${adminStatus}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Script execution logic
if (process.argv.length === 2) {
  listUsers();
} else {
  makeUserAdmin();
}

// Usage examples:
// node scripts/makeAdmin.js                  # List all users
// node scripts/makeAdmin.js your_username    # Make user admin