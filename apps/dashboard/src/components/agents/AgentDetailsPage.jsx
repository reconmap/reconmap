import { useAgentQuery } from "api/agents.js";
import NativeButtonGroup from "components/form/NativeButtonGroup.jsx";
import Breadcrumb from "components/ui/Breadcrumb.jsx";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import CommandTerminal from "components/ui/CommandTerminal.jsx";
import Tag from "components/ui/Tag.jsx";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../ui/Loading.jsx";

const pingedRecently = (lastPingAt) => {
    if (!lastPingAt) return false;
    const lastPingDate = new Date(lastPingAt);
    const now = new Date();
    const diffMinutes = (now - lastPingDate) / 1000 / 60;
    return diffMinutes < 5; // Consider online if pinged within the last 5 minutes
}


const AgentDetailsPage = () => {
    const { agentId } = useParams();

    const { data: agent, isLoading } = useAgentQuery(agentId);

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
                <Link to="/agents">Agents</Link>
                <Link>{agent.name}</Link>
            </Breadcrumb>


            <Tag>{agent.os}</Tag>                {pingedRecently(agent.lastPingAt) ? (<span className="tag is-success">Online</span>) : (
                <span className="tag is-warning">Offline</span>
            )}

            <h3 className="title is-3">Agent: {agent.name}</h3>

            <dl className="content">
                <dt>Hostname:</dt>
                <dd>{agent.hostname}</dd>

                <dt>IP Address:</dt>
                <dd>{agent.ip}</dd>

                <dt>Listen Address:</dt>
                <dd>{agent.listenAddr}</dd>

                <dt>Last Booted At:</dt>
                <dd>{agent.lastBootAt}</dd>

                <dt>Last Pinged At:</dt>
                <dd>{agent.lastPingAt}</dd>
            </dl>

            <NativeButtonGroup>
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
            </NativeButtonGroup>

            {terminalVisibility &&
                <CommandTerminal agentIp={agent.ip} agentPort={agent.listenAddr} commands={[]} />
            }
        </div>
    );
};

export default AgentDetailsPage;
