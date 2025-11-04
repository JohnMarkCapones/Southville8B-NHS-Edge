/**
 * Suppress Expo Go push token warning in development.
 * This must be imported BEFORE any module that imports expo-notifications.
 */
if (__DEV__) {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args: any[]) => {
    const msg = String(args[0] ?? "");
    if (
      msg.includes("Android Push notifications") &&
      msg.includes("removed from Expo Go")
    ) {
      return; // expected in Expo Go; using local notifications only
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    const msg = String(args[0] ?? "");
    if (
      msg.includes("Android Push notifications") &&
      msg.includes("removed from Expo Go")
    ) {
      return; // suppress if logged as error by metro runtime
    }
    originalError.apply(console, args);
  };
}
