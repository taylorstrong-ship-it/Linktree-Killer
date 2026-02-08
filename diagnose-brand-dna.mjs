#!/usr/bin/env node
// Brand DNA Full Pipeline Diagnostic
// Tests the entire extraction flow and shows what data is actually being returned

const FUNCTION_URL = "https://qxkicdhsrlpehgcsapsh.supabase.co/functions/v1/extract-brand-dna";
const TEST_SITES = [
    "https://www.hairbyshea.com",
    "https://milliesitalian.com",
    "https://www.hearinglife.com"
];

async function diagnoseBrandDNA(url) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔬 DIAGNOSING: ${url}`);
    console.log('='.repeat(80));

    try {
        const startTime = Date.now();
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n⏱️  Duration: ${duration}s`);
        console.log(`📡 Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const error = await response.text();
            console.log(`\n❌ ERROR RESPONSE:\n${error}`);
            return;
        }

        const data = await response.json();

        // CORE IDENTITY
        console.log(`\n📋 CORE IDENTITY:`);
        console.log(`   Company Name: ${data.company_name || '❌ MISSING'}`);
        console.log(`   Industry: ${data.industry || '❌ MISSING'}`);
        console.log(`   Logo URL: ${data.logo_url ? '✅ ' + data.logo_url.substring(0, 60) + '...' : '❌ MISSING'}`);

        // COLORS
        console.log(`\n🎨 COLORS:`);
        if (data.colors) {
            console.log(`   Primary: ${data.colors.primary || '❌ MISSING'}`);
            console.log(`   Secondary: ${data.colors.secondary || '❌ MISSING'}`);
            console.log(`   Accent: ${data.colors.accent || '❌ MISSING'}`);
        } else {
            console.log(`   ❌ NO COLORS EXTRACTED`);
        }

        // BRAND IMAGES
        console.log(`\n📸 BRAND IMAGES:`);
        if (data.brand_images && data.brand_images.length > 0) {
            console.log(`   Count: ${data.brand_images.length}`);
            data.brand_images.slice(0, 3).forEach((img, i) => {
                console.log(`   ${i + 1}. ${img.substring(0, 80)}...`);
            });
        } else {
            console.log(`   ❌ ZERO IMAGES FOUND`);
        }

        // BRAND VOICE
        console.log(`\n🎙️  BRAND VOICE:`);
        if (data.brand_voice) {
            console.log(`   Tone: ${data.brand_voice.tone || '❌ MISSING'}`);
            console.log(`   Style: ${data.brand_voice.style || '❌ MISSING'}`);
            console.log(`   Keywords: ${data.brand_voice.keywords?.slice(0, 5).join(', ') || '❌ MISSING'}`);
        } else {
            console.log(`   ❌ NO BRAND VOICE ANALYSIS`);
        }

        // SOCIAL EXAMPLES
        console.log(`\n📱 SOCIAL MEDIA EXAMPLES:`);
        if (data.social_media_examples && data.social_media_examples.length > 0) {
            console.log(`   Count: ${data.social_media_examples.length}`);
            data.social_media_examples.slice(0, 2).forEach((ex, i) => {
                console.log(`   ${i + 1}. [${ex.type}] ${ex.caption?.substring(0, 60)}...`);
            });
        } else {
            console.log(`   ❌ ZERO EXAMPLES GENERATED`);
        }

        // VISUAL SOCIAL POSTS (THE KEY METRIC)
        console.log(`\n🎨 VISUAL SOCIAL POSTS:`);
        if (data.visual_social_posts && data.visual_social_posts.length > 0) {
            console.log(`   Count: ${data.visual_social_posts.length}`);
            data.visual_social_posts.forEach((post, i) => {
                console.log(`   ${i + 1}. [${post.type}] ${post.enhancement_success ? '✅ Enhanced' : '❌ Not Enhanced'}`);
                console.log(`      Caption: ${post.caption?.substring(0, 60)}...`);
                console.log(`      Original Image: ${post.original_image_url ? 'Yes' : 'No'}`);
                console.log(`      Enhanced Image: ${post.enhanced_image_url ? 'Yes' : 'No'}`);
            });
        } else {
            console.log(`   ❌ ZERO VISUAL POSTS GENERATED`);
            console.log(`   🔍 This is the PRIMARY ISSUE - visual posts should ALWAYS be generated`);
        }

        // SUMMARY
        console.log(`\n📊 PIPELINE HEALTH CHECK:`);
        const checks = {
            'Company Name': !!data.company_name,
            'Logo URL': !!data.logo_url,
            'Colors': !!(data.colors?.primary),
            'Brand Images': !!(data.brand_images?.length > 0),
            'Brand Voice': !!data.brand_voice?.tone,
            'Social Examples': !!(data.social_media_examples?.length > 0),
            'Visual Posts': !!(data.visual_social_posts?.length > 0)
        };

        Object.entries(checks).forEach(([key, pass]) => {
            console.log(`   ${pass ? '✅' : '❌'} ${key}`);
        });

        const healthScore = Object.values(checks).filter(v => v).length;
        const totalChecks = Object.keys(checks).length;
        console.log(`\n🏥 HEALTH SCORE: ${healthScore}/${totalChecks} (${((healthScore / totalChecks) * 100).toFixed(0)}%)`);

        // Save full response for debugging
        const fs = await import('fs');
        const filename = `brand-dna-debug-${url.replace(/[^a-z0-9]/gi, '-')}.json`;
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`\n💾 Full response saved to: ${filename}`);

    } catch (error) {
        console.error(`\n❌ FATAL ERROR:`, error.message);
    }
}

// Run diagnostics
(async () => {
    console.log('🚀 Starting Brand DNA Full Pipeline Diagnostic');
    console.log('Testing 3 diverse websites to identify extraction issues\n');

    for (const site of TEST_SITES) {
        await diagnoseBrandDNA(site);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n\n${'='.repeat(80)}`);
    console.log('🏁 DIAGNOSTIC COMPLETE');
    console.log('='.repeat(80));
    console.log('\n📝 Review the health scores above to identify which stage is failing.');
    console.log('💡 Check the saved JSON files for full API responses.');
})();
