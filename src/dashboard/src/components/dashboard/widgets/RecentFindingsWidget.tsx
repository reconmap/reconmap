import { useFindingsQuery } from "api/findings";
import FindingBadge from "components/badges/FindingBadge";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import DashboardWidget from "./DashboardWidget";

const RecentFindingsWidget = () => {
    const {
        data: findings,
        isLoading,
        isError,
        error,
    } = useFindingsQuery({
        limit: 5,
        orderColumn: "createdAt",
        orderDirection: "desc",
    });

    if (isError) return <DashboardWidget title="Recent findings"><p className="has-text-danger">Error loading findings: {error.message}</p></DashboardWidget>;

    return (
        <DashboardWidget title="Recent findings">
            {!isLoading && findings.data.length === 0 ? (
                <p>No findings to show.</p>
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
                        {findings?.data.map((finding) => (
                            <tr key={finding.id}>
                                <td>
                                    <FindingBadge key={finding.id} finding={finding} />
                                </td>
                                <td>
                                    <RelativeDateFormatter date={finding.createdAt} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </DashboardWidget>
    );
};

export default RecentFindingsWidget;
