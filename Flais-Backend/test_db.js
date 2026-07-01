const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const MONGO_URI = 'mongodb+srv://sastaolx123:Vg9mi8oQk3rwIkIC@mycluster.ska5aw9.mongodb.net/morbi';

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('DB Connected!');
    
    // Ensure admin@flais.com exists
    const flaisAdmin = await Admin.findOne({ email: 'admin@flais.com' });
    if (!flaisAdmin) {
      await Admin.create({ email: 'admin@flais.com', password: 'password123' });
      console.log('Created admin@flais.com with password123!');
    } else {
      flaisAdmin.password = 'password123';
      await flaisAdmin.save();
      console.log('Reset admin@flais.com password to password123!');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
