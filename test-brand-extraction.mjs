#!/usr/bin/env node

/**
 * Test script for extract-brand-dna Edge Function
 * Tests the Hero Hunter logic with hairbyshea.com
 */

const SUPABASE_URL = 'https://qxkicdhsrlpehgcsapsh.supabase.co';
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/extract-brand-dna`;

async function testBrandExtraction(url) {
    console.log(`\n🧪 Testing Brand DNA Extraction for: ${url}\n`);

    try {
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ SUCCESS!\n');
            console.log('📊 Brand DNA Results:');
            console.log('='.repeat(60));
            console.log(`Company Name: ${data.brandDNA.company_name}`);
            console.log(`Business Type: ${data.brandDNA.business_type}`);
            console.log(`Description: ${data.brandDNA.description}`);
            console.log('\n🖼️  IMAGE EXTRACTION RESULTS:');
            console.log(`Logo URL: ${data.brandDNA.logo_url || '❌ NONE'}`);
            console.log(`Favicon URL: ${data.brandDNA.favicon_url || '❌ NONE'}`);
            console.log('\n🎨 Colors:');
            console.log(`Primary: ${data.brandDNA.primary_color}`);
            console.log(`Secondary: ${data.brandDNA.secondary_color}`);
            console.log('\n📱 Social Links:');
            console.log(JSON.stringify(data.brandDNA.social_links, null, 2));
        } else {
            console.log('❌ FAILED!\n');
            console.log('Error:', data.error);
        }

    } catch (error) {
        console.error('❌ Request Error:', error.message);
    }
}

// Test with hairbyshea.com
testBrandExtraction('https://hairbyshea.com');
