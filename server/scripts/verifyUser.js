require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function verifyUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get username from command line arguments
    const username = process.argv[2];
    
    if (!username) {
      console.log('Usage: node scripts/verifyUser.js <username>');
      console.log('Example: node scripts/verifyUser.js RRBC_Admin');
      process.exit(1);
    }

    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`❌ User with username "${username}" not found`);
      process.exit(1);
    }

    // Check if already verified
    if (user.isEmailVerified) {
      console.log(`✅ User "${username}" is already verified!`);
      process.exit(0);
    }

    // Verify the user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    console.log(`✅ User "${username}" has been verified!`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Email: ${user.email}`);
    console.log(`Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// List all users with verification status
async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await User.find({}).select('username firstName lastName email isEmailVerified isAdmin');
    
    console.log('\n📋 All users and verification status:');
    console.log('=========================================');
    users.forEach(user => {
      const verifiedStatus = user.isEmailVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED';
      const adminStatus = user.isAdmin ? ' (ADMIN)' : '';
      console.log(`${user.username} - ${user.firstName} ${user.lastName} - ${verifiedStatus}${adminStatus}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// If no arguments, list users
if (process.argv.length === 2) {
  listUsers();
} else {
  verifyUser();
}

// node scripts/verifyUser.js username
