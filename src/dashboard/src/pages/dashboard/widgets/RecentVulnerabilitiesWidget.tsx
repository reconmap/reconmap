import { useVulnerabilitiesQuery } from "api/vulnerabilities";
import VulnerabilityBadge from "components/badges/VulnerabilityBadge";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import DashboardWidget from "./Widget";

const RecentVulnerabilitiesWidget = () => {
    const {
        data: vulnerabilities,
        isLoading,
        isError,
        error,
    } = useVulnerabilitiesQuery({
        limit: 5,
        orderColumn: "createdAt",
        orderDirection: "desc",
    });

    if (isError) return <DashboardWidget title="Recent vulnerabilities"><p className="has-text-danger">Error loading vulnerabilities: {error.message}</p></DashboardWidget>;

    return (
        <DashboardWidget title="Recent vulnerabilities">
            {!isLoading && vulnerabilities.data.length === 0 ? (
                <p>No vulnerabilities to show.</p>
            ) : (
                <table className="table is-fullwidth">
                    <thead>
                        <tr>
                            <th>Summary</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <LoadingTableRow numColumns={2} numRows={5} />}
                        {vulnerabilities?.data.map((vulnerability) => (
                            <tr key={vulnerability.id}>
                                <td>
                                    <VulnerabilityBadge key={vulnerability.id} vulnerability={vulnerability} />
                                </td>
                                <td>
                                    <RelativeDateFormatter date={vulnerability.createdAt} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </DashboardWidget>
    );
};

export default RecentVulnerabilitiesWidget;
