import { render, screen } from "@testing-library/react";

HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
};
HTMLDialogElement.prototype.close = function () {
    this.open = false;
};

async function renderAppAt(path: string) {
    vi.resetModules();
    window.history.pushState({}, "", path);
    const { default: App } = await import("./App");
    return render(<App />);
}

describe("App data router smoke", () => {
    it("renders PageNotFound for unknown paths", async () => {
        await renderAppAt("/definitely-not-a-route");
        expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    });

    it("renders a known protected route inside the dashboard layout", async () => {
        await renderAppAt("/organisations/create");
        expect((await screen.findAllByRole("navigation")).length).toBeGreaterThan(0);
        expect(screen.queryByRole("heading", { name: "Page not found" })).toBeNull();
        expect(document.body.textContent).not.toMatch(/Unexpected Application Error/);
    });
});
