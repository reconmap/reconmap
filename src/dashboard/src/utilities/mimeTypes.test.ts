import { mimeTypeName } from "./mimeTypes";

describe("mimeTypeName", () => {
    it("returns the friendly name of a known type", () => {
        expect(mimeTypeName("application/pdf")).toBe("PDF document");
    });

    it("ignores parameters and case", () => {
        expect(mimeTypeName("Text/Plain; charset=utf-8")).toBe("Text document");
    });

    it("falls back to the given type when unknown", () => {
        expect(mimeTypeName("application/x-unknown")).toBe("application/x-unknown");
    });
});
