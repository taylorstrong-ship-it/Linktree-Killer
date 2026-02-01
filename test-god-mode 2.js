#!/usr/bin/env node

/**
 * 🔥 LOCK-IN TEST - God Mode Verification
 * 
 * This tests the "Final V1" DNA Engine with a real business
 * to verify JSON-LD extraction, booking URL detection, and color accuracy.
 */

const API_URL = 'http://localhost:3000/api/brand-dna';

async function testGodMode(url) {
    console.log(`🔍 Testing God Mode on: ${url}\n`);

    try {
        const startTime = Date.now();
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const duration = Date.now() - startTime;

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ API Error:', JSON.stringify(error, null, 2));
            return false;
        }

        const data = await response.json();

        console.log('✅ DNA Extracted Successfully!\n');
        console.log('📊 GOLDEN RECORD:');
        console.log('─'.repeat(50));
        console.log(`Business Name:    ${data.dna.businessName}`);
        console.log(`Tagline:          ${data.dna.tagline || '(none)'}`);
        console.log(`Industry:         ${data.dna.industry}`);
        console.log(`Vibe:             ${data.dna.vibe}`);
        console.log(`Primary Color:    ${data.dna.colors.primary}`);
        console.log(`Secondary Color:  ${data.dna.colors.secondary}`);
        console.log('─'.repeat(50));
        console.log('💰 MONEY LINK:');
        console.log(`Booking URL:      ${data.dna.links.booking_url}`);

        // Check if it's an external booking platform
        const isExternal = /(square\.site|vagaro\.com|glossgenius\.com|booksy\.com|toast\.com|ubereats\.com|doordash\.com)/i.test(data.dna.links.booking_url);
        console.log(`Platform Type:    ${isExternal ? '✅ EXTERNAL BOOKING' : '⚠️  Main Site (fallback)'}`);

        console.log('─'.repeat(50));
        console.log('📱 SOCIAL LINKS:');
        console.log(`Instagram:        ${data.dna.links.instagram || '(not found)'}`);
        console.log(`Facebook:         ${data.dna.links.facebook || '(not found)'}`);
        console.log('─'.repeat(50));
        console.log('📍 CONTACT:');
        console.log(`Phone:            ${data.dna.contact.phone || '(not found)'}`);
        console.log(`Address:          ${data.dna.contact.address || '(not found)'}`);
        console.log(`Email:            ${data.dna.contact.email || '(not found)'}`);
        console.log('─'.repeat(50));
        console.log('🤖 VOICE SETUP:');
        console.log(`Tone:             ${data.dna.voice_setup.tone}`);
        console.log(`Welcome Message:  "${data.dna.voice_setup.welcome_message}"`);
        console.log('─'.repeat(50));
        console.log('🔬 DATA SOURCES:');
        console.log(`Used:             ${data.dataSources.join(', ') || 'markdown only'}`);
        console.log(`Extraction Time:  ${duration}ms`);
        console.log('─'.repeat(50));

        // Lock-in checklist
        console.log('\n🔒 LOCK-IN CHECKLIST:');
        const checks = [
            { test: 'Has business name', pass: !!data.dna.businessName },
            { test: 'Has valid hex colors', pass: /^#[0-9A-Fa-f]{6}$/.test(data.dna.colors.primary) },
            { test: 'Has booking URL', pass: !!data.dna.links.booking_url },
            { test: 'Has industry classification', pass: !!data.dna.industry },
            { test: 'Has vibe classification', pass: !!data.dna.vibe },
            { test: 'Has voice setup', pass: !!data.dna.voice_setup.welcome_message },
        ];

        checks.forEach(check => {
            console.log(`${check.pass ? '✅' : '❌'} ${check.test}`);
        });

        const allPassed = checks.every(c => c.pass);

        if (allPassed && isExternal) {
            console.log('\n🎉 PERFECT! This data is ready for the Voice Agent.');
            console.log('🔒 You can now LOCK this API and treat it as a black box.\n');
        } else if (allPassed) {
            console.log('\n✅ PASSED! (No external booking platform found, using fallback)\n');
        } else {
            console.log('\n⚠️  Some checks failed. Review the output above.\n');
        }

        return allPassed;

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        console.error('\n💡 Ensure:');
        console.error('   • Dev server is running: npm run dev');
        console.error('   • API keys are in .env.local');
        console.error('   • Internet connection is active\n');
        return false;
    }
}

// Run test
const testUrl = process.argv[2] || 'https://example.com';
testGodMode(testUrl);
