import React from "react";
import { fireEvent, waitFor, screen } from "@testing-library/react-native";
import LoginScreen from "@/app/login";
import { AuthSessionProvider } from "@/hooks/use-auth-session";
import { render } from "@/tests/utils/render";

// Ensure auth restore resolves immediately to unauthenticated
jest.mock("@/services/auth", () => {
  const actual = jest.requireActual("@/services/auth");
  return {
    ...actual,
    restoreAuthSession: jest.fn(async () => null),
  };
});

// Mock expo-router navigation and expose replace for assertions
jest.mock("expo-router", () => {
  const mockReplace = jest.fn();
  return {
    __esModule: true,
    useRouter: () => ({
      replace: mockReplace,
      push: jest.fn(),
      back: jest.fn(),
    }),
    Redirect: () => null,
    // expose to tests
    mockReplace,
  };
});

describe("LoginScreen integration", () => {
  beforeEach(() => {
    const mod = require("expo-router");
    mod.mockReplace.mockReset();
  });

  function renderWithProviders() {
    return render(
      <AuthSessionProvider>
        <LoginScreen />
      </AuthSessionProvider>
    );
  }

  it("logs in successfully and navigates to tabs", async () => {
    renderWithProviders();

    const emailInput = await screen.findByPlaceholderText("Enter your email");
    const passwordInput = await screen.findByPlaceholderText(
      "Enter your password"
    );
    const loginButton = screen.getByText("LOGIN");

    fireEvent.changeText(emailInput, "student@example.com");
    fireEvent.changeText(passwordInput, "Correct#123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      const mod = require("expo-router");
      expect(mod.mockReplace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  it("shows error on invalid credentials", async () => {
    renderWithProviders();

    const emailInput = await screen.findByPlaceholderText("Enter your email");
    const passwordInput = await screen.findByPlaceholderText(
      "Enter your password"
    );
    const loginButton = screen.getByText("LOGIN");

    fireEvent.changeText(emailInput, "student@example.com");
    fireEvent.changeText(passwordInput, "wrong");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeTruthy();
    });
  });
});
