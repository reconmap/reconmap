import { useAuditLogQuery } from "api/auditlog.js";
import Badge from "components/badges/Badge";
import UserLink from "components/users/Link";
import DashboardWidget from "./Widget";

const RecentActivityWidget = () => {
    const { data: auditLog } = useAuditLogQuery({ limit: 10 });

    return (
        <DashboardWidget title="Recent activity">
            {auditLog && auditLog.data.length > 0 ? (
                <table className="table is-fullwidth">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Object</th>
                            <th>User</th>
                            <th>Date/Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditLog.data.map((log) => (
                            <tr key={log.id}>
                                <td>
                                    <Badge>{log.action}</Badge>
                                </td>
                                <td>{log.object}</td>
                                <td>
                                    {log.createdBy?.fullName ? <UserLink userId={log.createdByUid}>{log.createdBy?.fullName}</UserLink> : "-"}
                                </td>
                                <td>{log.createdAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No activity to show.</p>
            )}
        </DashboardWidget>
    );
};

export default RecentActivityWidget;
