import Configuration from "Configuration";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "./AuthContext";

const createSseConnection = (user, onClose) => {
    const apiServiceUrl = Configuration.getDefaultApiUrl();
    console.debug("reconmap-sse: connecting");

    const urlParams = new URLSearchParams();
    urlParams.set("access_token", user.access_token);
    const es = new EventSource(`${apiServiceUrl}/notifications/stream?${urlParams.toString()}`);

    es.addEventListener("open", () => console.debug("reconmap-sse: connected"));
    es.addEventListener("error", (err) => {
        console.debug("reconmap-sse: errored/disconnected", err);
        es.close();
        if (onClose) onClose();
    });

    return es;
};

export const SseContext = createContext({ connection: null });

export const SseProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        if (!user?.access_token) {
            if (connection && connection.readyState !== EventSource.CLOSED) {
                console.debug("reconmap-sse: closing due to logout");
                connection.close();
            }
            setConnection(null);
            return;
        }

        if (connection && connection.readyState <= EventSource.OPEN) return;

        let isMounted = true;
        let es = null;

        // Delay connection to prevent React StrictMode from instantly aborting it,
        // which causes browsers to log a "CORS request did not succeed" error.
        const connect = () => {
            if (!isMounted) return null;
            return createSseConnection(user, () => {
                if (user?.access_token && isMounted) {
                    setTimeout(() => setConnection(connect()), 5000);
                }
            });
        };

        const timeoutId = setTimeout(() => {
            es = connect();
            if (es) setConnection(es);
        }, 150);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            if (es) {
                console.debug("reconmap-sse: cleaning up connection");
                es.close();
            }
        };
    }, [user]);

    return <SseContext.Provider value={{ connection }}>{children}</SseContext.Provider>;
};

export const useSseMessage = (onMessageHandler) => {
    const { connection } = useContext(SseContext);
    const callbackRef = useRef(onMessageHandler);

    useEffect(() => {
        callbackRef.current = onMessageHandler;
    }, [onMessageHandler]);

    useEffect(() => {
        if (!connection) return;
        
        const listener = (event) => {
            if (callbackRef.current) {
                callbackRef.current(event);
            }
        };
        
        connection.addEventListener("message", listener);

        return () => connection.removeEventListener("message", listener);
    }, [connection]);
};

export default SseProvider;
