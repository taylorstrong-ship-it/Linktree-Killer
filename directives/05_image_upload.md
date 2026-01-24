# Directive: Image Upload Feature

## The Goal
Replace the manual "paste URL" approach with a proper file upload button for avatar/logo images.

## The Process

### Step 1: Create Storage Bucket (Backend)
Run `CREATE_STORAGE_BUCKET.sql` in Supabase SQL Editor to:
- Create the `images` bucket
- Set up public read access (so profile pages can display images)
- Allow authenticated uploads, updates, and deletes

### Step 2: Frontend Implementation (Already Done)
The following changes were made to `builder.html`:

**UI Changes:**
- Changed "Avatar URL" label to "Avatar Image"
- Made URL input readonly (users can't paste anymore)
- Added hidden file input (`<input type="file">`)
- Added visible blue "Upload" button that triggers file selection

**JavaScript Logic:**
- `uploadAvatar(input)` function handles:
  - File validation (image type, max 5MB)
  - Upload to Supabase Storage bucket `images/`
  - Unique filename generation: `{user_id}/avatar-{timestamp}.{ext}`
  - Auto-populates URL field with public URL
  - Loading states and error handling

### Step 3: Test
1. Run `CREATE_STORAGE_BUCKET.sql` in Supabase
2. Reload the builder
3. Click "Upload" button
4. Select an image file
5. Confirm URL field populates automatically
6. Click "Save Changes"

## Edge Cases
- **File too large (>5MB)**: User sees error toast
- **Wrong file type**: User sees error toast
- **Upload fails**: Button restores to original state, error shown
- **Not authenticated**: Error handled gracefully
