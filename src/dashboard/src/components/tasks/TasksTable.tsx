import { useConfirm } from "components/ui/useConfirm";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteTaskMutation } from "api/tasks";
import RestrictedComponent from "components/logic/RestrictedComponent";
import ProjectBadge from "components/projects/ProjectBadge";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import ReloadButton from "components/ui/buttons/ReloadButton";
import NativeTable from "components/ui/tables/NativeTable";
import LinkButton from "../ui/buttons/LinkButton";
import UserLink from "../users/UserLink";
import TaskBadge from "./TaskBadge";
import TaskPriorityFormatter from "./TaskPriorityFormatter";
import TaskStatusFormatter from "./TaskStatusFormatter";

const TasksTable = ({ tableModel, tableModelSetter: setTableModel, reloadCallback = null }: any) => {
    const showSelection = tableModel.columnsVisibility.selection;
    const showProjectColumn = tableModel.columnsVisibility.project;
    const deleteTaskMutation = useDeleteTaskMutation();
    const { confirm, confirmDialog } = useConfirm();
    const queryClient = useQueryClient();

    const onSelectionChange = (ev) => {
        const target = ev.target;
        const selectionId = target.value;
        if (target.checked) {
            setTableModel({
                ...tableModel,
                selection: [...tableModel.selection, selectionId],
            });
        } else {
            setTableModel({
                ...tableModel,
                selection: tableModel.selection.filter((value) => value !== selectionId),
            });
        }
    };

    const onDelete = async (taskId) => {
        if (!(await confirm("Are you sure you want to delete this task?"))) return;
        deleteTaskMutation.mutate(taskId);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    const columns = [
        {
            header: <>&nbsp;</>,
            enabled: showSelection,
            cell: (task) => (
                <input
                    type="checkbox"
                    value={task.id}
                    onChange={onSelectionChange}
                    checked={tableModel.selection.includes(task.id)}
                />
            ),
            style: { width: "32px" },
        },
        {
            header: "Summary",
            cell: (task) => <TaskBadge task={task} />,
        },
        {
            header: "Project",
            enabled: showProjectColumn,
            cell: (task) => (
                <ProjectBadge
                    project={{
                        id: task.project_id,
                        name: task.project_name,
                    }}
                />
            ),
        },
        {
            header: "Priority",
            cell: (task) => <TaskPriorityFormatter task={task} />,
        },
        {
            header: "Assignee",
            cell: (task) => (
                <>
                    {task.assignedToId ? (
                        <UserLink userId={task.assignedToId}>{task.assignedTo?.fullName}</UserLink>
                    ) : (
                        "(nobody)"
                    )}
                </>
            ),
        },
        {
            header: "Status",
            cell: (task) => <TaskStatusFormatter task={task} />,
            style: { width: "100px" },
        },
        {
            style: { width: "15%", textAlign: "right" },
            header: reloadCallback ? <ReloadButton onClick={reloadCallback} /> : "",
            cell: (task) => (
                <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                    <LinkButton href={`/tasks/${task.id}/edit`}>Edit</LinkButton>
                    <DeleteIconButton onClick={() => onDelete(task.id)} />
                </RestrictedComponent>
            ),
        },
    ];

    return (
        <>
            <NativeTable columns={columns} rows={tableModel.tasks} rowId={(task) => task.id}></NativeTable>
            {confirmDialog}
        </>
    );
};

export default TasksTable;
