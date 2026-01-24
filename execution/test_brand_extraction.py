import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

FIRECRAWL_KEY = os.getenv('FIRECRAWL_KEY')
TEST_URL = "https://tayloredpetportraits.com"

if not FIRECRAWL_KEY:
    print("Error: FIRECRAWL_KEY not found in .env")
    exit(1)

print(f"Testing FireCrawl API with key: {FIRECRAWL_KEY[:4]}...{FIRECRAWL_KEY[-4:]}")

url = "https://api.firecrawl.dev/v0/scrape"
headers = {
    "Authorization": f"Bearer {FIRECRAWL_KEY}",
    "Content-Type": "application/json"
}
data = {
    "url": TEST_URL,
    "pageOptions": {
        "onlyMainContent": True
    }
}

try:
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    result = response.json()
    
    if result.get('success'):
        print("✅ FireCrawl Scrape Successful!")
        print(f"Markdown Content Length: {len(result['data'].get('markdown', ''))}")
        # Save sample data
        with open('.tmp/firecrawl_sample.json', 'w') as f:
            json.dump(result, f, indent=2)
    else:
        print("❌ FireCrawl Scrape Failed (API returned success but 'success' field is false)")
        print(result)

except Exception as e:
    print(f"❌ Error: {str(e)}")
    if hasattr(e, 'response') and e.response is not None:
        print(e.response.text)
