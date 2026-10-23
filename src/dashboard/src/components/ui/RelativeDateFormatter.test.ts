import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "./RelativeDateFormatter";

describe("formatRelativeTime", () => {
    const now = Date.parse("2026-01-15T12:00:00Z");

    it("formats past times", () => {
        expect(formatRelativeTime(now - 5 * 60 * 1000, now)).toBe("5 minutes ago");
        expect(formatRelativeTime(now - 3 * 60 * 60 * 1000, now)).toBe("3 hours ago");
        expect(formatRelativeTime(now - 2 * 24 * 60 * 60 * 1000, now)).toBe("2 days ago");
    });

    it("formats future times", () => {
        expect(formatRelativeTime(now + 2 * 60 * 60 * 1000, now)).toBe("in 2 hours");
    });

    it("formats very recent times", () => {
        expect(formatRelativeTime(now - 10 * 1000, now)).toBe("10 seconds ago");
    });
});
