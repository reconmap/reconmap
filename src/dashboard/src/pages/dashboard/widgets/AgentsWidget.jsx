import { useAgentsQuery } from "api/agents.js";
import Loading from "components/ui/Loading.jsx";
import DashboardWidget from "./Widget.jsx";
import { Link } from "react-router-dom";

const pingedRecently = (lastPingAt) => {
    if (!lastPingAt) return false;
    const lastPingDate = new Date(lastPingAt);
    const now = new Date();
    const diffMinutes = (now - lastPingDate) / 1000 / 60;
    return diffMinutes < 5;
};

const AgentsWidget = () => {
    const { data: agents, isLoading, isError, error } = useAgentsQuery();

    if (isLoading) return <Loading />;
    if (isError) return <p className="has-text-danger">Error loading agents: {error.message}</p>;

    return (
        <DashboardWidget title="Agents">
            {agents && agents.length > 0 ? (
                <table className="table is-fullwidth is-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>OS / IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map((agent) => (
                            <tr key={agent.id}>
                                <td>
                                    <Link to={`/agents/${agent.id}`}><strong>{agent.name}</strong></Link>
                                    <br />
                                    <small className="has-text-grey">{agent.clientId}</small>
                                </td>
                                <td>
                                    {pingedRecently(agent.lastPingAt) ? (
                                        <span className="tag is-success">Online</span>
                                    ) : (
                                        <span className="tag is-warning">Offline</span>
                                    )}
                                </td>
                                <td>
                                    {agent.os || "Unknown"}
                                    {agent.ip && <><br /><small className="has-text-grey">{agent.ip}</small></>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No agents registered.</p>
            )}
        </DashboardWidget>
    );
};

export default AgentsWidget;
