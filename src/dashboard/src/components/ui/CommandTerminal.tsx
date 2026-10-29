import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useAuth } from "contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { hasRunnerTerminalAccess } from "services/auth";

const textEncoder = new TextEncoder();

const arrayBufferToString = (buf) => {
    return String.fromCharCode.apply(null, new Uint8Array(buf) as any);
};

const CommandTerminal = ({ runnerIp, runnerPort, commands }: any) => {
    const terminalEl = useRef<any>(null);
    const [terminalTitle, setTerminalTitle] = useState("Terminal");
    const { user } = useAuth();
    const terminalAllowed = hasRunnerTerminalAccess(user);

    const [wsError, setWsError] = useState<any>(null);

    useEffect(() => {
        if (!terminalAllowed || !user?.access_token) {
            return undefined;
        }
        const term = new Terminal({
                        cursorBlink: true,
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalEl.current);

        let retryHandle: any = null;
        let webSocket: WebSocket | null = null;
        let disposed = false;

        const connectTerminal = () => {
            const scheme = window.location.protocol === "https:" ? "wss" : "ws";
            const runnerServiceUrl = `${scheme}://${runnerIp}${runnerPort}`;
            const socket = new WebSocket(`${runnerServiceUrl}/term`, [
                "reconmap-terminal",
                `bearer.${user.access_token}`,
            ]);
            webSocket = socket;
            socket.binaryType = "arraybuffer";

            term.onData((data) => {
                socket.send(textEncoder.encode("\x00" + data));
            });

            term.onResize((event) => {
                socket.send(textEncoder.encode("\x01" + JSON.stringify({ cols: event.cols, rows: event.rows })));
            });

            term.onTitleChange((title) => {
                setTerminalTitle(title);
            });

            socket.onopen = () => {
                setTerminalTitle("Connected!");

                commands.forEach((command) => {
                    socket.send(textEncoder.encode("\x00" + command + "\r\n"));
                });

                fitAddon.fit();
                term.focus();
            };

            socket.onmessage = (event) => {
                if (event.data instanceof ArrayBuffer) {
                    term.write(arrayBufferToString(event.data));
                } else {
                    console.debug(event.data);
                }
            };

            socket.onerror = (event) => {
                console.error(event);
                setWsError(event);
                socket.close();
            };

            socket.onclose = () => {
                if (disposed) return;
                setTerminalTitle("Disconnected");
                clearTimeout(retryHandle);
                retryHandle = setTimeout(connectTerminal, 1000);
            };
        };

        connectTerminal();

        return () => {
            disposed = true;
            clearTimeout(retryHandle);
            webSocket?.close();
            term.dispose();
        };
    }, [runnerIp, runnerPort, commands, terminalAllowed, user?.access_token]);

    if (!terminalAllowed) {
        return (
            <article className="message is-danger">
                <div className="message-body">Terminal access is restricted to administrators and superusers.</div>
            </article>
        );
    }

    return (
        <div>
            {wsError != null ?
                <article className="message is-danger">
                    <div className="message-body">
                        <strong>Unable to establish connection to the Reconmap runner.</strong> Please review the
                        web socket connection settings.
                    </div>
                </article>
                :
                <>
                    <h4>{terminalTitle}</h4>
                    <div ref={terminalEl}></div>
                </>
            }
        </div>
    );
};

export default CommandTerminal;
