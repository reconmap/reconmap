import Badge from "components/badges/Badge";
import UserRoleBadge from "components/badges/UserRoleBadge";
import EmptyField from "components/ui/EmptyField";
import Ipv4Link from "components/ui/Ipv4Link";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import UserAgentLabel from "components/ui/UserAgentLabel";
import UserLink from "components/users/Link";

const AuditLogsTable = ({ auditLog, hideUserColumns = false }) => {
    if (!(auditLog instanceof Array)) {
        return <>Invalid audit log data</>;
    }
    const hasUserLocations = auditLog.some((entry) => entry.hasOwnProperty("user_location"));

    const columns = [
        {
            header: "User",
            enabled: !hideUserColumns,
            cell: (entry) =>
                entry.createdBy?.fullName ? (
                    <UserLink userId={entry.userId}>{entry.createdBy?.fullName}</UserLink>
                ) : (
                    "-"
                ),
        },
        {
            header: "Role",
            enabled: !hideUserColumns,
            cell: (entry) => <UserRoleBadge role={entry.createdBy?.role} />,
        },
        {
            header: "IP address",
            cell: (entry) => <Ipv4Link value={entry.clientIp} />,
        },
        {
            header: "Location",
            cell: (entry) => (entry.userLocation ? entry.userLocation : <EmptyField />),
            enabled: hasUserLocations,
        },
        {
            header: "User agent",
            cell: (entry) => (entry.userAgent ? <UserAgentLabel userAgent={entry.userAgent} /> : "-"),
        },
        {
            header: "Action",
            cell: (entry) => <Badge>{entry.action}</Badge>,
        },
        {
            header: "Object",
            cell: (entry) => entry.object,
        },
        {
            header: "Context",
            cell: (entry) => entry.context ?? "-",
        },
        {
            header: "Date/Time",
            cell: (entry) => entry.createdAt,
        },
    ];

    return <NativeTable columns={columns} rows={auditLog} rowId={(entry) => entry.id}></NativeTable>;
};

export default AuditLogsTable;
