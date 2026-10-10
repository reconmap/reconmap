import { beforeEach, describe, expect, it, vi } from "vitest";

const secureApiFetch = vi.hoisted(() => vi.fn());

vi.mock("services/api.js", () => ({
    default: secureApiFetch,
}));

import { updateUser } from "./users.js";

describe("updateUser", () => {
    beforeEach(() => {
        secureApiFetch.mockReset();
        secureApiFetch.mockResolvedValue(new Response(null, { status: 204 }));
    });

    it("sends only editable identity and app fields", async () => {
        await updateUser({
            id: 7,
            subjectId: "kc-user-7",
            username: "jdoe",
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            fullName: "John Doe",
            active: true,
            role: "user",
            shortBio: "Pentester",
            timezone: "Europe/Madrid",
            locale: "es",
            mfaEnabled: true,
            lastLoginAt: "2026-10-01T10:00:00Z",
            createdAt: "2026-01-01T10:00:00Z",
            updatedAt: "2026-10-02T10:00:00Z",
            preferences: "{}",
        });

        expect(secureApiFetch).toHaveBeenCalledTimes(1);
        const [url, init] = secureApiFetch.mock.calls[0];
        expect(url).toBe("/users/7");
        expect(init.method).toBe("PATCH");

        const body = JSON.parse(init.body);
        expect(body).toEqual({
            username: "jdoe",
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            active: true,
            role: "user",
            shortBio: "Pentester",
            timezone: "Europe/Madrid",
            locale: "es",
        });
    });
});
