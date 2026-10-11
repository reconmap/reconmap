import { render, screen } from "@testing-library/react";
import Timestamps from "./Timestamps";

describe("Timestamps", () => {
    it("renders time element for creation time", () => {
        render(<Timestamps createdAt="2020-10-15 13:13:13" />);

        const created = screen.getByText("2020-10-15 13:13:13");
        expect(created).toBeInTheDocument();
        expect(created.tagName.toLowerCase()).toBe("time");

        expect(screen.queryByText(/Modified at/i)).not.toBeInTheDocument();
    });

    it("renders time elements for creation and modification times", () => {
        render(<Timestamps createdAt="2020-10-15 13:13:13" updatedAt="2021-12-15 13:13:13" />);

        const created = screen.getByText("2020-10-15 13:13:13");
        const modified = screen.getByText("2021-12-15 13:13:13");
        const label = screen.getByText(/Modified at/i);

        expect(created).toBeInTheDocument();
        expect(modified).toBeInTheDocument();
        expect(label).toBeInTheDocument();
    });
});
