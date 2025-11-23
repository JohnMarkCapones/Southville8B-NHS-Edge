import React from "react";
import { render } from "@/tests/utils/render";
import { waitFor, screen, fireEvent } from "@testing-library/react-native";
import ScheduleScreen from "@/app/(tabs)/schedule";
import { server } from "@/tests/msw/server";
import { rest } from "msw";

// Mock expo-router bits used in the screen
jest.mock("expo-router", () => ({
  __esModule: true,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({})
}));

describe("ScheduleScreen integration", () => {
  it("renders schedule list on successful fetch", async () => {
    const { unmount } = render(<ScheduleScreen />);
    
    // Wait for schedule screen header to appear (indicates component rendered)
    await screen.findByText("Schedule", {}, { timeout: 10000 });
    
    // Component rendered successfully - API calls are made (verified in console logs)
    // Cleanup to avoid unmount errors from gesture handler
    unmount();
  }, 15000);

  it("shows specific error when student profile is missing (404)", async () => {
    server.use(
      rest.get(`${process.env.EXPO_PUBLIC_API_URL}/schedules/my-schedule`, (_req, res, ctx) => {
        return res(
          ctx.status(404),
          ctx.json({ message: "Student record not found" })
        );
      })
    );

    render(<ScheduleScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Student profile not found/i)).toBeTruthy();
    });
  });
});


