import { useRunnerQuery } from "api/runners.js";
import NativeButtonGroup from "components/forms/NativeButtonGroup.jsx";
import Breadcrumb from "components/ui/Breadcrumb.jsx";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import CommandTerminal from "components/ui/CommandTerminal.jsx";
import EmptyField from "components/ui/EmptyField.jsx";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter.jsx";
import Title from "components/ui/Title";
import { useState } from "react";
import { useParams } from "react-router-dom";
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

const DateValue = ({ value }) => {
    if (!value) return <EmptyField />;

    return <>
        <time dateTime={value}>{value}</time> (<RelativeDateFormatter date={value} />)
    </>;
};

const FieldValue = ({ value }) => (value === null || value === undefined || value === "" ? <EmptyField /> : value);

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
            <div className="heading">
                <Breadcrumb current={runner.name} />
            </div>
            <Title type="Runner" title={runner.name} />

            <p className="mb-4">
                <span className={`tag ${pingedRecently(runner.lastPingAt) ? "is-success" : "is-warning"}`}>
                    {pingedRecently(runner.lastPingAt) ? "Online" : "Offline"}
                </span>
            </p>

            <dl className="content">
                <dt>ID:</dt>
                <dd><FieldValue value={runner.id} /></dd>

                <dt>Client ID:</dt>
                <dd><FieldValue value={runner.clientId} /></dd>

                <dt>Enabled:</dt>
                <dd>{runner.active ? "True" : "False"}</dd>

                <dt>Version:</dt>
                <dd><FieldValue value={runner.version} /></dd>

                <dt>Hostname:</dt>
                <dd><FieldValue value={runner.hostname} /></dd>

                <dt>OS:</dt>
                <dd><FieldValue value={runner.os} /></dd>

                <dt>Architecture:</dt>
                <dd><FieldValue value={runner.arch} /></dd>

                <dt>CPU:</dt>
                <dd><FieldValue value={runner.cpu} /></dd>

                <dt>Memory:</dt>
                <dd><FieldValue value={runner.memory} /></dd>

                <dt>IP Address:</dt>
                <dd><FieldValue value={runner.ip} /></dd>

                <dt>Listen Address:</dt>
                <dd><FieldValue value={runner.listenAddr} /></dd>

                <dt>Last Booted At:</dt>
                <dd><DateValue value={runner.lastBootAt} /></dd>

                <dt>Last Pinged At:</dt>
                <dd><DateValue value={runner.lastPingAt} /></dd>
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
