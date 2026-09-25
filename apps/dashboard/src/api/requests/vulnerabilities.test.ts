import { describe, expect, it, vi } from "vitest";

vi.mock("utilities/requests.js", () => ({
    requestEntities: vi.fn(),
    requestEntityDelete: vi.fn(),
    requestEntityPost: vi.fn(),
    requestEntityPut: vi.fn(),
}));

import { normalizeVulnerabilityForSave } from "./vulnerabilities.js";

describe("normalizeVulnerabilityForSave", () => {
    it("serializes a blank optional CVSS score as null", () => {
        expect(normalizeVulnerabilityForSave({ summary: "Missing CVSS", cvssScore: "" })).toEqual({
            summary: "Missing CVSS",
            cvssScore: null,
        });
        expect(normalizeVulnerabilityForSave({ cvssScore: null })).toEqual({ cvssScore: null });
    });

    it("serializes a supplied CVSS score as a number", () => {
        expect(normalizeVulnerabilityForSave({ cvssScore: "7.5" })).toEqual({ cvssScore: 7.5 });
    });
});
