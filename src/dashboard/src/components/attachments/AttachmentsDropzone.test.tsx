import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import AttachmentsDropzone from "./AttachmentsDropzone";

vi.mock("api/system", () => ({
    useUploadLimitsQuery: () => ({
        data: {
            maxFileSizeBytes: 1024 * 1024,
            maxFilesPerRequest: 2,
            maxCommandOutputBytes: 2048,
            allowedExtensions: [".pdf", ".txt"],
        },
    }),
}));

const renderDropzone = (props: object = {}) => {
    const { container } = render(
        <MemoryRouter>
            <QueryClientProvider client={new QueryClient()}>
                <AttachmentsDropzone parentType="project" parentId="p1" {...props} />
            </QueryClientProvider>
        </MemoryRouter>,
    );
    return container.querySelector("input[type=file]") as HTMLInputElement;
};

const select = (input: HTMLInputElement, ...files: File[]) => fireEvent.change(input, { target: { files } });

describe("AttachmentsDropzone", () => {
    it("shows the configured limits", () => {
        renderDropzone();

        expect(screen.getByText("1 MB")).toBeTruthy();
        expect(screen.getByText("2")).toBeTruthy();
        expect(screen.getByText(/Allowed types: .pdf, .txt/)).toBeTruthy();
    });

    it("rejects files with a type that is not allowed", () => {
        const input = renderDropzone();

        select(input, new File(["x"], "shell.php"));

        expect(screen.getByRole("alert").textContent).toContain("not allowed");
    });

    it("rejects files over the size limit", () => {
        const input = renderDropzone();

        select(input, new File([new Uint8Array(1024 * 1024 + 1)], "big.pdf"));

        expect(screen.getByRole("alert").textContent).toContain("larger than 1 MB");
    });

    it("accepts a valid file", () => {
        const input = renderDropzone();

        select(input, new File(["x"], "notes.txt"));

        expect(screen.queryByRole("alert")).toBeNull();
        expect(screen.getByText("notes.txt")).toBeTruthy();
    });

    it("applies the command output size limit and no type list", () => {
        const input = renderDropzone({ kind: "commandOutput" });

        select(input, new File([new Uint8Array(4096)], "scan.xml"));

        expect(screen.getByRole("alert").textContent).toContain("larger than 2 KB");
    });
});
