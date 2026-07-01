const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const HeroSlide = require('./models/HeroSlide');

const MONGO_URI = 'mongodb+srv://sastaolx123:Vg9mi8oQk3rwIkIC@mycluster.ska5aw9.mongodb.net/morbi';

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('DB Connected!');

    // 1. Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 2. Copy a sample asset image to backend uploads
    const srcAsset = 'c:/Users/Lenovo/OneDrive/Desktop/React/sorona-tiles (2)/sorona-tiles (1)/sorona-tiles/src/assets/modern_living.jpg';
    const destAsset = path.join(uploadsDir, 'test.jpg');
    if (fs.existsSync(srcAsset)) {
      fs.copyFileSync(srcAsset, destAsset);
      console.log('Successfully copied sample asset to:', destAsset);
    } else {
      console.log('Source asset not found, checking alternative...');
      const alternativeSrc = 'c:/Users/Lenovo/OneDrive/Desktop/React/sorona-tiles (2)/sorona-tiles (1)/sorona-tiles/src/assets/elegance.jpg';
      if (fs.existsSync(alternativeSrc)) {
        fs.copyFileSync(alternativeSrc, destAsset);
        console.log('Successfully copied alternative asset to:', destAsset);
      }
    }

    // 3. Clear existing slides to test clean load
    await HeroSlide.deleteMany({});
    console.log('Cleared existing hero slides.');

    // 4. Create new slide pointing to local serving URL
    const newSlide = await HeroSlide.create({
      tagline: 'Crafted for Modern Luxury',
      title: 'Premium Sorona Tiles\nRedefining Elegance',
      subtitle: 'Experience dynamic beauty and solid engineering in every single piece.',
      image: 'http://localhost:8000/uploads/test.jpg'
    });
    console.log('Successfully created new test hero slide:', newSlide);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
