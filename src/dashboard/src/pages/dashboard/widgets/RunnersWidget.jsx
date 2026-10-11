import { useRunnersQuery } from "api/runners.js";
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

const RunnersWidget = () => {
    const { data: runners, isLoading, isError, error } = useRunnersQuery();

    if (isLoading) return <Loading />;
    if (isError) return <p className="has-text-danger">Error loading runners: {error.message}</p>;

    return (
        <DashboardWidget title="Runners">
            {runners && runners.length > 0 ? (
                <table className="table is-fullwidth is-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>OS / IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {runners.map((runner) => (
                            <tr key={runner.id}>
                                <td>
                                    <Link to={`/runners/${runner.id}`}><strong>{runner.name}</strong></Link>
                                    <br />
                                    <small className="has-text-grey">{runner.clientId}</small>
                                </td>
                                <td>
                                    {pingedRecently(runner.lastPingAt) ? (
                                        <span className="tag is-success">Online</span>
                                    ) : (
                                        <span className="tag is-warning">Offline</span>
                                    )}
                                </td>
                                <td>
                                    {runner.os || "Unknown"}
                                    {runner.ip && <><br /><small className="has-text-grey">{runner.ip}</small></>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No runners registered.</p>
            )}
        </DashboardWidget>
    );
};

export default RunnersWidget;
