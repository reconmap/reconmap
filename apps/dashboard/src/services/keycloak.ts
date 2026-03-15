import UserPermissions from "components/users/Permissions.js";
import Configuration from "Configuration.js";
import Keycloak from "keycloak-js";

const keycloak: Keycloak = new Keycloak(Configuration.getKeycloakConfig());

const redirectionUrl: string =
    window.location.protocol +
    "//" +
    window.location.hostname +
    ("https" === window.location.protocol ? "" : ":" + window.location.port) +
    Configuration.getContextPath();

const login = (onLoginSuccess: Function, onLoginFailure: Function) => {
    keycloak
        .init({
            onLoad: "login-required",
            messageReceiveTimeout: 2500,
        })
        .then((authenticated: boolean) => {
            if (authenticated) {
                onLoginSuccess();
            } else onLoginFailure();
        })
        .catch((err: any) => {
            console.error(err);
            onLoginFailure(err);
        });
};

const getUserInfo = () => {
    const kcInstance = keycloak;
    if (kcInstance.authenticated) {
        const role = kcInstance?.resourceAccess?.["web-client"]?.roles?.[0];

        const user = {
            fullName: kcInstance?.tokenParsed?.name,
            access_token: kcInstance.token,
            email: kcInstance?.tokenParsed?.email,
            role: role,
            permissions: role ? UserPermissions?.[role as keyof typeof UserPermissions] : undefined,
        };

        return user;
    }
    return null;
};

const KeyCloakService = {
    login: login,
    getUsername: () => keycloak.tokenParsed?.preferred_username,
    getUserInfo: getUserInfo,
    logout: () => {
        keycloak.logout();
    },
    getInstance: () => keycloak,
    getProfileUrl: () => keycloak.createAccountUrl({ redirectUri: redirectionUrl }),
    redirectToAccountManagement: () => keycloak.accountManagement(),
};

export default KeyCloakService;
