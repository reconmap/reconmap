import { describe, expect, it, vi } from "vitest";

vi.mock("utilities/requests.js", () => ({
    requestEntities: vi.fn(),
    requestEntityDelete: vi.fn(),
    requestEntityPost: vi.fn(),
    requestEntityPut: vi.fn(),
}));

import { normalizeFindingForSave } from "./findings";

describe("normalizeFindingForSave", () => {
    it("serializes a blank optional CVSS score as null", () => {
        expect(normalizeFindingForSave({ summary: "Missing CVSS", cvssScore: "" })).toEqual({
            summary: "Missing CVSS",
            cvssScore: null,
        });
        expect(normalizeFindingForSave({ cvssScore: null })).toEqual({ cvssScore: null });
    });

    it("serializes a supplied CVSS score as a number", () => {
        expect(normalizeFindingForSave({ cvssScore: "7.5" })).toEqual({ cvssScore: 7.5 });
    });
});
