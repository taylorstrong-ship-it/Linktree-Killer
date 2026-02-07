# Quick Test: Intelligent Image Selection

## 🎯 Goal
Verify Millie's Italian shows REAL pasta photo (not hallucinated lasagna or logo)

## 📋 Steps

### 1. Open Browser
```
http://localhost:3000
```

### 2. Open DevTools Console (Cmd+Option+I)

### 3. Clear State
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 4. Scan Millie's
- Enter: `milliesitalian.com`
- Click scan button

### 5. Check Console Logs

**✅ SUCCESS looks like:**
```
🎯 [Smart Selection] Analyzing brand images...
  📸 Found 10 brand images
  ⚠️ Skipping logo: MILLIES+LOGO+.png
  ✅ BEST IMAGE: fresh-pasta-5154229.jpeg (score: 185)
```

**❌ FAILURE looks like:**
```
// No smart selection logs, OR
// Logo is selected as best image
```

### 6. Verify Preview
- Generated preview should show **REAL pasta photo**
- NOT Millie's text logo
- NOT AI-generated lasagna

## 📸 Screenshot
Take a screenshot of:
1. Console logs showing "BEST IMAGE" selection
2. The generated preview showing real food

## ✅ Pass Criteria
- Console shows smart selection working
- Real product photo displayed
- No hallucinated content
