import { render, screen } from "@testing-library/react";
import TabToolbar from "./TabToolbar";

describe("TabToolbar", () => {
    it("renders the start and end content", () => {
        render(<TabToolbar start={<span>Progress</span>} end={<button>New task</button>} />);

        expect(screen.getByText("Progress")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "New task" })).toBeInTheDocument();
    });

    it("renders without start or end content", () => {
        const { container } = render(<TabToolbar />);

        expect(container.firstChild).toBeInstanceOf(HTMLElement);
    });
});
