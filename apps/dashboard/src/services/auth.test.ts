import { User } from "oidc-client-ts";
import { getDashboardRoles, getRedirectUri, hasAgentTerminalAccess } from "./auth.js";

const userWithRoles = (roles: string[]): User => ({
    profile: { resource_access: { dashboard: { roles } } },
} as unknown as User);

describe("getRedirectUri", () => {
    it.each([
        ["http:", "reconmap.example", "", "/dashboard", "http://reconmap.example/dashboard"],
        ["http:", "localhost", "5500", "/", "http://localhost:5500/"],
        ["https:", "reconmap.example", "443", "/dashboard", "https://reconmap.example/dashboard"],
    ])("builds %s redirect URIs correctly", (protocol, hostname, port, contextPath, expected) => {
        expect(getRedirectUri({ protocol, hostname, port }, contextPath)).toBe(expected);
    });
});

describe("agent terminal access", () => {
    it("allows administrator and superuser roles", () => {
        expect(hasAgentTerminalAccess(userWithRoles(["administrator"]))).toBe(true);
        expect(hasAgentTerminalAccess(userWithRoles(["superuser"]))).toBe(true);
    });

    it("rejects user and client roles", () => {
        expect(hasAgentTerminalAccess(userWithRoles(["user"]))).toBe(false);
        expect(hasAgentTerminalAccess(userWithRoles(["client"]))).toBe(false);
    });

    it("uses every dashboard role rather than only the first", () => {
        const user = userWithRoles(["user", "superuser"]);
        expect(getDashboardRoles(user)).toEqual(["user", "superuser"]);
        expect(hasAgentTerminalAccess(user)).toBe(true);
    });
});
