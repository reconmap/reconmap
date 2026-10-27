import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Toaster from "./Toaster";
import { toast } from "./toast";

describe("Toaster", () => {
    it("shows a toast", () => {
        render(<Toaster />);
        act(() => toast.success("Saved"));
        expect(screen.getByText("Saved")).toBeTruthy();
    });
});

describe("Toaster errors", () => {
    it("shows an error toast from an Error and from a plain object", () => {
        render(<Toaster />);
        act(() => toast.error(new Error("Boom")));
        act(() => toast.error({ detail: "x" }));
        expect(screen.getByText("Boom")).toBeTruthy();
    });
});
