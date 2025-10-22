import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import UCSBDateForm from "main/components/UCSBDates/UCSBDateForm";
import { ucsbDatesFixtures } from "fixtures/ucsbDatesFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDateForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <UCSBDateForm />
      </Router>,
    );
    await screen.findByText(/Quarter YYYYQ/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Quarter YYYYQ/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a UCSBDate", async () => {
    render(
      <Router>
        <UCSBDateForm initialContents={ucsbDatesFixtures.oneDate} />
      </Router>,
    );
    await screen.findByTestId(/UCSBDateForm-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/UCSBDateForm-id/)).toHaveValue("1");
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <UCSBDateForm />
      </Router>,
    );
    await screen.findByTestId("UCSBDateForm-quarterYYYYQ");
    const quarterYYYYQField = screen.getByTestId("UCSBDateForm-quarterYYYYQ");
    const localDateTimeField = screen.getByTestId("UCSBDateForm-localDateTime");
    const submitButton = screen.getByTestId("UCSBDateForm-submit");

    fireEvent.change(quarterYYYYQField, { target: { value: "bad-input" } });
    fireEvent.change(localDateTimeField, { target: { value: "bad-input" } });
    fireEvent.click(submitButton);

    await screen.findByText(/QuarterYYYYQ must be in the format YYYYQ/);
    expect(
      screen.getByText(/QuarterYYYYQ must be in the format YYYYQ/),
    ).toBeInTheDocument();
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <UCSBDateForm />
      </Router>,
    );
    await screen.findByTestId("UCSBDateForm-submit");
    const submitButton = screen.getByTestId("UCSBDateForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/QuarterYYYYQ is required./);
    expect(screen.getByText(/Name is required./)).toBeInTheDocument();
    expect(screen.getByText(/LocalDateTime is required./)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <UCSBDateForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("UCSBDateForm-quarterYYYYQ");

    const quarterYYYYQField = screen.getByTestId("UCSBDateForm-quarterYYYYQ");
    const nameField = screen.getByTestId("UCSBDateForm-name");
    const localDateTimeField = screen.getByTestId("UCSBDateForm-localDateTime");
    const submitButton = screen.getByTestId("UCSBDateForm-submit");

    fireEvent.change(quarterYYYYQField, { target: { value: "20221" } });
    fireEvent.change(nameField, { target: { value: "noon on January 2nd" } });
    fireEvent.change(localDateTimeField, {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/QuarterYYYYQ must be in the format YYYYQ/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/localDateTime must be in ISO format/),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <UCSBDateForm />
      </Router>,
    );
    await screen.findByTestId("UCSBDateForm-cancel");
    const cancelButton = screen.getByTestId("UCSBDateForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
