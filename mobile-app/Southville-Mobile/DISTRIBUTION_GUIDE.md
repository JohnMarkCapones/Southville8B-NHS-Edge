# Distribution Guide for Administrators

This guide explains how to distribute the Southville Mobile app APK to users using trusted methods.

## 📦 Distribution Methods

### Method 1: Google Drive (Recommended - Easiest)

**Pros**: Free, trusted by users, easy to set up, automatic HTTPS  
**Cons**: Requires Google account, manual link sharing

#### Setup Steps:

1. **Upload APK to Google Drive**:
   ```
   1. Go to drive.google.com
   2. Create a folder: "Southville Mobile App"
   3. Upload the APK file (e.g., Southville-Mobile-1.0.0.apk)
   4. Right-click the file → "Share"
   5. Set permission: "Anyone with the link" → "Viewer"
   6. Copy the shareable link
   ```

2. **Share with Users**:
   - Send link via email, SMS, or school portal
   - Include installation instructions (see INSTALLATION_GUIDE.md)
   - Link format: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`

3. **Update Process**:
   - Upload new APK with version number in filename
   - Replace old file or create new folder for each version
   - Share new link with users

---

### Method 2: HTTPS Website (Most Professional)

**Pros**: Professional appearance, full control, branding, analytics  
**Cons**: Requires web hosting, domain, SSL certificate

#### Setup Steps:

1. **Create Download Page** (see `download-page-template.html`):
   ```html
   - Customize with school branding
   - Add download button
   - Include installation instructions
   - Add QR code for easy mobile access
   ```

2. **Host on School Website**:
   - Upload HTML file to school website
   - Place APK in `/downloads/` directory
   - Ensure HTTPS is enabled (required for security)
   - Test download on mobile device

3. **Share URL**:
   - Example: `https://southville8b.edu.ph/mobile-app/download`
   - Add link to school portal, email signature, etc.

#### Security Best Practices:
- ✅ Use HTTPS (SSL certificate required)
- ✅ Verify file integrity (provide MD5/SHA256 hash)
- ✅ Include version information
- ✅ Add download analytics to track usage

---

### Method 3: Firebase App Distribution (Best for Updates)

**Pros**: Automatic updates, user management, analytics, professional  
**Cons**: Requires Firebase account, more setup

#### Setup Steps:

1. **Create Firebase Project**:
   ```
   1. Go to console.firebase.google.com
   2. Create new project: "Southville Mobile"
   3. Enable "App Distribution" in Firebase Console
   ```

2. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. **Upload APK**:
   ```bash
   firebase appdistribution:distribute path/to/app.apk \
     --app YOUR_APP_ID \
     --groups "students,teachers" \
     --release-notes "Version 1.0.0 - Initial release"
   ```

4. **Invite Users**:
   - Add user emails to Firebase App Distribution
   - Users receive email invitation
   - One-click installation from email

#### Benefits:
- ✅ Automatic update notifications
- ✅ Version management
- ✅ User groups (students, teachers, admin)
- ✅ Crash reporting integration
- ✅ Analytics and usage tracking

---

### Method 4: GitHub Releases (For Technical Teams)

**Pros**: Version control, release notes, changelog, free  
**Cons**: Requires GitHub account, more technical

#### Setup Steps:

1. **Create Release**:
   ```
   1. Go to GitHub repository
   2. Click "Releases" → "Create a new release"
   3. Tag version: v1.0.0
   4. Upload APK as release asset
   5. Add release notes
   ```

2. **Share Download Link**:
   - Link format: `https://github.com/org/repo/releases/download/v1.0.0/app.apk`
   - Or share release page: `https://github.com/org/repo/releases/tag/v1.0.0`

3. **Private Repository**:
   - Keep repository private
   - Share download link only with authorized users
   - Or use GitHub's private release feature

---

## 🔒 Security Best Practices

### For All Distribution Methods:

1. **Always Use HTTPS**:
   - Never share APK via HTTP
   - Ensure download links use HTTPS
   - Verify SSL certificate is valid

2. **Verify File Integrity**:
   - Provide MD5 or SHA256 hash
   - Users can verify before installing
   - Prevents tampering

3. **Version Control**:
   - Include version in filename: `Southville-Mobile-1.0.0.apk`
   - Document changes in release notes
   - Keep old versions for rollback

4. **Access Control**:
   - Limit download access to authorized users
   - Use password protection if needed
   - Track who downloads (if possible)

---

## 📋 Distribution Checklist

Before distributing:

- [ ] APK is properly signed (verified via EAS)
- [ ] Version number is correct in filename
- [ ] Installation guide is provided to users
- [ ] Download link uses HTTPS
- [ ] File size is reasonable (< 100 MB)
- [ ] Tested installation on multiple devices
- [ ] Release notes/changelog prepared
- [ ] Support contact information included

---

## 📊 Recommended Workflow

### Initial Distribution:
1. **Build APK**: `eas build --platform android --profile production`
2. **Download APK**: From Expo dashboard
3. **Upload to Google Drive**: Create shareable link
4. **Share Link**: Via email/SMS to users
5. **Provide Instructions**: Link to INSTALLATION_GUIDE.md

### Updates:
1. **Build New Version**: Increment version in app.json
2. **Upload New APK**: Replace or version the file
3. **Notify Users**: Email/SMS about update
4. **Provide Changelog**: What's new in this version

---

## 🎯 Quick Start: Google Drive Method

**Fastest way to get started:**

1. Download APK from Expo build
2. Upload to Google Drive
3. Share link: `https://drive.google.com/file/d/...`
4. Send link + installation guide to users

**That's it!** Users can download and install directly.

---

## 📞 Support

For distribution issues:
- Check Expo build logs
- Verify APK signature
- Test download link on mobile device
- Review installation guide for common issues

---

**Last Updated**: November 2025

