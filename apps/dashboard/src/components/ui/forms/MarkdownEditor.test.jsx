import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MarkdownEditor from "./MarkdownEditor";

describe("MarkdownEditor", () => {
    it("renders textarea and formatting buttons in edit mode by default", () => {
        render(<MarkdownEditor name="test-editor" value="Hello world" />);

        const textarea = screen.getByRole("textbox");
        expect(textarea).toBeInTheDocument();
        expect(textarea.value).toBe("Hello world");

        // Verify formatting buttons exist
        expect(screen.getByTitle("Bold")).toBeInTheDocument();
        expect(screen.getByTitle("Italic")).toBeInTheDocument();
        expect(screen.getByTitle("Heading")).toBeInTheDocument();

        // Verify tabs exist
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("Preview")).toBeInTheDocument();
    });

    it("triggers onChange when content is modified", async () => {
        const handleChange = vi.fn();
        render(<MarkdownEditor name="test-editor" value="" onChange={handleChange} />);

        const textarea = screen.getByRole("textbox");
        await userEvent.type(textarea, "New text");

        expect(handleChange).toHaveBeenCalled();
        const callArg = handleChange.mock.calls[0][0];
        expect(callArg.target.name).toBe("test-editor");
        expect(callArg.target.value).toBe("N"); // first letter typed
    });

    it("switches to preview mode when Preview tab is clicked", async () => {
        render(<MarkdownEditor name="test-editor" value="**Bold Text**" />);

        const previewTab = screen.getByText("Preview");
        await userEvent.click(previewTab);

        // Textarea should be hidden (using style display: none)
        const textarea = screen.getByRole("textbox", { hidden: true });
        expect(textarea).not.toBeVisible();

        // ReactMarkdown content should be visible
        const previewElement = screen.getByText("Bold Text");
        expect(previewElement).toBeInTheDocument();
        expect(previewElement.tagName).toBe("STRONG");
    });

    it("applies formatting to selected text when formatting button is clicked", async () => {
        const handleChange = vi.fn();
        render(<MarkdownEditor name="test-editor" value="hello" onChange={handleChange} />);

        const textarea = screen.getByRole("textbox");
        textarea.setSelectionRange(0, 5); // Select "hello"

        const boldButton = screen.getByTitle("Bold");
        await userEvent.click(boldButton);

        // State changes to: **hello**
        expect(textarea.value).toBe("**hello**");
        expect(handleChange).toHaveBeenCalledWith(
            expect.objectContaining({
                target: expect.objectContaining({
                    name: "test-editor",
                    value: "**hello**",
                }),
            })
        );
    });
});
