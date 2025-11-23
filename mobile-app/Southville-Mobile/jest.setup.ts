import "@testing-library/jest-native/extend-expect";

// Ensure global fetch exists in Jest environment
import "whatwg-fetch";

// MSW server setup
import { server } from "./tests/msw/server";

// Ensure API base aligns with MSW handlers during tests
process.env.EXPO_PUBLIC_API_URL = "http://127.0.0.1:3000/api/v1";

// Gesture handler jest setup
import "react-native-gesture-handler/jestSetup";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// Mock expo-secure-store used for token persistence in auth flow
jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    isAvailableAsync: jest.fn(async () => true),
  };
});

// Mock expo-constants to avoid ESM import issues in tests
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoGo: {},
    manifest2: { extra: { expoGo: {} } },
  },
}));

// Mock @expo/vector-icons to avoid pulling ESM from expo-font
jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ children }: any) => null,
}));

// React Native Reanimated custom mock (avoids react-native-worklets dependency)
jest.mock("react-native-reanimated", () => {
  const ReactNative = require("react-native");
  const Reanimated = {
    default: { View: ReactNative.View, Text: ReactNative.Text },
    Easing: {
      linear: jest.fn(),
    },
    createAnimatedComponent: (Component: any) => Component,
    useSharedValue: (initial: any) => ({ value: initial }),
    useAnimatedStyle: (fn: any) => fn,
    withTiming: (value: any) => value,
    withSpring: (value: any) => value,
    withDelay: (_ms: number, value: any) => value,
    withSequence: (...args: any[]) => args[args.length - 1],
    interpolate: jest.fn(() => 0),
    Extrapolate: { CLAMP: 1 },
    runOnJS: (fn: any) => fn,
  };
  return Reanimated;
});

// Mock react-native-worklets to avoid ESM import issues in tests
jest.mock("react-native-worklets", () => ({}));

// Minimal mock for react-native-gesture-handler components used in tests
jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    PanGestureHandler: ({ children }: any) =>
      React.createElement(View, null, children),
    GestureHandlerRootView: ({ children }: any) =>
      React.createElement(View, null, children),
  };
});

// Mock AsyncStorage for Jest
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
