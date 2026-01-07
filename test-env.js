// Test of .env file werkt
require('dotenv').config();

console.log('========================================');
console.log('  .ENV TEST');
console.log('========================================');
console.log('');

if (process.env.OPENAI_API_KEY) {
    const key = process.env.OPENAI_API_KEY;
    const masked = key.substring(0, 8) + '...' + key.substring(key.length - 4);
    console.log('✅ API KEY GEVONDEN!');
    console.log('   Key begint met:', masked);
    console.log('');
    console.log('Het werkt! Start nu de server met START.bat');
} else {
    console.log('❌ API KEY NIET GEVONDEN!');
    console.log('');
    console.log('.env bestand bestaat niet of is leeg');
    console.log('Run: ZET-API-KEY.bat');
}

console.log('');
console.log('========================================');

