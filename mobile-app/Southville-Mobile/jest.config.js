/**
 * Jest configuration for Expo React Native app.
 * Uses jest-expo preset which sets up transformers and environment.
 */
module.exports = {
  preset: "jest-expo",
  testMatch: [
    "**/__tests__/**/*.test.{ts,tsx}",
    "**/?(*.)+(spec|test).{ts,tsx}",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|react-clone-referenced-element|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|expo(nent)?|@expo(nent)?|expo-router|expo-modules-core|@expo/.*|@unimodules/.*|unimodules-.*|sentry-expo|native-base|msw|until-async)/)",
  ],
};
