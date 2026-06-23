const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
let useLocalFallback = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('⚠️  No MONGODB_URI found in env. Operating in OFFLINE JSON-file fallback mode (db_fallback.json).');
    useLocalFallback = true;
    return false;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    useLocalFallback = false;
    console.log('✅ Connected to MongoDB successfully.');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection failed:', error.message);
    console.log('⚠️  Falling back to OFFLINE JSON-file database mode (db_fallback.json).');
    useLocalFallback = true;
    return false;
  }
};

const isFallbackMode = () => {
  return useLocalFallback;
};

module.exports = {
  connectDB,
  isFallbackMode,
  mongoose
};
