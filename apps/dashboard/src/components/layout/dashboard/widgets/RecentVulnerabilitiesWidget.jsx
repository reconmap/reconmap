import { useVulnerabilitiesQuery } from "api/vulnerabilities.js";
import VulnerabilityBadge from "components/badges/VulnerabilityBadge";
import Loading from "components/ui/Loading";
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

    if (isLoading) return <Loading />;
    if (isError) return <p>Error loading vulnerabilities: {error.message}</p>;

    return (
        <DashboardWidget title="Recent vulnerabilities">
            {vulnerabilities.data.length === 0 ? (
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
                        {vulnerabilities.data.map((vulnerability) => (
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
