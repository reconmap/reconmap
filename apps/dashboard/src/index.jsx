import { requestSessionPost } from "api/requests/session.js";
import HeaderLogo from "components/layout/HeaderLogo.jsx";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import KeyCloakService from "services/keycloak.js";
import { initialiseUserPreferences } from "services/userPreferences.js";
import "translations/i18n";
import { memoryStore } from "utilities/memoryStore.js";
import App from "./App.jsx";
import "./styles/main.css";

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

const scheduleTokenRefreshBeforeExpiration = () => {
    const keycloak = KeyCloakService.getInstance();
    const jwtExpiration = keycloak.tokenParsed?.exp;
    console.debug("Token expiration (exp): " + jwtExpiration);
    if (typeof jwtExpiration === "number") {
        setTimeout(
            () => {
                keycloak
                    .updateToken(50)
                    .then((refreshed) => {
                        if (refreshed) {
                            console.log("refreshed " + new Date());

                            scheduleTokenRefreshBeforeExpiration();
                        } else {
                            console.log("not refreshed " + new Date());
                        }
                    })
                    .catch((err) => {
                        console.error("Failed to refresh token " + new Date());
                    });
            },
            jwtExpiration * 1000 - Date.now() - 5000,
        );
    } else {
        console.error("Token expiration (exp) is not available.");
    }
};

const onAuthSuccess = () => {
    TimeAgo.addDefaultLocale(en);

    requestSessionPost()
        .then((resp) => resp.json())
        .then((data) => {
            const userObject = {
                id: data.id,
                preferences: initialiseUserPreferences(data),
                ...KeyCloakService.getUserInfo(),
            };
            memoryStore.set("user", userObject);

            appRoot.render(
                <React.StrictMode>
                    <App />
                    <Toaster />
                </React.StrictMode>,
            );
        })
        .catch((err) => {
            throw err;
        });

    scheduleTokenRefreshBeforeExpiration();
};

const onAuthFailure = (message) => {
    appRoot.render(
        <div>
            <a href="/" className="logo">
                <HeaderLogo />
                <h3>Authentication error: {JSON.stringify(message)}</h3>
            </a>
        </div>,
    );
};

KeyCloakService.login(onAuthSuccess, onAuthFailure);

