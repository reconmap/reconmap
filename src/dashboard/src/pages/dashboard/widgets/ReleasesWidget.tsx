import { useReleasesQuery } from "api/community";
import ExternalLink from "components/ui/ExternalLink";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import DashboardWidget from "./Widget";

const ReleasesWidget = () => {
    const { data: releases, isLoading, isError } = useReleasesQuery();

    return (
        <DashboardWidget title="Reconmap releases">
            {isError ? (
                <p className="has-text-danger">Unable to load data.</p>
            ) : !isLoading && releases.length === 0 ? (
                <p>You don't have any assigned tasks.</p>
            ) : (
                <table className="table is-fullwidth">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Links</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <LoadingTableRow numColumns={3} numRows={3} />}
                        {releases?.map((task) => (
                            <tr key={task.id}>
                                <td>
                                    <RelativeDateFormatter date={task.published_at} />
                                </td>
                                <td>
                                    {task.name}
                                </td>
                                <td>
                                    <ExternalLink href={task.html_url}>View more</ExternalLink>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </DashboardWidget>
    );
};

export default ReleasesWidget;
