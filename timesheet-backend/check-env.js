require('dotenv').config();

console.log('🔍 Checking environment variables...');
console.log('JWT_SECRET:', process.env.JWT_SECRET || 'supersecretkey');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
