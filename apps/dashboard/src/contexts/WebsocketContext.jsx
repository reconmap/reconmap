import Configuration from "Configuration";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

const createWebsocketConnection = (user, onClose) => {
    const notificationServiceUrl = Configuration.getNotificationsServiceUrl();
    console.debug("reconmap-ws: connecting");

    const urlParams = new URLSearchParams();
    urlParams.set("token", user.access_token);
    const ws = new WebSocket(`${notificationServiceUrl}/ws?${urlParams.toString()}`);

    ws.addEventListener("open", () => console.debug("reconmap-ws: connected"));
    ws.addEventListener("error", (err) => console.debug("reconmap-ws: errored", err));
    ws.addEventListener("close", () => {
        console.debug("reconmap-ws: disconnected");
        if (onClose) onClose();
    });

    return ws;
};

export const WebsocketContext = createContext({ connection: null });

export const WebsocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        if (!user?.access_token) {
            // User logged out: close connection if exists
            if (connection && connection.readyState === WebSocket.OPEN) {
                console.debug("reconmap-ws: closing due to logout");
                connection.close();
            }
            setConnection(null);
            return;
        }

        // Avoid reopening if already connected for same user
        if (connection && connection.readyState <= WebSocket.OPEN) return;

        const ws = createWebsocketConnection(user, () => {
            // Attempt reconnect after 5s if user still logged in
            if (user?.access_token) {
                setTimeout(() => setConnection(createWebsocketConnection(user)), 5000);
            }
        });

        setConnection(ws);

        return () => {
            console.debug("reconmap-ws: cleaning up connection");
            ws.close(1000, "component unmounted");
        };
    }, [user]); // only react to user login/logout

    return <WebsocketContext.Provider value={{ connection }}>{children}</WebsocketContext.Provider>;
};

export const useWebsocketMessage = (onMessageHandler) => {
    const { connection } = useContext(WebsocketContext);

    useEffect(() => {
        if (!connection) return;
        connection.addEventListener("message", onMessageHandler);

        return () => connection.removeEventListener("message", onMessageHandler);
    }, [connection, onMessageHandler]);
};

export default WebsocketProvider;
