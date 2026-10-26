import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthContext } from "contexts/AuthContext";
import { MemoryRouter, Route, Routes } from "react-router";
import TaskDetailsPage from "./TaskDetailsPage";

const mockRequestTaskPatch = vi.fn();
const mockInvalidateQueries = vi.fn();

const task = {
    id: 3,
    projectId: 1,
    summary: "Scan internal network",
    description: "",
    priority: "medium",
    status: "todo",
    assignedToId: null,
    project_is_template: 0,
    createdBy: { fullName: "Ada" },
};

vi.mock("api/tasks", () => ({
    useTaskQuery: () => ({ data: task }),
    useDeleteTaskMutation: () => ({ mutate: vi.fn() }),
}));

vi.mock("api/requests/tasks", () => ({
    requestTaskPatch: (...args) => mockRequestTaskPatch(...args),
}));

vi.mock("api/requests/projects", () => ({
    requestProject: () => Promise.resolve({ json: () => Promise.resolve({ id: 1, name: "Internal" }) }),
}));

vi.mock("api/users", () => ({
    useUsersQuery: () => ({ data: [] }),
}));

vi.mock("api/attachments", () => ({
    useAttachmentsQuery: () => ({ data: [] }),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@tanstack/react-query")>()),
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

vi.mock("components/comments/CommentsPanel", () => ({ default: () => null }));
vi.mock("components/attachments/AttachmentsDropzone", () => ({ default: () => null }));
vi.mock("components/attachments/AttachmentsTable", () => ({ default: () => null }));

const renderPage = () =>
    render(
        <AuthContext.Provider value={{ user: { id: 7, role: "user" } } as any}>
            <MemoryRouter initialEntries={["/tasks/3"]}>
                <Routes>
                    <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>,
    );

describe("TaskDetailsPage status dropdown", () => {
    beforeEach(() => {
        mockRequestTaskPatch.mockReset();
        mockRequestTaskPatch.mockResolvedValue({ ok: true });
        mockInvalidateQueries.mockReset();
    });

    it("sends the full task with the selected status", async () => {
        renderPage();

        fireEvent.change(screen.getByDisplayValue("Status → Todo"), { target: { value: "done" } });

        await waitFor(() => expect(mockRequestTaskPatch).toHaveBeenCalledTimes(1));
        expect(mockRequestTaskPatch).toHaveBeenCalledWith(3, { ...task, status: "done" });
    });

    it("refreshes the task once the status has been saved", async () => {
        renderPage();

        fireEvent.change(screen.getByDisplayValue("Status → Todo"), { target: { value: "doing" } });

        await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["tasks"] }));
    });
});
