import { useTasksQuery } from "api/tasks.js";
import TaskBadge from "components/tasks/TaskBadge";
import TaskStatusFormatter from "components/tasks/TaskStatusFormatter";
import Loading from "components/ui/Loading";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import { AuthContext } from "contexts/AuthContext";
import { useContext } from "react";
import DashboardWidget from "./Widget";

const MyTasksWidget = () => {
    const { user } = useContext(AuthContext);
    const { data: tasks, isLoading, isError } = useTasksQuery({ assignedToUid: user.id, limit: 5, projectIsArchived: 0 });

    if (isLoading || isError) return <Loading />;

    const columns = [
        {
            header: 'Summary',
            cell: task => <TaskBadge task={task} />
        },
        {
            header: 'Status',
            cell: task => <TaskStatusFormatter task={task} />
        }
    ];

    return (
        <DashboardWidget title="My tasks">
            <NativeTable rows={[]} rowId={task => task.id} columns={columns} emptyRowsMessage="You don't have any assigned tasks.">
            </NativeTable>
        </DashboardWidget >
    );
};

export default MyTasksWidget;
