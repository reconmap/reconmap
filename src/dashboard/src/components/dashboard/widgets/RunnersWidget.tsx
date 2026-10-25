import { useRunnersQuery } from "api/runners";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import DashboardWidget from "./DashboardWidget";
import { Link } from "react-router";

const pingedRecently = (lastPingAt) => {
    if (!lastPingAt) return false;
    const lastPingDate = new Date(lastPingAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastPingDate.getTime()) / 1000 / 60;
    return diffMinutes < 5;
};

const RunnersWidget = () => {
    const { data: runners, isLoading, isError, error } = useRunnersQuery();

    if (isError) return <DashboardWidget title="Runners"><p className="has-text-danger">Error loading runners: {error.message}</p></DashboardWidget>;

    return (
        <DashboardWidget title="Runners">
            {isLoading || (runners && runners.length > 0) ? (
                <table className="table is-fullwidth is-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>OS / IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <LoadingTableRow numColumns={3} numRows={3} />}
                        {runners?.map((runner) => (
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
