import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticleForm from "main/components/Articles/ArticleForm";
import { articlesFixtures } from "fixtures/articlesFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticleForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Title",
    "URL",
    "Explanation",
    "Email",
    "Date Added (iso format)",
  ];

  test("renders correctly with no initial contents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticleForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in one article", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticleForm initialContents={articlesFixtures.oneArticle} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId("ArticleForm-id")).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(/ArticleForm-id/)).toHaveValue("1");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticleForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId("ArticleForm-cancel")).toBeInTheDocument();
    const cancelButton = screen.getByTestId("ArticleForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticleForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Title is required./);
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/URL is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Added is required./)).toBeInTheDocument();

    const titleInput = screen.getByTestId(`ArticleForm-title`);
    fireEvent.change(titleInput, { target: { value: "a".repeat(260) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
    });
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <ArticleForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-title");

    const titleField = screen.getByTestId("ArticleForm-title");
    const urlField = screen.getByTestId("ArticleForm-url");
    const explanationField = screen.getByTestId("ArticleForm-explanation");
    const emailField = screen.getByTestId("ArticleForm-email");
    const dateAddedField = screen.getByTestId("ArticleForm-dateAdded");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.change(titleField, { target: { value: "Title change test" } });
    fireEvent.change(urlField, { target: { value: "katelarrick.com" } });
    fireEvent.change(explanationField, {
      target: { value: "Making some changes test" },
    });
    fireEvent.change(emailField, { target: { value: "katelarrick@ucsb.edu" } });
    fireEvent.change(dateAddedField, {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/URL is required./)).not.toBeInTheDocument();
  });
});
