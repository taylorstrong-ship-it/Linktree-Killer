#!/usr/bin/env node

// Quick debugging test for Stage 3
const test = {
    links: {
        instagram: "",
        facebook: ""
    }
};

console.log('Testing Stage 3 condition:');
console.log('instagram value:', JSON.stringify(test.links.instagram));
console.log('facebook value:', JSON.stringify(test.links.facebook));
console.log('instagram?.trim():', test.links.instagram?.trim());
console.log('facebook?.trim():', test.links.facebook?.trim());
console.log('!instagram?.trim():', !test.links.instagram?.trim());
console.log('!facebook?.trim():', !test.links.facebook?.trim());
console.log('Condition result:', !test.links.instagram?.trim() || !test.links.facebook?.trim());

if (!test.links.instagram?.trim() || !test.links.facebook?.trim()) {
    console.log('✅ Stage 3 WOULD FIRE');
} else {
    console.log('❌ Stage 3 would NOT fire');
}
