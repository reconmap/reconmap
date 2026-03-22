import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SidemenuLayout from "./SidemenuLayout.jsx";

describe("SidemenuLayout", () => {
    const links = [
        { type: "label", name: "Main" },
        { name: "Overview", url: "/projects/overview" },
        {
            name: "Reports",
            url: "/projects/reports",
            children: [{ name: "Summary", url: "/projects/reports/summary" }],
        },
    ];

    beforeEach(() => {
        window.localStorage.clear();
    });

    it("collapses and expands the sidebar", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/projects/overview"]}>
                <SidemenuLayout links={links}>
                    <div>Content</div>
                </SidemenuLayout>
            </MemoryRouter>,
        );

        expect(screen.getByText("Overview")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));

        expect(screen.queryByText("Overview")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Expand sidebar" }));

        expect(screen.getByText("Overview")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Collapse sidebar" })).toBeInTheDocument();
    });

    it("restores collapsed state from localStorage", () => {
        window.localStorage.setItem("dashboard.sidemenu.collapsed", "true");

        render(
            <MemoryRouter initialEntries={["/projects/overview"]}>
                <SidemenuLayout links={links}>
                    <div>Content</div>
                </SidemenuLayout>
            </MemoryRouter>,
        );

        expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
        expect(screen.queryByText("Overview")).not.toBeInTheDocument();
    });
});
