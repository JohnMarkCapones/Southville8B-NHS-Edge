import React from "react";
import { render } from "@/tests/utils/render";
import { screen, waitFor, fireEvent } from "@testing-library/react-native";
import ProfileScreen from "@/app/(tabs)/profile";
import { server } from "@/tests/msw/server";
import { rest } from "msw";

// Mock expo-router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  __esModule: true,
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

describe("ProfileScreen integration", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it("shows loading state initially", async () => {
    render(<ProfileScreen />);

    // Loading text should appear
    await screen.findByText("Loading profile...", {}, { timeout: 8000 });
  });

  it("renders profile data on successful fetch", async () => {
    render(<ProfileScreen />);

    // Wait for user data to load (name from mocked response)
    await screen.findByText("Student User", {}, { timeout: 10000 });

    // Verify email
    expect(screen.getByText("student@example.com")).toBeTruthy();

    // Verify stats cards
    expect(screen.getByText("10")).toBeTruthy(); // Grade level
    expect(screen.getByText("Newton")).toBeTruthy(); // Section
    expect(screen.getByText("N/A")).toBeTruthy(); // Rank

    // Verify menu items
    expect(screen.getByText("Personal Information")).toBeTruthy();
    expect(screen.getByText("Account Security")).toBeTruthy();
    expect(screen.getByText("School Information")).toBeTruthy();

    // Verify logout button
    expect(screen.getByText("LOGOUT")).toBeTruthy();
  });

  it("shows error state when profile fetch fails", async () => {
    server.use(
      rest.get(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, (_req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: "Internal server error" }));
      })
    );

    render(<ProfileScreen />);

    await screen.findByText(/Failed to load profile/i, {}, { timeout: 10000 });
  });

  it("calls router.push when menu items are tapped", async () => {
    render(<ProfileScreen />);

    // Wait for profile to load
    await screen.findByText("Student User", {}, { timeout: 10000 });

    // Tap Personal Information
    const personalInfo = screen.getByText("Personal Information");
    fireEvent.press(personalInfo);
    expect(mockPush).toHaveBeenCalledWith("/personal-information");

    // Tap Account Security
    const accountSecurity = screen.getByText("Account Security");
    fireEvent.press(accountSecurity);
    expect(mockPush).toHaveBeenCalledWith("/account-security");

    // Tap School Information
    const schoolInfo = screen.getByText("School Information");
    fireEvent.press(schoolInfo);
    expect(mockPush).toHaveBeenCalledWith("/school-information");
  });

  it("renders logout button and is tappable", async () => {
    render(<ProfileScreen />);

    // Wait for profile to load
    await screen.findByText("Student User", {}, { timeout: 10000 });

    // Verify logout button exists
    const logoutButton = screen.getByText("LOGOUT");
    expect(logoutButton).toBeTruthy();

    // Verify button is pressable (doesn't crash)
    fireEvent.press(logoutButton);
    // Note: Logout flow is tested separately in logout.int.test.tsx
  });

  it("pull-to-refresh triggers refetch", async () => {
    render(<ProfileScreen />);

    // Wait for profile to load
    await screen.findByText("Student User", {}, { timeout: 10000 });

    // Mock updated user data for refetch
    server.use(
      rest.get(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            id: "user_123",
            email: "student.updated@example.com",
            full_name: "Updated Student User",
            student: {
              student_id: "S-0001",
              first_name: "Updated",
              last_name: "Student",
              birthday: new Date().toISOString(),
              section: { name: "Newton" },
              grade_level: "10",
              rank: "5",
            },
            profile: {
              phone_number: "",
              address: "",
            },
          })
        );
      })
    );

    // Get ScrollView and trigger refresh
    const { UNSAFE_getAllByType } = screen;
    const ScrollView = require("react-native").ScrollView;
    const scrollViews = UNSAFE_getAllByType(ScrollView);
    
    if (scrollViews.length > 0) {
      const scrollView = scrollViews[0];
      const refreshControl = scrollView.props?.refreshControl;
      
      if (refreshControl && refreshControl.props?.onRefresh) {
        // Call the onRefresh handler directly
        await refreshControl.props.onRefresh();
      }
    }

    // Wait for updated data to appear
    await waitFor(() => {
      expect(screen.getByText("Updated Student User")).toBeTruthy();
    }, { timeout: 10000 });
  });
});

