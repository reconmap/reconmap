import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import RunnerModalDialog from "./RunnerModalDialog";

beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
});

it("renders the add runner form", () => {
    const { container } = render(
        <QueryClientProvider client={new QueryClient()}>
            <RunnerModalDialog isOpen={true} onClose={vi.fn()} />
        </QueryClientProvider>,
    );

    expect(container.querySelector("h4")?.textContent).toBe("New runner");
    expect(container.querySelector("form#runner-form input[name='name']")).not.toBeNull();
    expect(container.querySelector("form#runner-form input[name='hostname']")).not.toBeNull();
    expect(container.querySelector("form#runner-form input[name='listenAddr']")).not.toBeNull();
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
});
