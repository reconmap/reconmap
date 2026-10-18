import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import DashboardPage from "./DashboardPage";

const { requestUserPatchMock } = vi.hoisted(() => ({
  requestUserPatchMock: vi.fn(),
}));

vi.mock("api/requests/users", () => ({
  requestUserPatch: requestUserPatchMock,
}));

vi.mock("contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, permissions: [], preferences: {} },
  }),
}));

vi.mock("models/Widgets", async () => {
  const React = await import("react");
  return {
    default: {
      myTasks: {
        title: "My tasks",
        description: "Open tasks",
        component: React.createElement("div", null, "My tasks widget"),
      },
      runners: {
        title: "Runners",
        description: "Runner status",
        component: React.createElement("div", null, "Runners widget"),
      },
    },
  };
});

vi.mock("components/ui/toast", () => ({
  actionCompletedToast: vi.fn(),
}));

beforeEach(() => {
  requestUserPatchMock.mockReset().mockResolvedValue({});
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );

it("offers Save and Save and close, disabled until a widget changes", () => {
  renderPage();
  fireEvent.click(screen.getByRole("button", { name: "Configure" }));

  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Save and close" })).toBeDisabled();
});

it("Save keeps the Configure tab open after saving", async () => {
  renderPage();
  fireEvent.click(screen.getByRole("button", { name: "Configure" }));
  fireEvent.click(screen.getByRole("checkbox", { name: /My tasks/ }));
  fireEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() => expect(requestUserPatchMock).toHaveBeenCalledTimes(1));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled(),
  );
  expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
});

it("Save and close stores the selection and returns to the View tab", async () => {
  renderPage();
  fireEvent.click(screen.getByRole("button", { name: "Configure" }));
  fireEvent.click(screen.getByRole("checkbox", { name: /Runners/ }));
  fireEvent.click(screen.getByRole("button", { name: "Save and close" }));

  await waitFor(() => expect(requestUserPatchMock).toHaveBeenCalledTimes(1));
  expect(
    requestUserPatchMock.mock.calls[0][1].preferences["dashboard.widgets"]
      .runners.visible,
  ).toBe(false);
  expect(await screen.findByText("My tasks widget")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Save and close" }),
  ).not.toBeInTheDocument();
});

it("Select all and Unselect all toggle every widget", () => {
  renderPage();
  fireEvent.click(screen.getByRole("button", { name: "Configure" }));

  fireEvent.click(screen.getByRole("button", { name: "Unselect all" }));
  screen
    .getAllByRole("checkbox")
    .forEach((box) => expect(box).not.toBeChecked());
  expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();

  fireEvent.click(screen.getByRole("button", { name: "Select all" }));
  screen.getAllByRole("checkbox").forEach((box) => expect(box).toBeChecked());
});
