vi.mock("react-i18next", () => ({
    useTranslation: () => [(key) => key],
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import RunnerCreatePage from "./Create";

it("renders the add runner form with a breadcrumb linking back to runners", () => {
    const { container } = render(
        <MemoryRouter initialEntries={["/runners/create"]}>
            <QueryClientProvider client={new QueryClient()}>
                <RunnerCreatePage />
            </QueryClientProvider>
        </MemoryRouter>,
    );

    expect(container.querySelector("nav.breadcrumb")?.textContent).toContain("Add runner");
    expect(screen.getByRole("heading", { level: 1, name: "Add runner" })).not.toBeNull();
    expect(container.querySelector("form input[name='name']")).not.toBeNull();
    expect(container.querySelector("form input[name='hostname']")).not.toBeNull();
    expect(container.querySelector("form input[name='listenAddr']")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Runners" }).getAttribute("href")).toBe("/runners");
    expect(screen.queryByRole("link", { name: "Back to runners" })).toBeNull();
});
