/**
 * AI Design API - Test Suite
 * 
 * Tests the /api/ai-design endpoint with various scenarios.
 * Run with: node test-ai-design.mjs
 */

const API_URL = 'http://localhost:3000/api/ai-design';

// Sample base64 image (tiny 1x1 pixel PNG for testing)
const SAMPLE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const BRAND_DNA = {
    primaryColor: '#FF6B35',
    vibe: 'Bold & Energetic',
    industry: 'Fitness'
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
            image: SAMPLE_IMAGE,
            brandDNA: BRAND_DNA,
            campaign: '$19 Family Night',
            aspectRatio: '1:1'
        })
    });

    const data = await response.json();

    if (!data.success && data.error === 'AI service temporarily unavailable') {
        throw new Error('Google AI API key not configured (expected for initial setup)');
    }

    if (!data.success) {
        throw new Error(`API returned error: ${data.error}`);
    }

    if (!data.imageBase64 || !data.imageBase64.startsWith('data:image/')) {
        throw new Error('Invalid response format');
    }
}

async function testMissingImage() {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            brandDNA: BRAND_DNA,
            campaign: '$19 Family Night',
            aspectRatio: '1:1'
        })
    });

    const data = await response.json();

    if (response.status !== 400) {
        throw new Error(`Expected 400 status, got ${response.status}`);
    }

    if (data.error !== 'Missing required field: image') {
        throw new Error(`Unexpected error: ${data.error}`);
    }
}

async function testMissingBrandDNA() {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: SAMPLE_IMAGE,
            campaign: '$19 Family Night',
            aspectRatio: '1:1'
        })
    });

    const data = await response.json();

    if (response.status !== 400) {
        throw new Error(`Expected 400 status, got ${response.status}`);
    }

    if (data.error !== 'Missing required field: brandDNA') {
        throw new Error(`Unexpected error: ${data.error}`);
    }
}

async function testInvalidAspectRatio() {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: SAMPLE_IMAGE,
            brandDNA: BRAND_DNA,
            campaign: '$19 Family Night',
            aspectRatio: '16:9' // Invalid
        })
    });

    const data = await response.json();

    if (response.status !== 400) {
        throw new Error(`Expected 400 status, got ${response.status}`);
    }

    if (!data.error.includes('aspectRatio')) {
        throw new Error(`Unexpected error: ${data.error}`);
    }
}

async function testInvalidImageFormat() {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: 'not-a-valid-base64-image',
            brandDNA: BRAND_DNA,
            campaign: '$19 Family Night',
            aspectRatio: '1:1'
        })
    });

    const data = await response.json();

    if (response.status !== 400) {
        throw new Error(`Expected 400 status, got ${response.status}`);
    }

    if (!data.error.includes('Base64')) {
        throw new Error(`Unexpected error: ${data.error}`);
    }
}

async function testIncompleteBrandDNA() {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: SAMPLE_IMAGE,
            brandDNA: { primaryColor: '#FF6B35' }, // Missing vibe and industry
            campaign: '$19 Family Night',
            aspectRatio: '1:1'
        })
    });

    const data = await response.json();

    if (response.status !== 400) {
        throw new Error(`Expected 400 status, got ${response.status}`);
    }

    if (!data.error.includes('brandDNA')) {
        throw new Error(`Unexpected error: ${data.error}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// RUN ALL TESTS
// ─────────────────────────────────────────────────────────────────────────────

async function runAllTests() {
    console.log('🚀 AI Design API - Test Suite');
    console.log('═'.repeat(50));

    // Validation tests (should pass immediately)
    await runTest('Test: Missing image field', testMissingImage);
    await runTest('Test: Missing brandDNA field', testMissingBrandDNA);
    await runTest('Test: Invalid aspect ratio', testInvalidAspectRatio);
    await runTest('Test: Invalid image format', testInvalidImageFormat);
    await runTest('Test: Incomplete brandDNA', testIncompleteBrandDNA);

    // Integration test (requires API key)
    await runTest('Test: Valid request (requires API key)', testValidRequest);

    console.log('\n' + '═'.repeat(50));
    console.log('✨ Test suite complete!\n');
}

runAllTests().catch(console.error);
