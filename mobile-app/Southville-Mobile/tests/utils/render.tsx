import React, { PropsWithChildren } from "react";
import { render as rntlRender } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AuthSessionProvider } from "@/hooks/use-auth-session";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/theme-context";

// If the app has AuthContext/Zustand, import and wrap here when available.
// For now provide a minimal wrapper with Navigation to support screens.

function Providers({ children }: PropsWithChildren) {
  return (
    <NavigationContainer>
      <CustomThemeProvider>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </CustomThemeProvider>
    </NavigationContainer>
  );
}

export function render(ui: React.ReactElement) {
  return rntlRender(ui, { wrapper: Providers });
}
