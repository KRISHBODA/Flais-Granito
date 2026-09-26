const mongoose = require('mongoose');
const WebsiteNode = require('./models/WebsiteNode');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const node = await WebsiteNode.findOne({ name: 'index.html' });
  console.log(node);
  process.exit(0);
});
