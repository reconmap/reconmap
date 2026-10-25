import { fireEvent, render, screen } from "@testing-library/react";
import { AuthContext } from "contexts/AuthContext";
import { MemoryRouter } from "react-router";
import CommentsPanel from "./CommentsPanel";

const mockCreate = vi.fn();
const mockDelete = vi.fn();
let mockComments: any[] | undefined = [];

vi.mock("api/comments", () => ({
    useCommentsQuery: () => ({ data: mockComments, isLoading: false }),
    useCreateCommentMutation: () => ({ mutate: mockCreate, isPending: false }),
    useDeleteCommentMutation: () => ({ mutate: mockDelete }),
}));

const comment = (overrides = {}) => ({
    id: 1,
    content: "Looks exploitable.",
    createdById: 10,
    createdBy: { fullName: "Ada Lovelace" },
    createdAt: "2020-10-15 13:13:13",
    ...overrides,
});

const renderPanel = (user: any) =>
    render(
        <MemoryRouter>
            <AuthContext.Provider value={{ user }}>
                <CommentsPanel parentType="project" parentId={5} />
            </AuthContext.Provider>
        </MemoryRouter>
    );

describe("CommentsPanel", () => {
    beforeEach(() => {
        mockCreate.mockReset();
        mockDelete.mockReset();
        mockComments = [];
    });

    it("shows the empty state when there are no comments", () => {
        renderPanel({ id: 10, role: "user" });

        expect(screen.getByText("No comments yet.")).toBeInTheDocument();
    });

    it("hides the composer from roles that cannot comment", () => {
        renderPanel({ id: 10, role: "client" });

        expect(screen.queryByRole("button", { name: "Add comment" })).not.toBeInTheDocument();
    });

    it("creates a comment for the parent through the mutation", () => {
        renderPanel({ id: 10, role: "user" });

        fireEvent.change(screen.getByLabelText("Comment"), { target: { value: "Needs retest." } });
        fireEvent.click(screen.getByRole("button", { name: "Add comment" }));

        expect(mockCreate).toHaveBeenCalledWith(
            { parentType: "project", parentId: 5, content: "Needs retest." },
            expect.any(Object)
        );
    });

    it("lets the author delete their own comment", () => {
        mockComments = [comment({ createdById: 10 })];
        vi.spyOn(window, "confirm").mockReturnValue(true);
        renderPanel({ id: 10, role: "user" });

        fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));

        expect(mockDelete).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it("does not offer delete to other regular users", () => {
        mockComments = [comment({ createdById: 99 })];
        renderPanel({ id: 10, role: "user" });

        expect(screen.queryByRole("button", { name: "Delete comment" })).not.toBeInTheDocument();
    });

    it("lets administrators delete any comment", () => {
        mockComments = [comment({ createdById: 99 })];
        renderPanel({ id: 1, role: "administrator" });

        expect(screen.getByRole("button", { name: "Delete comment" })).toBeInTheDocument();
    });

    it("does not delete when the confirmation is declined", () => {
        mockComments = [comment({ createdById: 10 })];
        vi.spyOn(window, "confirm").mockReturnValue(false);
        renderPanel({ id: 10, role: "user" });

        fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));

        expect(mockDelete).not.toHaveBeenCalled();
    });
});
