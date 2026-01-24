# Directive: Extract Brand Identity

## The Goal
Create a tool that takes a `websiteUrl` as input and returns a JSON object with:
* `brandColor`: The dominant hex code (e.g., #3b82f6).
* `businessName`: The name of the entity.
* `bio`: A 2-sentence summary of what they do.
* `logoUrl`: The absolute URL of their logo (look for og:image or distinct logo img tags).
* `links`: An array of up to 4 key links found in the nav or footer.

## The Process

### Step A: Scrape
Make a POST request to `https://api.firecrawl.dev/v0/scrape`.

**Headers:**
- `Authorization`: `Bearer <FIRECRAWL_KEY>` (Load from env)
- `Content-Type`: `application/json`

**Body:**
```json
{
  "url": "<websiteUrl>",
  "pageOptions": {
    "onlyMainContent": true
  }
}
```

### Step B: Analyze
Take the `markdown` content from the FireCrawl response.

### Step C: Extract
Analyze the markdown (using LLM or regex/parsing if robust enough, but Directive implies LLM) to find specific JSON fields defined in "The Goal".

## Error Handling
If the scrape fails or the URL is invalid, return a default JSON:
```json
{
  "brandColor": "#000000",
  "error": true
}
```

## Integration
This logic drives the "Auto-Build" button in the Linktree Killer UI.
- **Trigger**: User enters URL in "AI Import" box and clicks "Auto-Build".
- **Action**: Backend (`api/generate.js`) executes this flows.
- **Result**: Frontend populates "Theme Colors", "Branding", and "Links" sections.
