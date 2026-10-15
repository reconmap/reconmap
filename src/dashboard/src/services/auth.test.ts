import { User } from "oidc-client-ts";
import { getDashboardRoles, getRedirectUri, hasRunnerTerminalAccess } from "./auth";

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

describe("runner terminal access", () => {
    it("allows administrator and superuser roles", () => {
        expect(hasRunnerTerminalAccess(userWithRoles(["administrator"]))).toBe(true);
        expect(hasRunnerTerminalAccess(userWithRoles(["superuser"]))).toBe(true);
    });

    it("rejects user and client roles", () => {
        expect(hasRunnerTerminalAccess(userWithRoles(["user"]))).toBe(false);
        expect(hasRunnerTerminalAccess(userWithRoles(["client"]))).toBe(false);
    });

    it("uses every dashboard role rather than only the first", () => {
        const user = userWithRoles(["user", "superuser"]);
        expect(getDashboardRoles(user)).toEqual(["user", "superuser"]);
        expect(hasRunnerTerminalAccess(user)).toBe(true);
    });
});

describe("handleUnauthorized", () => {
    beforeEach(() => {
        vi.resetModules();
        window.sessionStorage.clear();
    });

    const load = async () => {
        const mod = await import("./auth");
        const removeUser = vi.spyOn(mod.default.userManager, "removeUser").mockResolvedValue();
        const signinRedirect = vi.spyOn(mod.default.userManager, "signinRedirect").mockResolvedValue();
        return { auth: mod.default, removeUser, signinRedirect };
    };

    it("clears the session and starts the OIDC flow", async () => {
        const { auth, removeUser, signinRedirect } = await load();
        expect(await auth.handleUnauthorized()).toBe(true);
        expect(removeUser).toHaveBeenCalledOnce();
        expect(signinRedirect).toHaveBeenCalledOnce();
    });

    it("does not redirect twice (concurrent 401s or a 401 loop)", async () => {
        const { auth, signinRedirect } = await load();
        await auth.handleUnauthorized();
        expect(await auth.handleUnauthorized()).toBe(false);
        expect(signinRedirect).toHaveBeenCalledOnce();
    });
});
