import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import Footer from "main/components/Nav/Footer";
import { afterEach, expect, beforeEach, vi, describe, test } from "vitest";

// Use doMock and resetModules for isolated mocks.
// The vi.doMock and vi.resetModules calls should be inside the describe blocks.

const queryClient = new QueryClient();

describe("Footer tests", () => {
  describe("SystemInfo returns content", () => {
    beforeEach(() => {
      // Clears the module cache to ensure each test suite starts fresh.
      vi.resetModules();
      queryClient.clear();
      // Use vi.doMock for an explicit mock that is not hoisted.
      vi.doMock("main/utils/systemInfo", () => ({
        useSystemInfo: () => ({
          data: systemInfoFixtures.initialData,
          isSuccess: true,
        }),
      }));
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    test("renders correctly with system info content", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Footer />
        </QueryClientProvider>,
      );
      // Wait for the query to resolve and content to appear.
      await waitFor(() => {
        expect(
          screen.getByTestId("footer-see-source-code"),
        ).toBeInTheDocument();
      });

      const expectedText =
        "This is a sample webapp using React with a Spring Boot backend. See the source code on Github.";

      expect(screen.getByTestId("Footer").textContent).toBe(expectedText);

      const footer_see_source_code = screen.getByTestId(
        "footer-see-source-code",
      );
      expect(footer_see_source_code).toHaveTextContent(
        "See the source code on Github.",
      );
      const githubLink = screen.getByText(/Github/);
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute(
        "href",
        "https://github.com/ucsb-cs156-f25/STARTER-team02",
      );
    });
  });

  describe("SystemInfo is returning null", () => {
    beforeEach(() => {
      // Clears the module cache before this test suite as well.
      vi.resetModules();
      queryClient.clear();
      // Use vi.doMock to apply a different mock for this test.
      vi.doMock("main/utils/systemInfo", () => ({
        useSystemInfo: () => ({ data: null, isSuccess: true }),
      }));
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    test("renders correctly without system info content", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Footer />
        </QueryClientProvider>,
      );
      // Wait for the null data to be processed.
      await waitFor(() => {
        const expectedText =
          "This is a sample webapp using React with a Spring Boot backend.";
        expect(screen.getByTestId("Footer").textContent).toBe(expectedText);
      });

      const footer_see_source_code = screen.getByTestId(
        "footer-see-source-code",
      );
      expect(footer_see_source_code).toBeInTheDocument();
      expect(footer_see_source_code).toBeEmpty();
    });
  });
});
