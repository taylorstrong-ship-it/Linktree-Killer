#!/usr/bin/env node

console.log("🏥 Linktree Killer Health Check\n");

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'FIRECRAWL_API_KEY'
];

console.log("📋 Environment Variables:");
requiredEnvVars.forEach(varName => {
  const exists = process.env[varName] ? '✅' : '❌';
  console.log(`${exists} ${varName}`);
});

// Check critical files
const fs = require('fs');
const criticalFiles = [
  'app/page.tsx',
  'app/builder/page.tsx',
  'app/[username]/page.tsx',
  'lib/supabase/client.ts',
  'app/api/brand-dna/route.ts'
];

console.log("\n📁 Critical Files:");
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file) ? '✅' : '❌';
  console.log(`${exists} ${file}`);
});

// Check dependencies
console.log("\n📦 Dependencies:");
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const criticalDeps = ['next', 'react', '@supabase/supabase-js', '@mendable/firecrawl-js'];

criticalDeps.forEach(dep => {
  const version = packageJson.dependencies[dep];
  const status = version ? '✅' : '❌';
  console.log(`${status} ${dep} ${version || '(missing)'}`);
});

console.log("\n✨ Health check complete!");
