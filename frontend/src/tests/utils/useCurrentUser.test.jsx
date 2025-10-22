import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";
import { renderHook, waitFor } from "@testing-library/react";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

// The mock MUST be at the top level of the file
const navigateSpy = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

describe("utils/currentUser tests", () => {
  describe("useCurrentUser", () => {
    let queryClient;
    let axiosMock;
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    beforeEach(() => {
      queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      axiosMock = new AxiosMockAdapter(axios);
    });

    afterEach(() => {
      axiosMock.restore();
      queryClient.clear();
      consoleErrorSpy.mockClear();
    });

    // Wrapper for the hook
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    test("should return loggedIn: false when API returns null", async () => {
      axiosMock.onGet("/api/currentUser").reply(200, null);

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.loggedIn).toBe(false);
        expect(result.current.root).toEqual({});
      });
    });

    test("should return loggedIn: true with rolesList for a logged-in user", async () => {
      const mockUser = {
        email: "test@example.com",
        roles: [{ authority: "ROLE_USER" }, { authority: "ROLE_ADMIN" }],
      };
      axiosMock.onGet("/api/currentUser").reply(200, mockUser);

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() => expect(result.current.loggedIn).toBe(true));

      expect(result.current.root).toEqual({
        ...mockUser,
        rolesList: ["ROLE_USER", "ROLE_ADMIN"],
      });
    });

    test("should return loggedIn: false when API returns an object without roles", async () => {
      const mockData = { some: "data" };
      axiosMock.onGet("/api/currentUser").reply(200, mockData);

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      // Wait for the data to become available and match the expected output
      await waitFor(() => {
        // We can't check isSuccess, so we check for the final data state instead
        expect(result.current.loggedIn).toBe(false);
        expect(result.current.root).toEqual(mockData);
      });
    });

    test("should return loggedIn: false on a 403 error", async () => {
      axiosMock.onGet("/api/currentUser").reply(403);

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      // Wait for the root property to be updated from null to {}
      await waitFor(() => {
        expect(result.current.root).toEqual({});
      });

      // Now, all assertions can be made on the final, processed data
      expect(result.current.loggedIn).toBe(false);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test("should log an error and re-throw on a non-403 error", async () => {
      // Create a mock error that doesn't have a status property, like a network error
      axiosMock.onGet("/api/currentUser").networkError();

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      // Wait for the query to fail. We can check if isError becomes true in the full query result.
      // However, since useCurrentUser only returns `data`, we expect it to remain as `initialData`.
      // The console.error spy is the key indicator for this test.
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error invoking axios.get: ",
          expect.any(Error),
        );
      });

      // The hook's returned data will be the initialData because the query failed.
      expect(result.current.loggedIn).toBe(false);
      expect(result.current.root).toBe(null);
      expect(result.current.initialData).toBe(true);
      expect(queryClient.getQueryData(["current user"])).toBeTruthy();
    });
  });

  describe("hasRole tests", () => {
    test('hasRole(x,"ROLE_ADMIN") return falsy when currentUser ill-defined', async () => {
      expect(hasRole(null, "ROLE_ADMIN")).toBeFalsy();
      expect(hasRole({}, "ROLE_ADMIN")).toBeFalsy();
      expect(hasRole({ loggedIn: null }, "ROLE_ADMIN")).toBeFalsy();
      expect(hasRole({ loggedIn: true }, "ROLE_ADMIN")).toBeFalsy();
      expect(hasRole({ loggedIn: true, root: null }, "ROLE_ADMIN")).toBeFalsy();
      expect(hasRole({ loggedIn: true, root: {} }, "ROLE_ADMIN")).toBeFalsy();
      expect(
        hasRole({ loggedIn: true, root: { rolesList: null } }, "ROLE_ADMIN"),
      ).toBeFalsy();
    });

    test('hasRole(x,"ROLE_ADMIN") returns correct values when currentUser properly defined', async () => {
      expect(
        hasRole({ loggedIn: true, root: { rolesList: [] } }, "ROLE_ADMIN"),
      ).toBeFalsy();
      expect(
        hasRole(
          { loggedIn: true, root: { rolesList: ["ROLE_USER"] } },
          "ROLE_ADMIN",
        ),
      ).toBeFalsy();
      expect(
        hasRole(
          { loggedIn: true, root: { rolesList: ["ROLE_USER", "ROLE_ADMIN"] } },
          "ROLE_ADMIN",
        ),
      ).toBeTruthy();
    });

    test('hasRole(x,"ROLE_USER") returns correct values when currentUser properly defined', async () => {
      expect(
        hasRole({ loggedIn: true, root: { rolesList: [] } }, "ROLE_USER"),
      ).toBeFalsy();
      expect(
        hasRole(
          { loggedIn: true, root: { rolesList: ["ROLE_USER"] } },
          "ROLE_USER",
        ),
      ).toBeTruthy();
      expect(
        hasRole(
          { loggedIn: true, root: { rolesList: ["ROLE_USER", "ROLE_ADMIN"] } },
          "ROLE_USER",
        ),
      ).toBeTruthy();
    });
  });
});
