# 🤖 AI Maintenance Guide - Linktree Killer

**For Non-Coders:** This guide helps you use AI agents (like Manus, Claude, ChatGPT) to automatically fix your app without needing to understand code.

## 🎯 Quick Start: "My App is Broken, Fix It!"

When something goes wrong, just run this command and share the output with your AI:

```bash
npm run ai-diagnose
```

Then tell your AI:
> "My Linktree Killer app has issues. Here's the diagnostic report: [paste output]. Please analyze and fix the problems."

---

## 📋 What This System Does

This AI maintenance system gives AI agents everything they need to:

1. **Understand your codebase** - Clear maps of where everything is
2. **Detect problems automatically** - Scripts that find common issues
3. **Fix issues independently** - Step-by-step repair procedures
4. **Verify fixes work** - Automated testing after repairs

---

## 🗺️ Codebase Map (For AI Agents)

### Core Files Structure

```
linktree-killer/
├── app/
│   ├── page.tsx                    # Homepage - URL input & brand scanning
│   ├── builder/page.tsx            # Main builder interface
│   ├── [username]/page.tsx         # Public link-in-bio pages
│   ├── api/
│   │   ├── brand-dna/route.ts     # Brand extraction API
│   │   ├── analyze/route.ts        # Link analysis
│   │   └── scan/route.ts           # Website scraping
│   └── login/page.tsx              # Authentication
├── components/
│   ├── PhonePreview.tsx            # Live preview component
│   ├── AuthModal.tsx               # Login/signup modal
│   ├── ImageUpload.tsx             # Image upload handler
│   └── hub/
│       ├── MatrixOverlay.tsx       # Loading animation
│       └── BioLinkBuilder.tsx      # Link builder UI
├── lib/
│   └── supabase/
│       └── client.ts               # Database connection
└── package.json                    # Dependencies
```

### Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | Framework | 15.1.4 |
| **React** | UI Library | 19.0.0 |
| **Supabase** | Database & Auth | 2.91.1 |
| **Firecrawl** | Web Scraping | 4.11.4 |
| **Framer Motion** | Animations | 12.29.0 |
| **Tailwind CSS** | Styling | 3.4.1 |

---

## 🔍 Common Issues & AI Fix Prompts

### Issue 1: "Links Not Showing Up"

**Symptoms:**
- Links appear in builder but not on public page
- Empty links array in database

**AI Fix Prompt:**
```
The links are not appearing on the public profile page. Please:
1. Check the database schema in the profiles table
2. Verify the links are being saved correctly in app/builder/page.tsx (saveProfile function)
3. Check if app/[username]/page.tsx is reading links correctly
4. Ensure the links array is not being filtered out
```

### Issue 2: "Brand Scraping Fails"

**Symptoms:**
- "API Failed" message appears
- Firecrawl returns errors
- Mock data always shows instead

**AI Fix Prompt:**
```
Brand scraping is failing. Please:
1. Check if FIRECRAWL_API_KEY is set in environment variables
2. Verify app/api/brand-dna/route.ts is handling errors correctly
3. Test the Firecrawl API connection
4. Check if the fallback mock data logic is triggering too early
```

### Issue 3: "Database Connection Errors"

**Symptoms:**
- "Failed to fetch" errors
- Can't save or load profiles
- Supabase errors in console

**AI Fix Prompt:**
```
Database connection is failing. Please:
1. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
2. Check lib/supabase/client.ts configuration
3. Test the Supabase connection
4. Verify RLS (Row Level Security) policies are not blocking access
```

### Issue 4: "Deployment Fails on Vercel"

**Symptoms:**
- Build errors on Vercel
- "Module not found" errors
- TypeScript compilation errors

**AI Fix Prompt:**
```
Vercel deployment is failing. Please:
1. Check the build logs for specific errors
2. Verify all dependencies are in package.json
3. Check for TypeScript errors in the codebase
4. Ensure environment variables are set in Vercel dashboard
5. Verify Next.js configuration in next.config.js
```

### Issue 5: "Drag and Drop Not Working"

**Symptoms:**
- Can't reorder links by dragging
- Only Up/Down buttons work

**AI Fix Prompt:**
```
Drag and drop is not implemented. Please:
1. Install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
2. Implement drag-and-drop in app/builder/page.tsx for the links section
3. Add visual drag handles to link items
4. Test the implementation on both desktop and mobile
```

---

## 🛠️ Automated Diagnostic Scripts

### Health Check Script

Create this file: `scripts/health-check.js`

```javascript
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
```

Add to `package.json`:
```json
"scripts": {
  "ai-diagnose": "node scripts/health-check.js"
}
```

---

### Issue 6: "Styling is Broken or Looks Weird"

**Symptoms:**
- Layout is misaligned
- Colors or fonts are incorrect
- Tailwind CSS classes are not being applied

**AI Fix Prompt:**
```
The styling on the page is broken. Please:
1. Check for any syntax errors in the `className` attributes of the affected components.
2. Verify that `tailwind.config.ts` is correctly configured and that the theme colors and fonts are defined properly.
3. Ensure that the main `globals.css` file is being imported correctly in `app/layout.tsx`.
4. Inspect the browser's developer tools for any CSS errors or conflicting styles.
5. If the issue is component-specific, review the styling of that component file.
```

---

## ⚙️ Advanced AI Tasks

Beyond fixing bugs, you can use AI to actively improve your app.

### Task: Add a New Feature

**Example Prompt:**
```
I want to add a new feature to my Linktree Killer app: a "Featured Video" section on the public profile page.

**Requirements:**
1. In the builder (`app/builder/page.tsx`), add a new input field for a YouTube video URL.
2. Save this URL to the `profiles` table in Supabase. You'll likely need to add a `featured_video_url` column to the table.
3. On the public profile page (`app/[username]/page.tsx`), if a `featured_video_url` exists, display an embedded YouTube player.
4. The player should be responsive and look good on mobile devices.

Please implement this feature.
```

### Task: Refactor Code for Better Performance

**Example Prompt:**
```
I want to improve the performance of my Linktree Killer app. Please analyze the codebase and refactor it for better speed and efficiency.

**Areas to Focus On:**
1. **Data Fetching:** Can we optimize the Supabase queries in `app/[username]/page.tsx` and `app/builder/page.tsx`?
2. **Component Rendering:** Are there any unnecessary re-renders in the builder page? Can we use `React.memo` or other memoization techniques?
3. **Bundle Size:** Are there any large dependencies that can be replaced with smaller alternatives? Can we lazy-load any components?
4. **Image Optimization:** Ensure that all images are being served in modern formats (like WebP) and are properly sized.

Please apply these optimizations and explain the changes you made.
```

---

## ✨ AI-Powered Fix Workflow

### Step 1: Run Diagnostics
```bash
npm run ai-diagnose
```

### Step 2: Share with AI
Copy the entire output and send it to your AI agent with:
> "Here's my diagnostic report. Please identify and fix any issues."

### Step 3: AI Analyzes & Fixes
The AI will:
1. Read the diagnostic output
2. Identify specific problems
3. Navigate to the relevant files
4. Apply fixes
5. Test the changes

### Step 4: Verify
Run the app locally:
```bash
npm run dev
```

Or deploy to Vercel:
```bash
git add .
git commit -m "AI fixes applied"
git push
```

---

## 📚 AI Agent Instructions

**For AI Agents Reading This:**

When asked to fix issues in this codebase:

1. **Always start with diagnostics** - Run `npm run ai-diagnose` to understand the current state
2. **Check the Codebase Map** - Use the file structure above to navigate
3. **Read related files** - Don't fix in isolation; understand the context
4. **Test your changes** - Verify the fix doesn't break other features
5. **Explain what you did** - Help the user understand the fix

**Common Patterns in This Codebase:**
- State management: React `useState` hooks
- Data flow: localStorage → Supabase → Public page
- Error handling: Try/catch with fallback to mock data
- Styling: Tailwind CSS utility classes
- API routes: Next.js App Router conventions

---

## 🎓 Learning Resources (Optional)

If you want to understand what the AI is doing:

- **Next.js Basics:** https://nextjs.org/learn
- **React Fundamentals:** https://react.dev/learn
- **Supabase Guide:** https://supabase.com/docs/guides/getting-started
- **Tailwind CSS:** https://tailwindcss.com/docs

But remember: **You don't need to learn all this!** That's what the AI is for. 🤖

---

## 💡 Pro Tips

1. **Be specific** - Instead of "it's broken", say "links aren't saving to the database"
2. **Share error messages** - Copy the exact error from the console
3. **Test incrementally** - Fix one thing at a time
4. **Keep backups** - Commit to Git before major AI fixes
5. **Ask for explanations** - Tell the AI to explain what it changed and why

---

**Remember:** This system is designed so you can say "fix this" and the AI does the heavy lifting. You're the architect, the AI is the builder. 🏗️
