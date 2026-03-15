import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useAuth } from "contexts/AuthContext";
import { useEffect, useRef, useState } from "react";

const textEncoder = new TextEncoder();

const arrayBufferToString = (buf) => {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};

const CommandTerminal = ({ agentIp, agentPort, commands }) => {
    const terminalEl = useRef();
    const [terminalTitle, setTerminalTitle] = useState("Terminal");
    const { user } = useAuth();

    const [wsError, setWsError] = useState(null);

    useEffect(() => {
        const term = new Terminal({
            screenKeys: true,
            useStyle: true,
            cursorBlink: true,
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalEl.current);

        let retryHandle = null;

        const connectTerminal = () => {
            const agentServiceUrl = `ws://${agentIp}${agentPort}`;
            const webSocket = new WebSocket(`${agentServiceUrl}/term?token=` + user.access_token);
            webSocket.binaryType = "arraybuffer";

            term.onData((data) => {
                webSocket.send(textEncoder.encode("\x00" + data));
            });

            term.onResize((ev) => {
                webSocket.send(textEncoder.encode("\x01" + JSON.stringify({ cols: ev.cols, rows: ev.rows })));
            });

            term.onTitleChange((title) => {
                setTerminalTitle(title);
            });

            webSocket.onopen = (ev) => {
                setTerminalTitle("Connected!");

                commands.forEach((command) => {
                    webSocket.send(textEncoder.encode("\x00" + command + "\r\n"));
                });

                fitAddon.fit();
                term.focus();
            };

            webSocket.onmessage = (ev) => {
                if (ev.data instanceof ArrayBuffer) {
                    term.write(arrayBufferToString(ev.data));
                } else {
                    console.debug(ev.data);
                }
            };

            webSocket.onerror = (ev) => {
                console.error(ev);
                setWsError(ev);
                webSocket.close();
            };

            webSocket.onclose = (ev) => {
                setTerminalTitle("Disconnected");
                clearTimeout(retryHandle);
                retryHandle = setTimeout(connectTerminal, 1000);
            };
        };

        connectTerminal();

        return () => {
            term.dispose();
        };
    }, [commands]);

    return (
        <div>
            {wsError != null ?
                <article className="message is-danger">
                    <div className="message-body">
                        <strong>Unable to establish connection to the Reconmap agent.</strong> Please review the
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
