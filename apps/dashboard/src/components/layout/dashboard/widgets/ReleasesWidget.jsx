import { useReleasesQuery } from "api/community.js";
import ExternalLink from "components/ui/ExternalLink.jsx";
import Loading from "components/ui/Loading";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter.jsx";
import DashboardWidget from "./Widget";

const ReleasesWidget = () => {
    const { data: releases, isLoading, isError } = useReleasesQuery();

    if (isLoading || isError) return <Loading />;

    return (
        <DashboardWidget title="Reconmap releases">
            {releases.length === 0 ? (
                <p>You don't have any assigned tasks.</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Links</th>
                        </tr>
                    </thead>
                    <tbody>
                        {releases.map((task) => (
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
