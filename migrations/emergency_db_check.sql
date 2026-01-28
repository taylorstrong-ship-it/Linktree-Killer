-- Emergency Database Check & Fix
-- Run this in Supabase SQL Editor to verify and fix your profile data

-- 1. CHECK CURRENT DATA
SELECT 
    id,
    username,
    title,
    description,
    avatar_url,
    links,
    socials,
    created_at,
    updated_at
FROM profiles
WHERE username = 'tayloredpetportraits'
ORDER BY updated_at DESC
LIMIT 1;

-- 2. If the data looks wrong, run this to MANUALLY FIX IT:
-- (Uncomment and customize with your correct values)

/*
UPDATE profiles
SET 
    title = 'Taylored Pet Portraits',
    description = 'Capturing the paws, claws, and personality of your best friends. ✨',
    avatar_url = 'https://YOUR_CORRECT_PUG_IMAGE_URL.jpg',
    socials = jsonb_build_object(
        'instagram', 'https://instagram.com/tayloredpetportraits',
        'tiktok', 'https://tiktok.com/@tayloredpetportraits',
        'facebook', '',
        'email', 'your@email.com'
    ),
    links = jsonb_build_array(
        jsonb_build_object('title', 'Book Session', 'url', 'https://your-booking-url.com')
    ),
    updated_at = NOW()
WHERE username = 'tayloredpetportraits';
*/

-- 3. VERIFY THE UPDATE
SELECT title, avatar_url, socials, links
FROM profiles
WHERE username = 'tayloredpetportraits';
