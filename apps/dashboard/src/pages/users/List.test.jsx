vi.mock("react-i18next", () => ({
    useTranslation: () => [(key) => key.toUpperCase()],
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { AuthContext } from "contexts/AuthContext";
import { MemoryRouter } from "react-router-dom";
import UsersList from "./List";

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

it("renders with or without a name", async () => {
    const queryClient = createTestQueryClient();

    const { container } = render(
        <MemoryRouter>
            <QueryClientProvider client={queryClient}>
                <AuthContext.Provider value={{ user: null }}>
                    <UsersList />
                </AuthContext.Provider>
            </QueryClientProvider>
        </MemoryRouter>,
    );
    expect(container.innerHTML).toMatch(/Create user<\/button>/);
});
