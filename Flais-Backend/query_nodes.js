const mongoose = require("mongoose");
const WebsiteNode = require("./models/WebsiteNode");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {}).then(async () => {
  const nodes = await WebsiteNode.find({ name: { $regex: /800x2400/ } });
  console.log("Nodes containing 800x2400:");
  nodes.forEach(n => console.log(n.relativePath));
  mongoose.disconnect();
});
