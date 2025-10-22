import { render, screen } from "@testing-library/react";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import RoleBadge from "main/components/Profile/RoleBadge";
import { expect } from "vitest";

describe("RoleBadge tests", () => {
  test("renders without crashing for ROLE_USER when user has ROLE_USER", async () => {
    render(
      <RoleBadge
        currentUser={currentUserFixtures.userOnly}
        role={"ROLE_USER"}
      />,
    );
    await screen.findByTestId("role-badge-user");
    expect(screen.getByTestId("role-badge-user")).toBeInTheDocument();
  });

  test("renders without crashing for ROLE_ADMIN when user has ROLE_ADMIN", async () => {
    render(
      <RoleBadge
        currentUser={currentUserFixtures.adminUser}
        role={"ROLE_ADMIN"}
      />,
    );
    await screen.findByTestId("role-badge-admin");
    expect(screen.getByTestId("role-badge-admin")).toBeInTheDocument();
  });

  test("renders without crashing for ROLE_ADMIN when user does NOT have ROLE_ADMIN", async () => {
    render(
      <RoleBadge
        currentUser={currentUserFixtures.userOnly}
        role={"ROLE_ADMIN"}
      />,
    );
    await screen.findByTestId("role-missing-admin");
    expect(screen.getByTestId("role-missing-admin")).toBeInTheDocument();
  });
});
