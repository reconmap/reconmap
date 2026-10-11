import { requestSessionPost } from "api/requests/session.js";
import HeaderLogo from "components/layout/HeaderLogo.jsx";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "react-oidc-context";
import AuthService, { oidcConfig } from "services/auth.js";
import { initialiseUserPreferences } from "services/userPreferences.js";
import "translations/i18n";
import { memoryStore } from "utilities/memoryStore.js";
import App from "./App.jsx";
import "./styles/main.css";

TimeAgo.addDefaultLocale(en);

const rootContainer = document.getElementById("root");
const appRoot = ReactDOM.createRoot(rootContainer);

appRoot.render(
    <div>
        <a href="/" className="logo">
            <HeaderLogo />
            <h3>Authenticating&hellip;</h3>
        </a>
    </div>,
);

const onSigninCallback = (user) => {
    if (!user) {
        appRoot.render(
            <div>
                <a href="/" className="logo">
                    <HeaderLogo />
                    <h3>Authentication error: no user returned</h3>
                </a>
            </div>,
        );
        return;
    }

    AuthService.setCurrentUser(user);

    requestSessionPost()
        .then((resp) => resp.json())
        .then((data) => {
            const userObject = {
                id: data.id,
                preferences: initialiseUserPreferences(data),
                ...AuthService.getUserInfo(),
            };
            memoryStore.set("user", userObject);

            appRoot.render(
                <React.StrictMode>
                    <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
                        <App />
                        <Toaster />
                    </AuthProvider>
                </React.StrictMode>,
            );
        })
        .catch((err) => {
            appRoot.render(
                <div>
                    <a href="/" className="logo">
                        <HeaderLogo />
                        <h3>Session error: {JSON.stringify(err?.message ?? err)}</h3>
                    </a>
                </div>,
            );
        });
};

// Kick off OIDC login flow
AuthService.login(onSigninCallback, (err) => {
    appRoot.render(
        <div>
            <a href="/" className="logo">
                <HeaderLogo />
                <h3>Authentication error: {JSON.stringify(err)}</h3>
            </a>
        </div>,
    );
});
