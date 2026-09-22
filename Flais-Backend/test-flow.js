require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const websiteNodeService = require("./services/WebsiteNodeService");
const fs = require("fs");
const path = require("path");

const run = async () => {
  await connectDB();
  
  // Find catalog
  const catalogFolder = await websiteNodeService.resolvePublicPath("/360/catalog");
  
  // 3. Upload file
  const testWebpContent = Buffer.from("RIFF\x14\x00\x00\x00WEBPVP8 \x08\x00\x00\x00\x10\x00\x01\x00\x00\x00\x00\x00", "binary");
  const fileNode = await websiteNodeService.saveFile(catalogFolder._id, {
     originalname: "test.webp",
     buffer: testWebpContent,
     mimetype: "image/webp",
     size: testWebpContent.length
  });
  
  console.log("MongoDB File Node:", fileNode);
  
  process.exit(0);
};

run().catch(console.error);
