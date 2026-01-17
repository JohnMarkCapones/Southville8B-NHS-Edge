# Video Compression Guide

## Current Issue
Your hero video (`hero-blue-campus.mp4`) is **9.6MB**, which is causing slow page loads.

## Goal
Compress it to **~1MB** or less while maintaining acceptable quality.

---

## Option 1: Use FFmpeg (Recommended)

### Install FFmpeg

**Windows**:
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

**Mac**:
```bash
brew install ffmpeg
```

**Linux**:
```bash
sudo apt install ffmpeg
```

### Compress to WebM (Best Compression)

```bash
cd "C:\Users\John Mark\Music\Edge\Southville8B-NHS-Edge\frontend-nextjs\public\videos"

# High quality, smaller size
ffmpeg -i hero-blue-campus.mp4 -c:v libvpx-vp9 -crf 35 -b:v 0 -b:a 128k -c:a libopus hero-blue-campus.webm

# If that's still too large, increase CRF (lower quality)
ffmpeg -i hero-blue-campus.mp4 -c:v libvpx-vp9 -crf 40 -b:v 0 -b:a 96k -c:a libopus hero-blue-campus-compressed.webm
```

### Compress MP4 (Better Compatibility)

```bash
# Compress existing MP4
ffmpeg -i hero-blue-campus.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k hero-blue-campus-compressed.mp4

# Create multiple quality versions
ffmpeg -i hero-blue-campus.mp4 -c:v libx264 -crf 28 -preset slow -vf scale=1920:-1 -c:a aac -b:a 96k hero-1080p.mp4
ffmpeg -i hero-blue-campus.mp4 -c:v libx264 -crf 30 -preset slow -vf scale=1280:-1 -c:a aac -b:a 64k hero-720p.mp4
```

**CRF Values**:
- 18-23: Nearly lossless (large file)
- 23-28: High quality (good balance)
- 28-35: Medium quality (recommended for background videos)
- 35+: Lower quality (smallest files)

---

## Option 2: Online Tools (No Installation Required)

### Recommended Online Compressors:

1. **CloudConvert** (https://cloudconvert.com)
   - Upload your video
   - Convert to WebM or compress MP4
   - Settings: CRF 30-35, Audio bitrate 96k

2. **HandBrake** (https://handbrake.fr/) - Desktop App
   - Free, open-source
   - Preset: "Web > Gmail Small 5 Minutes 480p30"
   - Or custom: RF 28-32, 720p, AAC 96k

3. **Clideo** (https://clideo.com/compress-video)
   - Simple drag-and-drop
   - Automatic compression

4. **FreeConvert** (https://www.freeconvert.com/video-compressor)
   - Online, no signup
   - WebM/MP4 support

---

## Option 3: Replace Video with Animated Gradient

If the video isn't critical, consider using a CSS gradient animation instead:

```tsx
// In hero-section.tsx, replace video with:
<div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 animate-gradient" />
```

Add to `globals.css`:
```css
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}
```

**Benefit**: Instant load, 0 bytes, smooth animation

---

## After Compression

### 1. Update hero-section.tsx

Once you have the compressed video, update the video source:

```tsx
<video ...>
  {/* WebM format (best compression) - add this line */}
  <source src="/videos/hero-blue-campus.webm" type="video/webm" />

  {/* Compressed MP4 fallback */}
  <source src="/videos/hero-blue-campus-compressed.mp4" type="video/mp4" />
</video>
```

### 2. Verify File Size

```bash
ls -lh public/videos/
```

Target size: **< 1.5MB**

### 3. Test Performance

1. Run production build:
   ```bash
   npm run build
   npm start
   ```

2. Test in Chrome DevTools:
   - Open Network tab
   - Reload page
   - Check video file size and load time

---

## Expected Results

| Format | Before | After | Savings |
|--------|--------|-------|---------|
| Original MP4 | 9.6 MB | - | - |
| Compressed MP4 (CRF 28) | - | ~2-3 MB | 70% |
| Compressed MP4 (CRF 32) | - | ~1-1.5 MB | 85% |
| WebM (CRF 35) | - | ~800KB-1.2MB | 90% |

---

## Quick Start

**Easiest method** (if you have ffmpeg):

```bash
cd "C:\Users\John Mark\Music\Edge\Southville8B-NHS-Edge\frontend-nextjs\public\videos"
ffmpeg -i hero-blue-campus.mp4 -c:v libx264 -crf 32 -preset slow -vf scale=1280:-1 -c:a aac -b:a 64k hero-compressed.mp4
```

Then update `hero-section.tsx` to use `hero-compressed.mp4`.

---

## Need Help?

If you're stuck, you can:
1. Use HandBrake (easiest GUI tool)
2. Use CloudConvert (no installation)
3. Ask me to help you compress it using a different method
