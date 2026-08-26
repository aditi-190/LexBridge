const mongoose = require("mongoose");
const { MONGODB_URI } = require("./env");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ Database Connection Failed");
    console.log(error); 
  }
};

module.exports = connectDB;