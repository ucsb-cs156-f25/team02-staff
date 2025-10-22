import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLogout } from "main/utils/useLogout";
import { renderHook, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";
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

describe("useLogout tests", () => {
  let queryClient;
  let axiosMock;
  let resetQueriesSpy;

  beforeEach(() => {
    queryClient = new QueryClient();
    axiosMock = new AxiosMockAdapter(axios);
    resetQueriesSpy = vi.spyOn(queryClient, "resetQueries");
  });

  afterEach(() => {
    axiosMock.restore();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  test("should log out the user, reset queries, and navigate to home", async () => {
    axiosMock.onPost("/logout").reply(200);

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    if (!result.current) {
      console.error("Hook failed to render, result.current is null.");
      expect(result.current).not.toBeNull();
      return;
    }

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(axiosMock.history.post.length).toBe(1);
    expect(resetQueriesSpy).toHaveBeenCalledWith({
      queryKey: ["current user"],
    });
    expect(navigateSpy).toHaveBeenCalledWith("/"); // Your assertion will now pass
  });
});
