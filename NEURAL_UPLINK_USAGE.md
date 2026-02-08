# Neural Uplink Component - Usage Guide

## Overview
The Neural Uplink is a real-time AI agent demo that connects to your Brand DNA to answer questions via voice or text using Gemini 2.0 Flash.

## Quick Start

### 1. Import the Component
```tsx
import NeuralUplink from '@/components/dashboard/NeuralUplink';
```

### 2. Prepare Brand DNA
```tsx
const brandDNA = {
  business_name: 'Acme Pizza',
  tone: 'Friendly and casual',
  business_intel: {
    hours: 'Open 11am - 10pm daily',
    menu: ['Pepperoni Pizza', 'Margherita', 'Hawaiian'],
    specialOffer: '$19 Family Night on Tuesdays',
  },
};
```

### 3. Render the Component
```tsx
<NeuralUplink brandDNA={brandDNA} />
```

## Features

### Voice Agent (Left Node)
- **Push to Talk**: Click to activate speech recognition
- **Visual Waveform**: Animates when listening
- **Voice Response**: AI response is spoken aloud using browser TTS
- **Browser Support**: Requires Chrome for full functionality

### Chat Agent (Right Node)
- **Text Input**: Type questions directly
- **Data Stream**: Matrix-style animation when processing
- **Instant Responses**: Powered by Gemini 2.0 Flash

### Brand DNA Core (Center)
- **Pulsing Orb**: Shows system status
- **Data Packets**: Animated dots during processing
- **Connection Lines**: Visual links to agents

## Example Integration

### In a Dashboard Page
```tsx
'use client';

import { useEffect, useState } from 'react';
import NeuralUplink from '@/components/dashboard/NeuralUplink';

export default function DemoPage() {
  const [brandDNA, setBrandDNA] = useState(null);

  useEffect(() => {
    // Load from localStorage or Supabase
    const stored = localStorage.getItem('brandDNA');
    if (stored) {
      setBrandDNA(JSON.parse(stored));
    }
  }, []);

  if (!brandDNA) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <NeuralUplink brandDNA={brandDNA} />
    </div>
  );
}
```

## API Endpoint

### Request Format
```typescript
POST /api/demo/agent

{
  "message": "What time do you close?",
  "brandDNA": {
    "business_name": "Acme Pizza",
    "tone": "Friendly",
    "business_intel": { ... }
  }
}
```

### Response Format
```typescript
{
  "success": true,
  "response": "We're open until 10pm tonight!"
}
```

## Customization

### Adjust Colors
The component uses these key colors:
- **Gold Orb**: `bg-yellow-500` (Brand DNA core)
- **Blue Agent**: `border-blue-500` (Voice agent active)
- **Green Agent**: `border-green-500` (Chat agent active)

### Modify Response Length
Edit `app/api/demo/agent/route.ts`:
```typescript
generationConfig: {
  temperature: 0.7,
  maxOutputTokens: 150, // Increase for longer responses
}
```

### Change Voice Personality
The voice selection logic is in the component:
```typescript
if (tone.includes('professional')) {
  // Select deeper voice
}
```

## Troubleshooting

### "Voice features require Chrome browser"
- Speech Recognition is only fully supported in Chrome
- Safari/Firefox users can still use text chat

### "Neural link offline - API key not configured"
- Ensure `GOOGLE_AI_API_KEY` is set in `.env.local`
- Restart dev server after adding env vars

### No response / Timeout
- Check Gemini API quota/limits
- Verify brandDNA has valid `business_intel` data

## Performance Notes

- **Typing Speed**: 30ms per character (adjustable in component)
- **Processing**: Typically 1-2 seconds with Gemini 2.0 Flash
- **Animations**: 60fps using Framer Motion hardware acceleration

## Next Steps

1. ✅ Component is production-ready
2. Add to your dashboard or demo page
3. Customize brand colors to match your theme
4. Test with real customer questions
5. Monitor API usage and adjust `maxOutputTokens` if needed
