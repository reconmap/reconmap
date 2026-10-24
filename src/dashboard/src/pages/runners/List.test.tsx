vi.mock("react-i18next", () => ({
    useTranslation: () => [(key) => key],
}));

vi.mock("api/runners.js", () => ({
    useRunnersQuery: vi.fn(),
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRunnersQuery } from "api/runners";
import { MemoryRouter } from "react-router";
import RunnersListPage from "./List";

const renderPage = () =>
    render(
        <MemoryRouter initialEntries={["/runners"]}>
            <QueryClientProvider client={new QueryClient()}>
                <RunnersListPage />
            </QueryClientProvider>
        </MemoryRouter>,
    );

it("renders the header, breadcrumbs and actions", () => {
    (useRunnersQuery as any).mockReturnValue({ data: [], isLoading: false, isFetching: false, refetch: vi.fn() });

    const { container } = renderPage();

    expect(container.querySelector("nav.breadcrumb")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Runners" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Refresh" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "New runner" })).not.toBeNull();
});

it("refetches the runners when Refresh is clicked", () => {
    const refetch = vi.fn();
    (useRunnersQuery as any).mockReturnValue({ data: [], isLoading: false, isFetching: false, refetch });

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

    expect(refetch).toHaveBeenCalledTimes(1);
});

it("no longer renders the add runner form inline", () => {
    (useRunnersQuery as any).mockReturnValue({ data: [], isLoading: false, isFetching: false, refetch: vi.fn() });

    const { container } = renderPage();

    expect(container.querySelector("form")).toBeNull();
});
