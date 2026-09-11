/**
 * Environment Variable Test Script
 * This script helps diagnose .env file loading issues
 */

require('dotenv').config();

console.log('='.repeat(60));
console.log('🔍 ENVIRONMENT VARIABLE DIAGNOSTIC TEST');
console.log('='.repeat(60));
console.log('');

// Check if .env file is being loaded
console.log('📁 Working Directory:', process.cwd());
console.log('');

// Test email variables
console.log('📧 EMAIL CONFIGURATION:');
console.log('─'.repeat(60));

const emailVars = {
    'EMAIL_HOST': process.env.EMAIL_HOST,
    'EMAIL_PORT': process.env.EMAIL_PORT,
    'EMAIL_SECURE': process.env.EMAIL_SECURE,
    'EMAIL_USER': process.env.EMAIL_USER,
    'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD,
    'EMAIL_FROM': process.env.EMAIL_FROM,
};

let allConfigured = true;

for (const [key, value] of Object.entries(emailVars)) {
    if (key === 'EMAIL_PASSWORD') {
        // Never log the actual password
        if (value && value.length > 0) {
            const isPlaceholder = value.includes('YOUR_') || value === 'YOUR_GOOGLE_APP_PASSWORD';
            if (isPlaceholder) {
                console.log(`❌ ${key}: PLACEHOLDER VALUE (needs to be replaced with actual App Password)`);
                allConfigured = false;
            } else {
                console.log(`✅ ${key}: CONFIGURED (${value.length} characters)`);
            }
        } else {
            console.log(`❌ ${key}: NOT SET`);
            allConfigured = false;
        }
    } else {
        if (value && value.length > 0) {
            const isPlaceholder = value.includes('YOUR_');
            if (isPlaceholder) {
                console.log(`⚠️  ${key}: "${value}" (placeholder value)`);
            } else {
                console.log(`✅ ${key}: "${value}"`);
            }
        } else {
            console.log(`❌ ${key}: NOT SET`);
            allConfigured = false;
        }
    }
}

console.log('');
console.log('─'.repeat(60));

if (allConfigured) {
    console.log('✅ All email environment variables are configured!');
    console.log('');
    console.log('📝 Next step: Start your server with "npm start"');
} else {
    console.log('❌ Email configuration is incomplete!');
    console.log('');
    console.log('🔧 TO FIX:');
    console.log('   1. Open .env file in the project root');
    console.log('   2. Replace YOUR_GOOGLE_APP_PASSWORD with your actual 16-character App Password');
    console.log('   3. Save the file');
    console.log('   4. Run this test again: node test-env.js');
    console.log('');
    console.log('📚 Need help creating an App Password? See EMAIL_SETUP.md');
}

console.log('');
console.log('='.repeat(60));
