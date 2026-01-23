# Setup Instructions

## OpenAI API Key Configuration

To enable the AI Magic Import feature, you need to add your OpenAI API key to Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `linktree-killer`
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `[Your OpenAI API Key]` (paste your key here)
   - **Environment:** Production, Preview, Development (select all)
6. Click **Save**
7. **Redeploy** your project (or wait for next auto-deploy)

## Testing the AI Import

Once the API key is set:
1. Go to `builder.html`
2. Paste a website URL in the "AI Magic Import" field
3. Click "AI Import"
4. Wait for AI to analyze and populate your form
