const mongoose = require("mongoose");
const WebsiteNode = require("./models/WebsiteNode");
const websiteFileSystemProvider = require("./services/storage/WebsiteFileSystemProvider");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI, {});
  console.log("Connected to MongoDB.");

  const allNodes = await WebsiteNode.find();
  let deletedCount = 0;

  for (const node of allNodes) {
    const exists = await websiteFileSystemProvider.exists(node.relativePath);
    if (!exists) {
      console.log(`Deleting from DB (not on FS): ${node.relativePath}`);
      await WebsiteNode.deleteOne({ _id: node._id });
      deletedCount++;
    }
  }

  console.log(`Deleted ${deletedCount} stale nodes from DB.`);
  await mongoose.disconnect();
}

run().catch(console.error);
