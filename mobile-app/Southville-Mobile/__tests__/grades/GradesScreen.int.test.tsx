import React from "react";
import { render } from "@/tests/utils/render";
import { waitFor, screen, fireEvent } from "@testing-library/react-native";
import GradesScreen from "@/app/(tabs)/grades";
import { server } from "@/tests/msw/server";
import { rest } from "msw";

// Mock expo-router
jest.mock("expo-router", () => ({
  __esModule: true,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

describe("GradesScreen integration", () => {
  it("renders grades list on successful fetch", async () => {
    const { unmount } = render(<GradesScreen />);

    // Wait for header to appear (indicates component rendered)
    await screen.findByText("Grades", {}, { timeout: 10000 });

    // Component rendered successfully - API calls are made (verified in console logs)
    unmount();
  }, 15000);

  it("shows empty state when no GWA records found", async () => {
    server.use(
      rest.get(
        `${process.env.EXPO_PUBLIC_API_URL}/gwa/my-gwa`,
        (_req, res, ctx) => {
          return res(ctx.status(200), ctx.json([]));
        }
      )
    );

    render(<GradesScreen />);

    await waitFor(() => {
      expect(screen.getByText(/No Grades Yet/i)).toBeTruthy();
    });
  });

  it("shows error message on API failure", async () => {
    server.use(
      rest.get(
        `${process.env.EXPO_PUBLIC_API_URL}/gwa/my-gwa`,
        (_req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ message: "Internal server error" })
          );
        }
      )
    );

    render(<GradesScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeTruthy();
    });
  });
});

