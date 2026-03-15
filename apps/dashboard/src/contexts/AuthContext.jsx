import { requestSessionDelete } from "api/requests/session.js";
import { useTheme } from "hooks/useTheme";
import { createContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import KeyCloakService from "services/keycloak";
import { memoryStore } from "utilities/memoryStore.js";

const AuthContext = createContext();

function useAuth() {
    const { i18n } = useTranslation();

    const [user] = useState(memoryStore.get("user"));

    const { setTheme } = useTheme();

    const logout = () => {
        requestSessionDelete().finally(() => {
            KeyCloakService.logout();
        });
    };

    useEffect(() => {
        if (!user.preferences) {
            return;
        }
        setTheme(user.preferences["web-client.theme"]);
        i18n.changeLanguage(user.preferences["web-client.language"]);
    }, [user]);

    return { user, logout };
}

const AuthProvider = ({ children }) => {
    const auth = useAuth();

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const AuthConsumer = AuthContext.Consumer;

export { AuthConsumer, AuthContext, AuthProvider, useAuth };
