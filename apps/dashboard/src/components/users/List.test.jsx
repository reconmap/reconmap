import { render } from "@testing-library/react";
import { AuthContext } from "contexts/AuthContext";
import { act } from "react";
import ReactDOM from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import UsersList from "./List";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

beforeEach(() => {
});

afterEach(() => {
});

it("renders with or without a name", async () => {
	  const queryClient = createTestQueryClient();
    vi.mock("react-i18next", () => ({
        useTranslation: () => [(key) => key.toUpperCase()],
    }));

    const { container, findByText } =render(
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
