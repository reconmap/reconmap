import { render, screen } from "@testing-library/react";
import ExternalLink from "./ExternalLink";

describe("ExternalLink", () => {
    it("renders a dash when there are no children", () => {
        render(<ExternalLink />);
        expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("renders a link that opens in a new target", () => {
        render(<ExternalLink href="#bar">Foo</ExternalLink>);

        const link = screen.getByRole("link", { name: /foo/i });
        expect(link).toHaveAttribute("href", "#bar");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
});
