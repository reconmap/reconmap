import { render, screen } from "@testing-library/react";
import TaskProgress from "./TaskProgress";

describe("TaskProgress", () => {
    it("renders a progress element with the completed and total counts", () => {
        render(<TaskProgress completed={2} total={6} />);

        const progress = screen.getByRole("progressbar", {
            name: "2 of 6 tasks completed",
        });
        expect(progress.tagName.toLowerCase()).toBe("progress");
        expect(progress).toHaveAttribute("value", "2");
        expect(progress).toHaveAttribute("max", "6");
    });
});
