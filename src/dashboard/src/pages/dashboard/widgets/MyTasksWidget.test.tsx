import { render, screen } from "@testing-library/react";
import { AuthContext } from "contexts/AuthContext";
import { MemoryRouter } from "react-router";
import MyTasksWidget from "./MyTasksWidget";

const mockUseTasksQuery = vi.fn();

vi.mock("api/tasks", () => ({
    useTasksQuery: (params) => mockUseTasksQuery(params),
}));

const renderWidget = () =>
    render(
        <AuthContext.Provider value={{ user: { id: 7 } } as any}>
            <MemoryRouter>
                <MyTasksWidget />
            </MemoryRouter>
        </AuthContext.Provider>,
    );

describe("MyTasksWidget", () => {
    beforeEach(() => {
        mockUseTasksQuery.mockReset();
    });

    it("requests the current user's open tasks", () => {
        mockUseTasksQuery.mockReturnValue({ data: [], isLoading: false, isError: false });

        renderWidget();

        expect(mockUseTasksQuery).toHaveBeenCalledWith({ assignedToUid: 7, limit: 5, projectIsArchived: 0 });
    });

    it("renders the fetched tasks", () => {
        mockUseTasksQuery.mockReturnValue({
            data: [
                { id: 1, summary: "Scan internal network", status: "todo" },
                { id: 2, summary: "Write report", status: "todo" },
            ],
            isLoading: false,
            isError: false,
        });

        renderWidget();

        expect(screen.getByText("Scan internal network")).toBeInTheDocument();
        expect(screen.getByText("Write report")).toBeInTheDocument();
        expect(screen.queryByText("You don't have any assigned tasks.")).not.toBeInTheDocument();
    });

    it("shows the empty message when the user has no tasks", () => {
        mockUseTasksQuery.mockReturnValue({ data: [], isLoading: false, isError: false });

        renderWidget();

        expect(screen.getByText(/You don't have any assigned tasks\./)).toBeInTheDocument();
    });

    it("shows an error message when the request fails", () => {
        mockUseTasksQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error("Network down"),
        });

        renderWidget();

        expect(screen.getByText(/Error loading tasks: Network down/)).toBeInTheDocument();
    });
});
