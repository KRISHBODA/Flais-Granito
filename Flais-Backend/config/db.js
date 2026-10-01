const mongoose = require("mongoose");
const dns = require("dns");

// Ensure reliable DNS resolution for MongoDB SRV records on macOS
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if not permitted
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
