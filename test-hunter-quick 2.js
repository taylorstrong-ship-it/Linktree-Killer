#!/usr/bin/env node

/**
 * Quick test of Hunter API with a simple test URL
 */

const API_URL = 'http://localhost:3000/api/brand-dna';
const TEST_URL = 'https://example.com'; // Simple test site

async function quickTest() {
    console.log('🧪 Quick Hunter Test\n');

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: TEST_URL }),
    });

    const data = await response.json();

    if (!data.success) {
        console.error('❌ Failed:', JSON.stringify(data, null, 2));
        process.exit(1);
    }

    console.log('✅ Success! New schema working:\n');
    console.log(`Business: ${data.dna.businessName}`);
    console.log(`Industry: ${data.dna.industry}`);
    console.log(`Vibe: ${data.dna.vibe}`);
    console.log(`Booking URL: ${data.dna.links.booking_url}`);
    console.log(`Instagram: ${data.dna.links.instagram || '(none)'}`);
    console.log(`Contact Email: ${data.dna.contact.email || '(none)'}`);
    console.log(`Voice Tone: ${data.dna.voice_setup.tone}`);
    console.log(`Welcome: ${data.dna.voice_setup.welcome_message}`);
    console.log(`\n✅ Hunter API v2 is operational!`);
}

quickTest().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
