# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## 📱 App Distribution & Installation

### For End Users

See the comprehensive [Installation Guide](./INSTALLATION_GUIDE.md) with:

- Step-by-step installation instructions
- Security warning explanations
- Troubleshooting tips
- Common issues and solutions

### For Administrators

See the [Distribution Guide](./DISTRIBUTION_GUIDE.md) for:

- Google Drive setup (recommended)
- HTTPS website hosting
- Firebase App Distribution
- GitHub Releases
- Best practices and security

**Quick Start**: Upload APK to Google Drive → Share link → Done!

---

## Building APK for Distribution

### Prerequisites

1. **Install EAS CLI** (if not already installed):

   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:

   ```bash
   eas login
   ```

3. **Set up Environment Variables** using EAS Secrets:

   ```bash
   # Set production API URL (REQUIRED for production builds)
   eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://your-api-domain.com/api/v1

   # Set Supabase credentials (if using Supabase)
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value your_supabase_project_url
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your_supabase_anon_key
   ```

   **Note**: For local development, create a `.env` file in the root directory with these variables. For production builds with EAS, use `eas secret:create` as shown above.

### Building APK

To build a standalone APK for GitHub distribution (soft launch):

```bash
eas build --platform android --profile development
```

This will:

- Build a standalone APK (not requiring Expo Go)
- Use the `development` profile for iterative updates
- Take approximately 10-20 minutes
- Provide a download link when complete

### Environment Variables

The following environment variables are required for production builds:

- **`EXPO_PUBLIC_API_URL`** (Required): Production API base URL

  - Example: `https://api.yourdomain.com/api/v1`
  - Must be set via EAS secrets for cloud builds
  - Falls back to localhost in development mode only

- **`EXPO_PUBLIC_SUPABASE_URL`** (Optional): Supabase project URL

  - Only needed if using Supabase features (alerts, realtime)

- **`EXPO_PUBLIC_SUPABASE_ANON_KEY`** (Optional): Supabase anonymous key
  - Only needed if using Supabase features

### Local Development Environment

Create a `.env` file in the project root (not committed to git):

```env
EXPO_PUBLIC_API_URL=http://localhost:3004/api/v1
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
