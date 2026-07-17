const mongoose = require("mongoose");
require("dotenv").config();

async function run() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/flais";
  try {
    await mongoose.connect(uri);
    const CatalogPage = require("./models/CatalogPage");
    const page = await CatalogPage.findOne();
    if (!page || !page.catalogs) {
      console.log("No catalogs found.");
    } else {
      console.log(`Found ${page.catalogs.length} catalogs:`);
      page.catalogs.forEach((cat) => {
        console.log(`- Title: ${cat.title}`);
        console.log(`  Link: ${cat.link}`);
        console.log(`  FlipPath: ${cat.flipPath}`);
        console.log(`  Status: ${cat.conversionStatus}`);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
