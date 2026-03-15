import { useQueryClient } from "@tanstack/react-query";
import { useDeleteTaskMutation } from "api/tasks.js";
import RestrictedComponent from "components/logic/RestrictedComponent";
import ProjectBadge from "components/projects/ProjectBadge";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import ReloadButton from "components/ui/buttons/Reload";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import LinkButton from "../ui/buttons/Link";
import UserLink from "../users/Link";
import TaskBadge from "./TaskBadge";
import TaskStatusFormatter from "./TaskStatusFormatter";

const TasksTable = ({ tableModel, tableModelSetter: setTableModel, destroy, reloadCallback = null }) => {
    const showSelection = tableModel.columnsVisibility.selection;
    const showProjectColumn = tableModel.columnsVisibility.project;
    const deleteTaskMutation = useDeleteTaskMutation();
    const queryClient = useQueryClient();

    const onSelectionChange = (ev) => {
        const target = ev.target;
        const selectionId = parseInt(target.value);
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

    const onDelete = (taskId) => {
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
            cell: (task) => task.priority,
        },
        {
            header: "Assignee",
            cell: (task) => (
                <>
                    {task.assignedToUid ? (
                        <UserLink userId={task.assignedToUid}>{task.assignedTo?.fullName}</UserLink>
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
            header: () => (reloadCallback ? <ReloadButton onClick={reloadCallback} /> : ""),
            cell: (task) => (
                <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                    <LinkButton href={`/tasks/${task.id}/edit`}>Edit</LinkButton>
                    <DeleteIconButton onClick={() => onDelete(task.id)} />
                </RestrictedComponent>
            ),
        },
    ];

    return <NativeTable columns={columns} rows={tableModel.tasks} rowId={(task) => task.id}></NativeTable>;
};

export default TasksTable;
