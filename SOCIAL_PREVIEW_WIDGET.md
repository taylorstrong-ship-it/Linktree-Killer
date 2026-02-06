# SocialPreviewWidget - Usage Guide

## 🎯 Quick Integration

```tsx
import SocialPreviewWidget from '@/components/dashboard/SocialPreviewWidget';

function Dashboard() {
  const brandData = {
    businessName: "Acme Fitness",
    logo_url: "https://...",
    vibe: "Bold & Energetic",
    primaryColor: "#FF6B35",
    industry: "Fitness"
  };

  const handleEdit = () => {
    // Save state logic
    console.log('Editing...');
  };

  return (
    <div className="p-8">
      <SocialPreviewWidget 
        brandData={brandData}
        handleEditPage={handleEdit}
      />
    </div>
  );
}
```

---

## 📱 Component Features

### 1. iPhone 15 Pro Mockup
- **Glassmorphism** aesthetic with dark mode
- **Realistic notch** and device frame
- **375x812 screen** dimensions (actual iPhone scale)
- **Subtle glow** effect for premium feel

### 2. Pre-Cognition Logic
- **Auto-generates** on component mount (500ms delay)
- **Uses brand assets**: logo_url or hero_image as base
- **Default prompt**: "Welcome to [BusinessName]. Aesthetic: [Vibe]."
- **Smart fallback**: Uses defaults if brand data incomplete

### 3. Visual States

| State | Animation | Display |
|-------|-----------|---------|
| **Loading** | Radar scan (green gradient sweep) | Grid background + pulsing rings |
| **Success** | Smooth cross-fade (0.6s ease-out) | Generated Base64 image |
| **Error** | Fade in | Error message with fallback text |

### 4. Remix Button
- **Appears** after successful generation (0.5s delay)
- **Floating** design with orange gradient
- **Z-index 20** for overlay priority
- **Saves state** to localStorage before routing
- **Routes to** `/generator?remix=true`

---

## 🎨 Design System

### Colors
- **Primary**: Orange gradient (`#FF6B35` → `#FF8C42`)
- **Loading**: Hacker Green (`#00FF41`)
- **Background**: Zinc-900/950 (Industrial Luxury)
- **Borders**: White/10 (Subtle glassmorphism)

### Animations
- **Radar sweep**: 3s linear infinite rotation
- **Pulse rings**: 2s staggered ease-out
- **Cross-fade**: 0.6s ease-out (loading → success)
- **Button hover**: Scale 1.05, enhanced shadow

---

## 🔧 Props Interface

```typescript
interface BrandData {
  businessName: string;      // Required
  logo_url?: string;         // Optional - used as base image
  hero_image?: string;       // Optional - fallback if no logo
  vibe?: string;             // Optional - defaults to "Premium & Professional"
  primaryColor?: string;     // Optional - defaults to "#FF6B35"
  industry?: string;         // Optional - defaults to "Business"
}

interface SocialPreviewWidgetProps {
  brandData: BrandData;
  handleEditPage?: () => void;  // Optional - called before routing
}
```

---

## ⚡ Performance Notes

### Optimization Strategies
1. **500ms mount delay** prevents flash during initial render
2. **Base64 caching** via localStorage on Remix click
3. **Framer Motion** AnimatePresence for smooth state transitions
4. **Will-change** properties on animated elements

### Expected Behavior
- **First 500ms**: Component mounts, shows nothing
- **0.5-3s**: Radar scan animation while API processes
- **3s+**: Cross-fade to generated image
- **On success**: Remix button slides up from bottom

---

## 🚨 Error Handling

### Common Scenarios

| Error | Cause | Display |
|-------|-------|---------|
| No brand image | Missing logo_url and hero_image | "No brand image available" |
| API failure | Network/server error | "Preview generation unavailable" |
| Invalid response | Malformed API data | "Failed to generate image" |

### Graceful Degradation
- Errors show clean message in phone mockup
- No broken UI or white screens
- Console logs full error for debugging

---

## 🎬 Example Use Cases

### Dashboard Widget
```tsx
<div className="grid grid-cols-2 gap-8">
  <div>
    <h2>Brand Analytics</h2>
    {/* Charts, stats */}
  </div>
  
  <div>
    <h2>Social Preview</h2>
    <SocialPreviewWidget brandData={brandData} />
  </div>
</div>
```

### Onboarding Flow
```tsx
<div className="space-y-6">
  <h1>Welcome! Here's your first preview...</h1>
  <SocialPreviewWidget 
    brandData={scannedBrandData}
    handleEditPage={() => router.push('/builder')}
  />
</div>
```

### Generator Page Integration
```tsx
// On /generator page, check for remix flag
const searchParams = useSearchParams();
const isRemix = searchParams.get('remix') === 'true';

useEffect(() => {
  if (isRemix) {
    const draft = localStorage.getItem('social_preview_draft');
    if (draft) {
      setPreviewImage(draft);
    }
  }
}, [isRemix]);
```

---

## 📋 Integration Checklist

- [ ] Import component in your page/dashboard
- [ ] Pass valid `brandData` with at least `businessName`
- [ ] Ensure Google AI API key is configured
- [ ] Test loading, success, and error states
- [ ] Verify Remix button routes correctly
- [ ] Check mobile responsiveness (375px phone width)

---

## 🔗 Related Files

- [`/api/ai-design/route.ts`](file:///Users/taylorstrong/Desktop/Manual%20Library/Linktree%20Killer/app/api/ai-design/route.ts) - Backend API
- [`AI_DESIGN_API.md`](file:///Users/taylorstrong/Desktop/Manual%20Library/Linktree%20Killer/AI_DESIGN_API.md) - API documentation
- [`SocialCardMockup.tsx`](file:///Users/taylorstrong/Desktop/Manual%20Library/Linktree%20Killer/components/dashboard/SocialCardMockup.tsx) - Similar pattern reference

---

Ready to wow your users with instant social previews! 🚀
