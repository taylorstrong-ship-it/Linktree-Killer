# AI Model Audit - Complete Inventory

## 🎯 Current Model Usage Across Codebase

### ✅ CUTTING-EDGE (Latest Models)

| File | Model | Status |
|------|-------|--------|
| `app/api/demo/agent/route.ts` | `gemini-3-flash-preview` | ✅ Latest |
| `app/api/ai-design/route.ts` | `gemini-3-flash-preview` | ✅ Latest |
| `app/api/create-agent/route.ts` | `gpt-4o` | ✅ Latest OpenAI |
| `app/api/brand-dna/route 2.ts` | `gpt-4o` | ✅ Latest OpenAI |
| `supabase/functions/extract-brand-dna/index.ts` | `gpt-4o` | ✅ Latest OpenAI |
| `supabase/functions/extract-brand-dna/index.ts` | `claude-3-5-sonnet-20241022` | ✅ Latest Anthropic |

### ⚠️ OUTDATED (Should Upgrade)

| File | Model | Issue | Recommended Upgrade |
|------|-------|-------|---------------------|
| `app/api/scan/route 2.ts` | `gpt-3.5-turbo` | ⚠️ Old (2023) | → `gpt-4o-mini` or `gpt-4o` |
| `app/api/create-agent/route.ts` | `gpt-4-turbo` | ⚠️ Superseded | → `gpt-4o` |
| `app/api/train-voice/route.ts` | `gpt-4-turbo` | ⚠️ Superseded | → `gpt-4o` |
| `app/actions/magic-scrape.ts` | `gpt-4o-mini` | ✅ OK (cost-effective) | Consider `gpt-4o` for quality |

### 🤔 UNKNOWN (Need Verification)

| File | Model | Status |
|------|-------|--------|
| `supabase/functions/generate-social-post/index.ts` | `gemini-3-pro-image-preview` | ❓ Check if this exists |
| `supabase/functions/extract-brand-dna/index.ts` | `gpt-4o-mini` | ✅ OK (fallback) |

---

## 📋 Recommended Actions

### Priority 1: Fix Breaking Issues
- [ ] Verify `gemini-3-pro-image-preview` exists (or upgrade to Gemini 3 Flash)

### Priority 2: Upgrade Outdated Models
- [ ] `app/api/scan/route 2.ts`: `gpt-3.5-turbo` → `gpt-4o-mini`
- [ ] `app/api/create-agent/route.ts`: `gpt-4-turbo` → `gpt-4o`
- [ ] `app/api/train-voice/route.ts`: `gpt-4-turbo` → `gpt-4o`

### Priority 3: Consider Quality Upgrades
- [ ] `app/actions/magic-scrape.ts`: `gpt-4o-mini` → `gpt-4o` (if budget allows)

---

## 🔍 Model Version Reference (Feb 2026)

### Google Gemini (Latest)
- **Flash (Speed):** `gemini-3-flash-preview` ✅ **USE THIS**
- **Pro (Quality):** `gemini-3-pro-preview` (if available)
- **Deprecated:** `gemini-2.0-flash-exp` ❌ (EOL: March 31, 2026)

### OpenAI (Latest)
- **Flagship:** `gpt-4o` ✅ **USE THIS** (Multimodal, fast, smart)
- **Cost-effective:** `gpt-4o-mini` ✅ (Good for simple tasks)
- **Deprecated:** `gpt-4-turbo` ⚠️ (Superseded by gpt-4o)
- **Legacy:** `gpt-3.5-turbo` ❌ (Old, should not use)

### Anthropic Claude (Latest)
- **Best:** `claude-3-5-sonnet-20241022` ✅ **USE THIS**
- **Fast:** `claude-3-5-haiku-20241022` ✅
- **Legacy:** `claude-3-opus-*` ⚠️ (Expensive, slower)

---

## 🎯 Model Selection Strategy

### Use Gemini 3 Flash For:
- ✅ Real-time chat (Neural Uplink)
- ✅ Image generation (AI Design)
- ✅ Fast responses (< 2s)
- ✅ Cost-sensitive operations

### Use GPT-4o For:
- ✅ Complex reasoning (Brand DNA extraction)
- ✅ Structured outputs (JSON parsing)
- ✅ Multi-step tasks (Agent creation)
- ✅ When you need reliability

### Use Claude 3.5 Sonnet For:
- ✅ Long-form content (Blog posts)
- ✅ Code generation
- ✅ Nuanced understanding
- ✅ Safety-critical tasks

---

## 🚨 Critical Findings

### Found Potential Issue
**File:** `supabase/functions/generate-social-post/index.ts`
```typescript
model: 'gemini-3-pro-image-preview'
```

**Problem:** This model name doesn't match Google's official naming. Should be:
- `gemini-3-flash-preview` (for speed)
- OR `gemini-3-pro-preview` (if pro tier exists)

**Action Required:** Verify this model exists or update to `gemini-3-flash-preview`

---

## ✅ Next Steps

Want me to:
1. **Auto-upgrade all outdated models** to latest versions?
2. **Verify the `gemini-3-pro-image-preview` model** in the social post function?
3. **Create a model version constant file** to centralize model names?

Let me know and I'll make the upgrades! 🚀
