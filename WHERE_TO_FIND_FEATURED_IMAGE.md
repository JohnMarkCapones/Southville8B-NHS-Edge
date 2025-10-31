# 📍 Where to Find Featured Image Upload

## 🚀 Frontend is Running!

Your frontend is now running on: **http://localhost:3001**

---

## 📍 Step-by-Step Guide

### 1. Open Your Browser
Open any browser (Chrome, Firefox, Edge, etc.)

### 2. Navigate to Announcements
```
http://localhost:3001/superadmin/announcements
```

### 3. Click "Create Banner" Button
Look for the button in the top-right area of the page

### 4. Scroll Down to Find Featured Image
In the Create Banner dialog, you'll see these sections in order:
1. Full Message (textarea)
2. Short Message (input)
3. Banner Type (dropdown)
4. **📷 Featured Image (Optional)** ← HERE!
5. Schedule (Important!)
6. Settings
7. Template (optional)

---

## 🎯 What You'll See

### Featured Image Section:
```
┌─────────────────────────────────────────────┐
│  📷 Featured Image (Optional)               │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │                                       │ │
│  │         ⬆ Upload Icon                │ │
│  │                                       │ │
│  │   Click to upload or drag and drop   │ │
│  │   PNG, JPG up to 10MB                │ │
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✅ What to Test

### Test 1: Click to Upload
1. **Click anywhere** in the dashed box
2. File browser should open
3. Select an image file (PNG, JPG, etc.)
4. Preview should appear

### Test 2: Drag and Drop
1. Open a folder with an image
2. **Drag the image file** onto the dashed box
3. Box turns blue when hovering
4. **Drop the file**
5. Preview should appear

### Test 3: Change Image
1. After uploading an image
2. **Hover** over the preview
3. Two buttons appear: "Change" and "Remove"
4. Click **"Change"**
5. File browser opens again

### Test 4: Remove Image
1. After uploading an image
2. **Hover** over the preview
3. Click **"Remove"**
4. Image clears, back to empty state

---

## 🔍 Quick Reference

### URLs:
- **Announcements Page:** `http://localhost:3001/superadmin/announcements`
- **Banner Dialog:** Click "Create Banner" button on that page
- **Featured Image:** Inside the dialog, below "Banner Type" field

### File Location:
- **Component:** `frontend-nextjs/components/ui/featured-image-upload.tsx`
- **Used In:** `frontend-nextjs/components/banners/create-banner-dialog.tsx`

### Ports:
- **Frontend:** http://localhost:3001 (was 3000 but already in use)
- **Backend API:** http://localhost:3004

---

## 🎨 Visual Guide

```
Browser: http://localhost:3001/superadmin/announcements
    ↓
┌────────────────────────────────────────────┐
│  Announcements Page                        │
│  ┌──────────────────────────────────────┐ │
│  │  [+ Create Banner] button   →  CLICK│ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────┐
│  Create Banner Notification          [×]  │
├────────────────────────────────────────────┤
│                                            │
│  Full Message *                            │
│  [________________________]                │
│                                            │
│  Short Message *                           │
│  [________________________]                │
│                                            │
│  Banner Type *                             │
│  [Info (Blue)            ▼]                │
│                                            │
│  📷 Featured Image (Optional)              │
│  ┌──────────────────────────────────────┐ │
│  │  ⬆ Upload Icon                       │ │ ← CLICK HERE!
│  │  Click to upload or drag and drop    │ │
│  │  PNG, JPG up to 10MB                 │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  📅 Schedule (Important!)                  │
│  ...                                       │
└────────────────────────────────────────────┘
```

---

## ⚠️ If You Don't See It

### Refresh the Page
Press `Ctrl + R` or `F5` to reload the page with the latest code

### Check the URL
Make sure you're on:
```
http://localhost:3001/superadmin/announcements
```

### Check If Dialog Opens
1. Can you see the "Create Banner" button?
2. Does clicking it open a dialog/modal?
3. Can you scroll down inside the dialog?

### Clear Browser Cache
Press `Ctrl + Shift + R` (hard refresh)

---

## 🎯 Expected Behavior

### When You Click:
1. File browser opens **immediately**
2. You can select any image file
3. Preview appears in the same box
4. Image is converted to base64
5. Stored in form data as `featuredImageUrl`

### When You Submit:
1. Image data is included in the banner creation
2. Sent to backend API
3. Saved to database

---

## 📱 Mobile/Tablet

If testing on mobile:
1. Tap the upload box
2. Camera/gallery options appear
3. Select or take a photo
4. Preview appears

---

## ✅ Summary

**Where to find it:**
1. Open browser → `http://localhost:3001/superadmin/announcements`
2. Click "Create Banner" button
3. Scroll down in dialog
4. Look for "📷 Featured Image (Optional)"
5. **Click the dashed box** to upload!

**It's right there in the banner creation form!** 🎉
