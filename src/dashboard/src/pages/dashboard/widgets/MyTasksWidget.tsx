import { useTasksQuery } from "api/tasks";
import TaskBadge from "components/tasks/TaskBadge";
import TaskStatusFormatter from "components/tasks/TaskStatusFormatter";
import Loading from "components/ui/Loading";
import NativeTable from "components/ui/tables/NativeTable";
import { AuthContext } from "contexts/AuthContext";
import { useContext } from "react";
import DashboardWidget from "./Widget";

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

const MyTasksWidget = () => {
    const { user } = useContext(AuthContext);
    const { data: tasks, isLoading, isError, error } = useTasksQuery({ assignedToUid: user.id, limit: 5, projectIsArchived: 0 });

    if (isLoading) return <Loading />;
    if (isError) return <p className="has-text-danger">Error loading tasks: {error.message}</p>;

    return (
        <DashboardWidget title="My tasks">
            <NativeTable rows={tasks} rowId={task => task.id} columns={columns} emptyRowsMessage="You don't have any assigned tasks.">
            </NativeTable>
        </DashboardWidget >
    );
};

export default MyTasksWidget;
