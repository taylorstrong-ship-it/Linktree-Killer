/**
 * Neural Uplink API - Test Suite
 * 
 * Tests the /api/demo/agent endpoint with various scenarios.
 * Run with: node test-neural-uplink.mjs
 */

const API_URL = 'http://localhost:3000/api/demo/agent';

const BRAND_DNA = {
    business_name: 'Acme Pizza',
    tone: 'Friendly and casual',
    business_intel: {
        hours: 'Open 11am - 10pm daily',
        menu: ['Pepperoni Pizza', 'Margherita', 'Hawaiian'],
        specialOffer: '$19 Family Night on Tuesdays',
        location: '123 Main Street',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEST UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

async function runTest(name, testFn) {
    try {
        console.log(`\n🧪 ${name}`);
        await testFn();
        console.log(`✅ PASS`);
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST CASES
// ─────────────────────────────────────────────────────────────────────────────

async function testValidRequest() {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'What time do you close?',
            brandDNA: BRAND_DNA,
        }),
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(`API returned error: ${data.error}`);
    }

    if (!data.response || typeof data.response !== 'string') {
        throw new Error('Invalid response format');
    }

    console.log(`   Response: "${data.response}"`);
}

async function testMissingMessage() {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            brandDNA: BRAND_DNA,
        }),
    });

    const data = await response.json();

    if (response.status !== 400) {
        throw new Error(`Expected 400 status, got ${response.status}`);
    }

    if (!data.error.includes('message')) {
        throw new Error(`Unexpected error: ${data.error}`);
    }
}

async function testMissingBrandDNA() {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'What time do you close?',
        }),
    });

    const data = await response.json();

    if (response.status !== 400) {
        throw new Error(`Expected 400 status, got ${response.status}`);
    }

    if (!data.error.includes('brandDNA')) {
        throw new Error(`Unexpected error: ${data.error}`);
    }
}

async function testMultipleQuestions() {
    const questions = [
        'What time do you close?',
        'What pizzas do you have?',
        'Do you have any specials?',
        'Where are you located?',
    ];

    for (const question of questions) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: question,
                brandDNA: BRAND_DNA,
            }),
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(`Failed on: "${question}"`);
        }

        console.log(`   Q: "${question}"`);
        console.log(`   A: "${data.response}"`);
    }
}

async function testResponseLength() {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'Tell me everything about your menu',
            brandDNA: BRAND_DNA,
        }),
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(`API returned error: ${data.error}`);
    }

    // Should be concise (< 150 words for maxOutputTokens: 100)
    const wordCount = data.response.split(/\s+/).length;
    console.log(`   Response length: ${wordCount} words`);

    if (wordCount > 150) {
        throw new Error(`Response too long: ${wordCount} words (expected < 150)`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// RUN ALL TESTS
// ─────────────────────────────────────────────────────────────────────────────

async function runAllTests() {
    console.log('🚀 Neural Uplink API - Test Suite');
    console.log('═'.repeat(60));

    // Validation tests
    await runTest('Test: Missing message field', testMissingMessage);
    await runTest('Test: Missing brandDNA field', testMissingBrandDNA);

    // Integration tests
    await runTest('Test: Valid request', testValidRequest);
    await runTest('Test: Multiple questions', testMultipleQuestions);
    await runTest('Test: Response length constraint', testResponseLength);

    console.log('\n' + '═'.repeat(60));
    console.log('✨ Test suite complete!\n');
}

runAllTests().catch(console.error);
