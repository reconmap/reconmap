import { requestSessionDelete } from "api/requests/session.js";
import { useTheme } from "hooks/useTheme";
import { createContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AuthService from "services/auth";
import { memoryStore } from "utilities/memoryStore.js";

const AuthContext = createContext();

function useAuth() {
    const { i18n } = useTranslation();

    const [user] = useState(memoryStore.get("user"));

    const { setTheme } = useTheme();

    const logout = () => {
        requestSessionDelete().finally(() => {
            AuthService.logout();
        });
    };

    useEffect(() => {
        if (!user.preferences) {
            return;
        }
        setTheme(user.preferences["dashboard.theme"]);
        i18n.changeLanguage(user.preferences["dashboard.language"]);
    }, [user]);

    return { user, logout };
}

const AuthProvider = ({ children }) => {
    const auth = useAuth();

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const AuthConsumer = AuthContext.Consumer;

export { AuthConsumer, AuthContext, AuthProvider, useAuth };
