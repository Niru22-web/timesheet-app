const bcrypt = require('bcrypt');

async function generatePasswordHash() {
  const password = 'password123';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('🔑 Password Hash Generated:');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('');
    console.log('📋 SQL INSERT Statement:');
    console.log(`'$2b$10$...${hash.substring(hash.length - 20)}'`);
    console.log('');
    console.log('✅ Copy the full hash above into your SQL INSERT statement');
  } catch (error) {
    console.error('❌ Error generating hash:', error);
  }
}

generatePasswordHash();
