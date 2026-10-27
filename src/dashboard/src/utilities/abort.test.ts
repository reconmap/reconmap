import { describe, expect, it } from "vitest";
import { ignoreAbortError, isAbortError } from "./abort";

describe("abort utilities", () => {
    it("detects the error of an aborted fetch", async () => {
        const controller = new AbortController();
        controller.abort();

        const error = await fetch("http://localhost/unused", { signal: controller.signal }).catch((err) => err);

        expect(isAbortError(error)).toBe(true);
    });

    it("swallows abort errors", () => {
        expect(() => ignoreAbortError(new DOMException("aborted", "AbortError"))).not.toThrow();
    });

    it("rethrows any other error", () => {
        const error = new Error("boom");

        expect(() => ignoreAbortError(error)).toThrow(error);
    });
});
