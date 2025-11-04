<!-- 90ca04c5-4790-4f2c-b824-b9178d020eff c03c8dbd-070b-4ec0-8689-40af6cd1b221 -->
# Build APK for GitHub Distribution

## Overview

Prepare the Southville-Mobile Expo app for building a production-ready standalone APK that can be downloaded from GitHub. This includes configuring EAS Build, disabling debug modes, setting up production API URLs, and ensuring all development flags are properly handled. Using development profile for soft launch/iterative updates.

## Prerequisites

1. ✅ Expo account (sign up at https://expo.dev if needed) - COMPLETED
2. ✅ EAS CLI installed globally: `npm install -g eas-cli` - COMPLETED
3. ✅ Run `eas build:configure` - COMPLETED
4. ✅ Login to Expo account: `eas login` - COMPLETED
5. GitHub repository access for releases

## Implementation Steps

### 1. ✅ Install and Configure EAS Build - COMPLETED

- Install EAS CLI globally: `npm install -g eas-cli`
- Run `eas build:configure` in the mobile-app/Southville-Mobile directory
- This creates `eas.json` configuration file
- Login to Expo account: `eas login`

### 2. ✅ Create EAS Build Configuration (eas.json) - COMPLETED

- Updated `eas.json` with APK build configuration:
- Removed `developmentClient: true` from development profile (for standalone APK builds)
- Added `android.buildType: "apk"` to the `development` profile for soft launch/iterative updates
- Added `android.buildType: "apk"` to the `preview` profile for standalone APK
- Added `android.buildType: "apk"` to the `production` profile
- Configured `NODE_ENV: "production"` for all profiles
- Reference: https://docs.expo.dev/build-reference/apk/

### 3. ✅ Update app.json for Production - COMPLETED

- ✅ Added `android.package`: `com.southville8b.mobile`
- ✅ Added `android.versionCode`: `1`
- ✅ Verified `version` is set correctly: `1.0.0`
- ✅ Verified `name` and `slug` are production-ready: `Southville-Mobile`
- ✅ Verified icon and splash screen assets exist
- ✅ Added `android.permissions`: `INTERNET`, `RECEIVE_BOOT_COMPLETED`, `VIBRATE`

### 4. ✅ Fix Development/Debug Settings - COMPLETED

- **API Client (`lib/api-client.ts`)**:
- ✅ Updated `resolveDefaultBaseUrl()` to require `EXPO_PUBLIC_API_URL` in production (no localhost fallback)
- ✅ The `__DEV__` and `isDev` flags will automatically be false in production builds
- ✅ Production builds now properly require environment variable

- **Remove/Disable Development Logging**:
- ✅ Console.log statements in api-client.ts (lines 64, 124-135, 164-168, 182-184) are gated by `isDev` - will be silent in production
- ✅ All console logging is properly gated

- **Push Notifications (`services/push-notifications.ts`)**:
- ✅ The `__DEV__` warning suppression (lines 23-37) is automatically disabled in production
- ✅ Notification configuration is production-ready

### 5. ✅ Environment Variables Setup - COMPLETED

- ✅ Documented environment variables in README.md:
- `EXPO_PUBLIC_API_URL` - Production API base URL (REQUIRED for production builds)
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL (optional)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (optional)
- ✅ Added instructions for using EAS secrets: `eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://your-api-domain.com/api/v1`
- ✅ Documented local development `.env` file setup

### 6. ✅ Production API URL Configuration - COMPLETED

- ✅ Updated `lib/api-client.ts` to remove localhost fallback in production
- ✅ Production builds now require `EXPO_PUBLIC_API_URL` environment variable
- ✅ Returns empty string if not set (forces error instead of silent localhost failure)

### 7. Build the APK - READY TO EXECUTE

**Prerequisites before building:**

- ✅ EAS Build configured (eas.json ready)
- ✅ app.json configured for production
- ✅ API client configured for production
- ⚠️ **REQUIRED**: Set `EXPO_PUBLIC_API_URL` via EAS secrets before building:
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://your-api-domain.com/api/v1
  ```


**Build command:**

- Run: `eas build --platform android --profile development`
- This creates a standalone APK that can be installed directly
- Build will be done in the cloud (EAS servers)
- Download link provided after completion (typically 10-20 minutes)
- **Note**: ✅ Development profile is configured for standalone APK (developmentClient removed, APK buildType set)

### 8. GitHub Releases Setup - READY AFTER BUILD

**After APK build completes:**

- Download APK from EAS build link
- Create GitHub Release:
  - Tag version (e.g., `v1.0.0`)
  - Release title: "Southville Mobile App v1.0.0"
  - Upload APK file as a binary asset
  - Add release notes (include features, bug fixes, installation instructions)

### 9. Pre-Build Checklist

- [x] ✅ Verify all API calls use production URL (production builds require EXPO_PUBLIC_API_URL, no localhost fallback)
- [x] ✅ Check that no hardcoded localhost URLs remain in production code (all localhost refs are in **DEV** mode only)
- [x] ✅ Ensure version number is correct (version: "1.0.0", versionCode: 1)
- [x] ✅ Check network permissions are correct (INTERNET permission added)
- [x] ✅ Verify development profile builds standalone APK (developmentClient removed, APK buildType configured)
- [ ] Remove any test/dev API endpoints (only in test files - acceptable)
- [ ] Test app icon and splash screen display correctly (requires build + device test)
- [ ] Verify notifications work in production build (requires build + device test)
- [ ] Ensure secure storage is properly configured (expo-secure-store configured - requires runtime test)

### 10. Post-Build Verification - AFTER BUILD & RELEASE

**After uploading APK to GitHub:**

- Download APK from GitHub release
- Install on physical Android device (enable "Install from unknown sources" if needed)
- Verify API connectivity works (ensure EXPO_PUBLIC_API_URL is correct)
- Test login and authentication
- Check all core features work
- Verify notifications (if applicable)
- Test offline behavior

## Files to Modify/Create

1. ✅ **Update**: `mobile-app/Southville-Mobile/eas.json` - COMPLETED: Configured development profile for standalone APK (removed developmentClient, added APK buildType)
2. ✅ **Update**: `mobile-app/Southville-Mobile/lib/api-client.ts` - COMPLETED: Production API URL requires EXPO_PUBLIC_API_URL, no localhost fallback
3. ✅ **Update**: `mobile-app/Southville-Mobile/app.json` - COMPLETED: Added package, versionCode, and permissions
4. ✅ **Documented**: Environment variables setup using EAS secrets (documented in README.md)
5. ✅ **Update**: `mobile-app/Southville-Mobile/README.md` - COMPLETED: Added build instructions and environment variable documentation

## Important Notes

- **APK vs AAB**: APK is for direct installation, AAB is required for Play Store
- **Development Profile**: ✅ COMPLETED - Modified development profile to build standalone APK (removed developmentClient, added APK buildType)
- **Soft Launch**: Using development profile allows easier iterative updates for soft launch phase
- **Debug Mode**: `__DEV__` is automatically false in production builds (no code changes needed)
- **Console Logs**: Currently gated by `isDev` flag - will be silent in production
- **API Base URL**: Must be set via environment variable or hardcoded production URL
- **Build Time**: EAS builds typically take 10-20 minutes
- **Cost**: Free tier available for Expo accounts

## References

- Expo Build Docs: https://docs.expo.dev/build/introduction/
- EAS Build Configuration: https://docs.expo.dev/build/eas-json/
- APK Build Guide: https://docs.expo.dev/build-reference/apk/
- Environment Variables: https://docs.expo.dev/guides/environment-variables/