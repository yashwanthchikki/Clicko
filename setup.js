#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Clicko URL Shortener Setup');
console.log('==============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    const envContent = `# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=your-super-secret-jwt-key-here-${Math.random().toString(36).substring(2, 15)}

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5500
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('⚠️  Please update the MONGO_URI with your actual MongoDB connection string.\n');
} else {
    console.log('✅ .env file already exists.\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    console.log('Run: npm install\n');
} else {
    console.log('✅ Dependencies already installed.\n');
}

// Create directories if they don't exist
const directories = [
    'logs',
    'uploads',
    'temp'
];

directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update your MongoDB connection string in .env file');
console.log('2. Run: npm install');
console.log('3. Run: npm start');
console.log('4. Open frontend in your browser: http://localhost:5500/html/signin.html');
console.log('\n🔗 Your Clicko URL Shortener is ready to use!');
