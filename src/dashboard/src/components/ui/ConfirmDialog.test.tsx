import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useConfirm } from "./useConfirm";

vi.mock("react-i18next", () => ({ useTranslation: () => [(key: string) => key] }));

const Harness = ({ onResult }: { onResult: (confirmed: boolean) => void }) => {
    const { confirm, confirmDialog } = useConfirm();
    return (
        <>
            <button onClick={async () => onResult(await confirm("Really?"))}>ask</button>
            {confirmDialog}
        </>
    );
};

describe("useConfirm", () => {
    it("resolves true when confirmed", async () => {
        const onResult = vi.fn();
        render(<Harness onResult={onResult} />);

        await userEvent.click(screen.getByText("ask"));
        expect(screen.getByText("Really?")).toBeVisible();
        await userEvent.click(screen.getByRole("button", { name: "Delete" }));

        expect(onResult).toHaveBeenCalledExactlyOnceWith(true);
    });

    it("resolves false when cancelled", async () => {
        const onResult = vi.fn();
        render(<Harness onResult={onResult} />);

        await userEvent.click(screen.getByText("ask"));
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onResult).toHaveBeenCalledExactlyOnceWith(false);
    });

    it("resolves false when the dialog is dismissed", async () => {
        const onResult = vi.fn();
        const { container } = render(<Harness onResult={onResult} />);

        await userEvent.click(screen.getByText("ask"));
        act(() => container.querySelector("dialog")!.close());

        await waitFor(() => expect(onResult).toHaveBeenCalledExactlyOnceWith(false));
    });
});
