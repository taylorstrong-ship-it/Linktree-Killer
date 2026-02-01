#!/usr/bin/env node

/**
 * 🎯 HUNTER API TEST - Verifies "Money Link" Detection
 * 
 * This script tests the upgraded /api/brand-dna endpoint
 * to ensure it correctly identifies booking URLs (Square, Vagaro, etc.)
 */

const API_URL = 'http://localhost:3000/api/brand-dna';
const TEST_URL = 'https://hairbyshae.com';

async function testHunterAPI() {
    console.log('🔍 Testing HUNTER API with hairbyshae.com...\n');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: TEST_URL }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`HTTP ${response.status}: ${JSON.stringify(error, null, 2)}`);
        }

        const data = await response.json();

        console.log('✅ API Response Received!\n');
        console.log('📦 Full Response:');
        console.log(JSON.stringify(data, null, 2));

        console.log('\n🎯 HUNTER TEST RESULTS:\n');

        // Verify new schema structure
        const checks = [
            { name: '✓ Has businessName', pass: !!data.dna?.businessName },
            { name: '✓ Has industry field', pass: ['Salon', 'Restaurant', 'General'].includes(data.dna?.industry) },
            { name: '✓ Has vibe enum', pass: ['Luxury', 'Casual', 'High Energy'].includes(data.dna?.vibe) },
            { name: '✓ Has colors.primary (hex)', pass: /^#[0-9A-Fa-f]{6}$/.test(data.dna?.colors?.primary) },
            { name: '✓ Has links.booking_url', pass: !!data.dna?.links?.booking_url },
            { name: '✓ Has links.instagram', pass: !data.dna?.links?.instagram || /instagram\.com/.test(data.dna.links.instagram) },
            { name: '✓ Has contact object', pass: !!data.dna?.contact },
            { name: '✓ Has voice_setup.tone', pass: !!data.dna?.voice_setup?.tone },
            { name: '✓ Has voice_setup.welcome_message', pass: !!data.dna?.voice_setup?.welcome_message },
        ];

        checks.forEach(check => {
            console.log(check.pass ? `${check.name}` : `❌ ${check.name} FAILED`);
        });

        // 🔥 THE GOLDEN RECORD TEST
        const bookingUrl = data.dna?.links?.booking_url || '';
        const isExternalBooking = bookingUrl.includes('square.site') ||
            bookingUrl.includes('vagaro.com') ||
            bookingUrl.includes('glossgenius.com');

        console.log('\n🔥 GOLDEN RECORD TEST:');
        console.log(`   Booking URL: ${bookingUrl}`);
        console.log(`   Is External Platform: ${isExternalBooking ? '✅ YES' : '⚠️  NO (using main site)'}`);

        if (isExternalBooking) {
            console.log('\n🎉 SUCCESS! Hunter found the money link!\n');
        } else {
            console.log('\n⚠️  WARNING: No external booking platform detected. Using main site as fallback.\n');
        }

        // Show data sources used
        console.log('📊 Data Sources Used:', data.dataSources?.join(', ') || 'none');

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        console.error('\n💡 Make sure:');
        console.error('   1. Server is running: npm run dev');
        console.error('   2. API keys are set in .env.local');
        process.exit(1);
    }
}

// Run test
testHunterAPI();
