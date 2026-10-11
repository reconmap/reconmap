import { useRunnerQuery } from "api/runners.js";
import NativeButtonGroup from "components/forms/NativeButtonGroup.jsx";
import Breadcrumb from "components/ui/Breadcrumb.jsx";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import CommandTerminal from "components/ui/CommandTerminal.jsx";
import Tag from "components/ui/Tag.jsx";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "components/ui/Loading.jsx";
import { useAuth } from "contexts/AuthContext";
import { hasRunnerTerminalAccess } from "services/auth";

const pingedRecently = (lastPingAt) => {
    if (!lastPingAt) return false;
    const lastPingDate = new Date(lastPingAt);
    const now = new Date();
    const diffMinutes = (now - lastPingDate) / 1000 / 60;
    return diffMinutes < 5; // Consider online if pinged within the last 5 minutes
}


const RunnerDetailsPage = () => {
    const { runnerId } = useParams();
    const { user } = useAuth();
    const terminalAllowed = hasRunnerTerminalAccess(user);

    const { data: runner, isLoading } = useRunnerQuery(runnerId);

    const [terminalVisibility, setTerminalVisibility] = useState(false);

    const connect = () => {
        setTerminalVisibility(true);
    };
    const disconnect = () => {
        setTerminalVisibility(false);
    };

    if (isLoading) return <Loading />;

    return (
        <div>
            <Breadcrumb>
                <Link to="/runners">Runners</Link>
                <Link>{runner.name}</Link>
            </Breadcrumb>


            <Tag>{runner.os}</Tag>                {pingedRecently(runner.lastPingAt) ? (<span className="tag is-success">Online</span>) : (
                <span className="tag is-warning">Offline</span>
            )}

            <h3 className="title is-3">Runner: {runner.name}</h3>

            <dl className="content">
                <dt>Hostname:</dt>
                <dd>{runner.hostname}</dd>

                <dt>IP Address:</dt>
                <dd>{runner.ip}</dd>

                <dt>Listen Address:</dt>
                <dd>{runner.listenAddr}</dd>

                <dt>Last Booted At:</dt>
                <dd>{runner.lastBootAt}</dd>

                <dt>Last Pinged At:</dt>
                <dd>{runner.lastPingAt}</dd>
            </dl>

            {terminalAllowed && <NativeButtonGroup>
                <PrimaryButton onClick={connect} disabled={terminalVisibility === true}>
                    Connect
                </PrimaryButton>
                <PrimaryButton
                    className="button is-danger"
                    onClick={disconnect}
                    disabled={terminalVisibility === false}
                >
                    Disconnect
                </PrimaryButton>
            </NativeButtonGroup>}

            {terminalAllowed && terminalVisibility &&
                <CommandTerminal runnerIp={runner.ip} runnerPort={runner.listenAddr} commands={[]} />
            }
        </div>
    );
};

export default RunnerDetailsPage;
