const { execSync } = require('child_process');

async function setupPostgresDatabase() {
  try {
    console.log('🔧 Setting up PostgreSQL database...');
    
    // Set environment variables
    process.env.PGPASSWORD = 'Niranjan@1093';
    
    // Create database
    console.log('📊 Creating database: timesheetsystem...');
    try {
      execSync('psql -U postgres -h localhost -d postgres -c "CREATE DATABASE timesheetsystem;"', { stdio: 'inherit' });
      console.log('✅ Database created successfully!');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Database already exists!');
      } else {
        console.error('❌ Error creating database:', error.message);
        return;
      }
    }
    
    // Test connection
    console.log('🧪 Testing database connection...');
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      await prisma.$connect();
      console.log('✅ Database connection successful!');
      
      // Test query
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Query test passed!');
      
      await prisma.$disconnect();
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    }
    
    console.log('\n🎉 PostgreSQL Setup Complete!');
    console.log('📋 Database Details:');
    console.log('   Host: localhost');
    console.log('   Port: 5432');
    console.log('   Database: timesheetsystem');
    console.log('   User: postgres');
    console.log('   Password: Niranjan@1093');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupPostgresDatabase();
