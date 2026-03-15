import { useCommandsQuery } from "api/commands.js";
import CommandBadge from "components/commands/Badge";
import Loading from "components/ui/Loading.jsx";
import DashboardWidget from "./Widget";

const PopularCommandsWidget = () => {
    const { data: commands, isLoading } = useCommandsQuery({ limit: 5 });

    if (isLoading) return <Loading />;

    return (
        <DashboardWidget title="Popular commands">
            {commands && commands.data.length > 0 ? (
                <table className="table is-fullwidth">
                    <thead>
                        <tr>
                            <th>Short name</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commands.data.map((command) => (
                            <tr key={command.id}>
                                <td>
                                    <CommandBadge command={command}>{command.name}</CommandBadge>
                                </td>
                                <td>{command.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No commands to show.</p>
            )}
        </DashboardWidget>
    );
};

export default PopularCommandsWidget;
