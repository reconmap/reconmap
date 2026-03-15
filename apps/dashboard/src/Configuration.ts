import { KeycloakConfig } from "keycloak-js";

const Configuration = {
    getDefaultApiUrl: (): string => window.env.reconmapApiUrl,

    getNotificationsServiceUrl: (): string => window.env.notificationsServiceUrl,

    getContextPath: (): string => window.env.contextPath || "/",

    getLogoUrl: (): string => window.env.logoUrl || "/logo-name.png",

    getKeycloakConfig: (): KeycloakConfig =>
        window.env.keycloak || {
            url: "http://localhost:8080",
            realm: "reconmap",
            clientId: "web-client",
        },
};

export default Configuration;
