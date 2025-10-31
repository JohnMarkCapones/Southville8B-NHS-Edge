import React from "react";
import { render } from "@/tests/utils/render";
import { screen, waitFor } from "@testing-library/react-native";
import HomeScreen from "@/app/(tabs)/index";
import { server } from "@/tests/msw/server";
import { rest } from "msw";

// Mock expo-router to avoid navigation side-effects
jest.mock("expo-router", () => ({
  __esModule: true,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

describe("HomeScreen Events section (integration)", () => {
  it("renders Events section without error (success)", async () => {
    render(<HomeScreen />);

    // Section header shows
    await screen.findByText("Events", {}, { timeout: 10000 });

    // Does not show error or empty state
    await waitFor(() => {
      expect(screen.queryByText("Failed to load events")).toBeNull();
      expect(screen.queryByText("No upcoming events")).toBeNull();
    });
  });

  it("shows empty state when no upcoming events", async () => {
    server.use(
      rest.get(`${process.env.EXPO_PUBLIC_API_URL}/events`, (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ data: [], pagination: { total: 0, page: 1, limit: 10 } })
        );
      })
    );

    render(<HomeScreen />);

    await screen.findByText("Events", {}, { timeout: 10000 });
    await screen.findByText("No upcoming events", {}, { timeout: 10000 });
  });

  it("shows error state when events API fails", async () => {
    server.use(
      rest.get(`${process.env.EXPO_PUBLIC_API_URL}/events`, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<HomeScreen />);

    await screen.findByText("Events", {}, { timeout: 10000 });
    await screen.findByText("Failed to load events", {}, { timeout: 10000 });
  });
});


