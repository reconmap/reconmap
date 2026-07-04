import UserPermissions from "components/users/Permissions.js";
import Configuration from "Configuration.js";
import { User, UserManager, WebStorageStateStore } from "oidc-client-ts";

const keycloakConfig = Configuration.getKeycloakConfig();

const redirectUri: string =
    window.location.protocol +
    "//" +
    window.location.hostname +
    ("https" !== window.location.protocol ? ":" + window.location.port : "") +
    Configuration.getContextPath();

export const oidcConfig = {
    authority: `${keycloakConfig.url}/realms/${keycloakConfig.realm}`,
    client_id: keycloakConfig.clientId,
    redirect_uri: redirectUri,
    post_logout_redirect_uri: redirectUri,
    scope: "openid profile email",
    // Use refresh tokens for silent renewal — avoids hidden iframes that
    // Keycloak blocks via X-Frame-Options: SAMEORIGIN.
    automaticSilentRenew: true,
    useRefreshTokens: true,
    // Do NOT set loadUserInfo:true — it can overwrite ID token claims (including
    // preferred_username) with the userinfo response which may omit them.
    // The ID token already carries all the claims we need from Keycloak.
    userStore: new WebStorageStateStore({ store: window.localStorage }),
};

const userManager = new UserManager(oidcConfig);

let currentUser: User | null = null;

/**
 * Extract the dashboard role from the current user.
 *
 * Keycloak puts `resource_access` in the ACCESS token by default, but the
 * correct approach is to configure a "User Client Role" protocol mapper on
 * the `dashboard` client with "Add to ID token" enabled. That makes the
 * claim available on `user.profile` (the decoded ID token) without any
 * manual JWT parsing.
 *
 * Keycloak admin: Clients → dashboard → Client scopes → dashboard-dedicated
 *   → Add mapper → User Client Role → Add to ID token ✅
 */
const extractRole = (user: User): string | undefined => {
    // Prefer the ID token claim (requires the protocol mapper above).
    const profileAccess = (user.profile as Record<string, any>)?.resource_access;
    if (profileAccess) {
        return profileAccess["dashboard"]?.roles?.[0];
    }

    // Fallback: decode the access token. Works without Keycloak config changes
    // but reading access token internals from the browser is an anti-pattern
    // — prefer fixing this at the Keycloak protocol mapper level.
    try {
        const payload = JSON.parse(atob(user.access_token!.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return payload?.resource_access?.["dashboard"]?.roles?.[0];
    } catch {
        return undefined;
    }
};

/**
 * Detect whether the current page load is a redirect back from Keycloak
 * (i.e. the URL contains `code=` and `state=`).
 */
const isRedirectCallback = (): boolean => {
    const params = new URLSearchParams(window.location.search);
    return params.has("code") && params.has("state");
};

const login = (
    onLoginSuccess: (user: User) => void,
    onLoginFailure: (err?: unknown) => void,
) => {
    if (isRedirectCallback()) {
        // We're back from Keycloak — complete the authorization code exchange.
        userManager
            .signinRedirectCallback()
            .then((user) => {
                // Clean up the code/state params from the URL without a reload.
                window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname,
                );
                currentUser = user;
                console.debug("[auth] profile claims:", user.profile);
                onLoginSuccess(user);
            })
            .catch(onLoginFailure);
        return;
    }

    // Not a callback — check if there's already a valid user in storage.
    userManager
        .getUser()
        .then((user) => {
            if (user && !user.expired) {
                currentUser = user;
                console.debug("[auth] restored profile claims:", user.profile);
                onLoginSuccess(user);
            } else {
                // No valid session — redirect to Keycloak login.
                userManager.signinRedirect().catch(onLoginFailure);
            }
        })
        .catch(() => {
            userManager.signinRedirect().catch(onLoginFailure);
        });
};

const getUserInfo = () => {
    const user = currentUser;
    if (!user || user.expired) return null;

    const role = extractRole(user);

    return {
        fullName: user.profile.name,
        access_token: user.access_token,
        email: user.profile.email,
        role,
        permissions: role ? UserPermissions?.[role as keyof typeof UserPermissions] : undefined,
    };
};

const logout = () => {
    currentUser = null;
    userManager.signoutRedirect();
};

const getUsername = (): string | undefined => {
    const profile = currentUser?.profile;
    if (!profile) return undefined;
    // preferred_username comes from the ID token; fall back to name then email.
    return (profile.preferred_username ?? profile.name ?? profile.email) as
        string | undefined;
};

const getProfileUrl = (): string => {
    const cfg = Configuration.getKeycloakConfig();
    return `${cfg.url}/realms/${cfg.realm}/account?referrer=${cfg.clientId}&referrer_uri=${encodeURIComponent(redirectUri)}`;
};

const redirectToAccountManagement = (): void => {
    window.location.assign(getProfileUrl());
};

const getToken = (): string | undefined => currentUser?.access_token;

const setCurrentUser = (user: User | null) => {
    currentUser = user;
};

const AuthService = {
    login,
    logout,
    getUserInfo,
    getUsername,
    getProfileUrl,
    redirectToAccountManagement,
    getToken,
    setCurrentUser,
    userManager,
};

export default AuthService;
