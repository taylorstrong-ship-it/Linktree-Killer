# 🤖 AI-Powered Maintenance System

## What is This?

This project now includes an **AI-Assisted Maintenance System** that allows you to fix bugs, add features, and maintain your app **without needing to be a coding expert**. You just describe the problem to an AI agent (like Manus, Claude, or ChatGPT), and it does the heavy lifting for you.

## Quick Start (3 Steps)

### 1. Something's Broken?

Run this command in your terminal:

```bash
npm run ai-diagnose
```

### 2. Share the Output with Your AI

Copy the entire output from the terminal and paste it into your AI chat. Then say:

> "My Linktree Killer app has issues. Here's the diagnostic report: [paste output]. Please analyze and fix the problems."

### 3. Let the AI Fix It

The AI will:
- Read the diagnostic report
- Identify the specific issues
- Navigate to the correct files
- Apply the necessary fixes
- Explain what it did

## Available Commands

| Command | What It Does |
|---------|--------------|
| `npm run ai-diagnose` | Runs a health check and shows you what's working and what's not |
| `npm run quick-fix` | Automatically fixes common setup issues (missing dependencies, .env file, etc.) |
| `npm run dev` | Starts the development server so you can test your app locally |
| `npm run build` | Builds your app for production (checks for errors before deploying) |

## How It Works

This system has three key components:

### 1. **AI-Friendly Code Comments**

Every major file in your project now has comments at the top that explain:
- What the file does
- How it works
- What to check if something goes wrong

These comments are written specifically for AI agents so they can understand your code quickly.

### 2. **Automated Diagnostic Scripts**

The `ai-diagnose` command checks:
- ✅ Are all environment variables set?
- ✅ Do all critical files exist?
- ✅ Are all dependencies installed?

This gives the AI a clear picture of what's wrong.

### 3. **Pre-Written Fix Prompts**

The `AI_MAINTENANCE_GUIDE.md` file contains ready-to-use prompts for common issues:
- Links not showing up
- Brand scraping fails
- Database connection errors
- Deployment failures
- And more...

Just copy the relevant prompt and send it to your AI.

## Example: Fixing a Bug

Let's say your links aren't appearing on the public profile page. Here's what you do:

1. **Run diagnostics:**
   ```bash
   npm run ai-diagnose
   ```

2. **Tell your AI:**
   > "Links aren't showing up on my public profile page. Here's the diagnostic report: [paste output]. Please check the database schema, the saveProfile function in app/builder/page.tsx, and the rendering logic in app/[username]/page.tsx."

3. **AI fixes it:**
   The AI will read the relevant files, identify the issue (maybe the links array isn't being saved correctly), and apply the fix.

4. **Test it:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` and check if the links now appear.

## Example: Adding a Feature

You can also use AI to add new features. Here's an example:

**Your Prompt:**
> "I want to add a 'Featured Video' section to my link-in-bio page. Add an input field in the builder for a YouTube URL, save it to the database, and display an embedded YouTube player on the public profile page if the URL exists."

**AI Response:**
The AI will:
1. Add a new field to the builder form
2. Update the database schema (or tell you how to)
3. Add the YouTube embed to the public profile page
4. Test the implementation

## Pro Tips

1. **Be Specific:** Instead of "it's broken", say "the links aren't saving to the database when I click Save"
2. **Share Error Messages:** If you see an error in the console, copy the exact error message
3. **Test One Thing at a Time:** Fix one issue before moving to the next
4. **Commit to Git:** Before making big changes, commit your code so you can revert if needed
5. **Ask for Explanations:** Tell the AI to explain what it changed and why

## Files You Should Know About

- **`AI_MAINTENANCE_GUIDE.md`** - The complete guide for AI agents (and you!)
- **`scripts/health-check.js`** - The diagnostic script
- **`scripts/quick-fix.js`** - Automatic fixes for common issues
- **`app/page.tsx`** - The homepage (URL input)
- **`app/builder/page.tsx`** - The builder interface
- **`app/[username]/page.tsx`** - The public link-in-bio page
- **`app/api/brand-dna/route.ts`** - The brand scraping API

## Need Help?

If you're stuck, just ask your AI:

> "I'm not sure what's wrong with my Linktree Killer app. Can you help me debug it? Here's the diagnostic report: [paste output from npm run ai-diagnose]"

The AI will guide you through the process.

---

**Remember:** You don't need to be a coding expert. The AI is your co-pilot. You tell it what you want, and it makes it happen. 🚀
