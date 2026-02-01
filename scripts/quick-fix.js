#!/usr/bin/env node

/**
 * 🔧 Quick Fix Script
 * 
 * This script attempts to automatically fix common issues.
 * Run with: npm run quick-fix
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log("🔧 Quick Fix Script Starting...\n");

let fixesApplied = 0;

// Fix 1: Check if node_modules exists
console.log("📦 Checking dependencies...");
if (!fs.existsSync('node_modules')) {
    console.log("❌ node_modules not found. Installing dependencies...");
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log("✅ Dependencies installed!");
        fixesApplied++;
    } catch (error) {
        console.log("⚠️ Failed to install dependencies. Try running 'npm install' manually.");
    }
} else {
    console.log("✅ node_modules exists");
}

// Fix 2: Check for .env.local file
console.log("\n🔐 Checking environment variables...");
if (!fs.existsSync('.env.local')) {
    console.log("❌ .env.local not found. Creating template...");
    const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Firecrawl API Key
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# OpenAI API Key (for brand analysis)
OPENAI_API_KEY=your_openai_api_key_here
`;
    fs.writeFileSync('.env.local', envTemplate);
    console.log("✅ Created .env.local template. Please fill in your API keys!");
    fixesApplied++;
} else {
    console.log("✅ .env.local exists");
}

// Fix 3: Check TypeScript build
console.log("\n🔍 Checking TypeScript configuration...");
if (fs.existsSync('tsconfig.json')) {
    console.log("✅ tsconfig.json exists");
} else {
    console.log("⚠️ tsconfig.json not found. This might cause build issues.");
}

// Fix 4: Clear Next.js cache if build errors exist
console.log("\n🗑️ Checking for stale build cache...");
if (fs.existsSync('.next')) {
    console.log("Found .next directory. Consider clearing it if you have build issues.");
    console.log("Run: rm -rf .next && npm run build");
}

console.log(`\n✨ Quick Fix Complete! Applied ${fixesApplied} fixes.`);

if (fixesApplied === 0) {
    console.log("🎉 No issues detected! Your project looks good.");
} else {
    console.log("\n💡 Next steps:");
    console.log("1. Fill in your API keys in .env.local");
    console.log("2. Run 'npm run dev' to start the development server");
    console.log("3. If issues persist, run 'npm run ai-diagnose' and share with your AI assistant");
}
