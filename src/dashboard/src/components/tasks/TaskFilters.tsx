import { type ChangeEvent } from "react";
import { useProjectsQuery } from "api/projects";
import { useUsersQuery } from "api/users";
import NativeSelect from "components/forms/NativeSelect";
import { useAuth } from "contexts/AuthContext";
import { TaskPriorityList } from "models/TaskPriority";
import TaskStatuses from "models/TaskStatuses";

const TaskFilters = ({ tableModel, tableModelSetter: setTableModel }: any) => {
    const { user: loggedInUser } = useAuth();
    const { data: projects, isLoading: isLoadingProjects } = useProjectsQuery({ status: "active" });
    const { data: users, isLoading: isLoadingUsers } = useUsersQuery();

    const onFilterChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setTableModel({ ...tableModel, filters: { ...tableModel.filters, [event.target.name]: event.target.value } });
    };

    return (
        <>
            <details>
                <summary>Filters</summary>
                <div className="field is-grouped">
                    <div className="control">
                        <NativeSelect name="projectId" onChange={onFilterChange}>
                            <option value="">Project = (any)</option>
                            {!isLoadingProjects &&
                                projects.data.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        Project = {project.name}
                                    </option>
                                ))}
                        </NativeSelect>
                    </div>
                    <div className="control">
                        <NativeSelect name="priority" onChange={onFilterChange}>
                            <option value="">Priority = (any)</option>
                            {TaskPriorityList.map((priority) => (
                                <option key={`priority_${priority.value}`} value={priority.value}>
                                    Priority = {priority.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                    <div className="control">
                        <NativeSelect name="assigneeId" onChange={onFilterChange}>
                            <option value="">Assignee = (anybody)</option>
                            {!isLoadingUsers &&
                                users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        Assignee = {user.fullName}
                                        {user.id === loggedInUser?.id ? " (You)" : ""}
                                    </option>
                                ))}
                        </NativeSelect>
                    </div>
                    <div className="control">
                        <NativeSelect name="status" onChange={onFilterChange}>
                            <option value="">Status = (any)</option>
                            {TaskStatuses.map((status) => (
                                <option key={`taskstatus_${status.id}`} value={status.id}>
                                    Status = {status.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                </div>
            </details>
        </>
    );
};

export default TaskFilters;
