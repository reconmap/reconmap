import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import CommentCard from "./CommentCard";

const comment = {
    id: 1,
    content: "Looks **exploitable**.",
    createdById: 10,
    createdBy: { fullName: "Ada Lovelace" },
    createdAt: "2020-10-15 13:13:13",
};

const renderCard = (overrides = {}) => {
    const onDelete = vi.fn();
    render(
        <MemoryRouter>
            <CommentCard comment={comment} canDelete={false} onDelete={onDelete} {...overrides} />
        </MemoryRouter>
    );
    return { onDelete };
};

describe("CommentCard", () => {
    it("renders the comment as markdown with the author", () => {
        renderCard();

        expect(screen.getByText("exploitable").tagName).toBe("STRONG");
        expect(screen.getByRole("link", { name: "Ada Lovelace" })).toHaveAttribute("href", "/users/10");
    });

    it("hides the delete button when the user cannot delete", () => {
        renderCard({ canDelete: false });

        expect(screen.queryByRole("button", { name: "Delete comment" })).not.toBeInTheDocument();
    });

    it("calls onDelete when the delete button is clicked", () => {
        const { onDelete } = renderCard({ canDelete: true });

        fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));

        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
