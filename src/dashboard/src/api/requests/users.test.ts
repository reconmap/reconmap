import { beforeEach, describe, expect, it, vi } from "vitest";

const secureApiFetch = vi.hoisted(() => vi.fn());

vi.mock("services/api.js", () => ({
    default: secureApiFetch,
}));

import { enableMfaApi, updateUser } from "./users.js";

describe("enableMfaApi", () => {
    beforeEach(() => {
        secureApiFetch.mockReset();
        secureApiFetch.mockResolvedValue(new Response(null, { status: 204 }));
    });

    it("posts the enable-mfa action to the user's actions endpoint", async () => {
        await enableMfaApi(7);

        const [url, init] = secureApiFetch.mock.calls[0];
        expect(url).toBe("/users/7/actions");
        expect(init.method).toBe("POST");
        expect(JSON.parse(init.body)).toEqual({ name: "enable-mfa" });
    });
});

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
        });
    });

    it("sends language, timezone and preferences when the owner saves them", async () => {
        await updateUser(
            { id: 7, username: "jdoe", email: "john@example.com", firstName: "John", lastName: "Doe", timezone: "UTC", locale: "en", preferences: undefined },
            { locale: "es", timezone: "Europe/Madrid", preferences: { "dashboard.theme": "light" } },
        );

        const [, init] = secureApiFetch.mock.calls[0];
        const body = JSON.parse(init.body);
        expect(body.locale).toBe("es");
        expect(body.timezone).toBe("Europe/Madrid");
        expect(body.preferences).toEqual({ "dashboard.theme": "light" });
        expect(body.firstName).toBe("John");
    });

    it("never sends the owner-only language and timezone", async () => {
        await updateUser({
            id: 7,
            username: "jdoe",
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            timezone: "Europe/Madrid",
            locale: "es",
            preferences: "{}",
        });

        const [, init] = secureApiFetch.mock.calls[0];
        const body = JSON.parse(init.body);
        expect(body).not.toHaveProperty("timezone");
        expect(body).not.toHaveProperty("locale");
    });
});
