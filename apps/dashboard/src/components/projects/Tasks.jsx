import RestrictedComponent from "components/logic/RestrictedComponent";
import TaskTableModel from "components/tasks/TaskTableModel";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestEntity } from "utilities/requests.js";
import TasksTable from "../tasks/TasksTable";
import CreateButton from "../ui/buttons/Create";

const ProjectTasks = ({ project }) => {
    const navigate = useNavigate();
    const isTemplate = project.is_template === 1;

    const [tableModel, setTableModel] = useState(new TaskTableModel(false, false));

    const reloadTasks = useCallback(() => {
        setTableModel((tableModel) => ({ ...tableModel, tasks: null }));

        const queryParams = new URLSearchParams();
        queryParams.set("projectId", project.id);
        queryParams.set("orderColumn", tableModel.sortBy.column);
        queryParams.set("orderDirection", tableModel.sortBy.order);
        queryParams.set("isTemplate", isTemplate);
        Object.keys(tableModel.filters).forEach(
            (key) =>
                tableModel.filters[key] !== null &&
                tableModel.filters[key].length !== 0 &&
                queryParams.append(key, tableModel.filters[key]),
        );
        const url = `/tasks?${queryParams.toString()}`;

        requestEntity(url)
            .then((resp) => {
                return resp.json();
            })
            .then((data) => {
                setTableModel((tableModel) => ({ ...tableModel, tasks: data }));
            });
    }, [setTableModel, project.id, tableModel.filters, tableModel.sortBy.column, tableModel.sortBy.order, isTemplate]);

    const onAddTaskClick = (ev) => {
        ev.preventDefault();
        navigate(`/tasks/create?projectId=${project.id}&forTemplate=${project.is_template}`);
    };

    useEffect(() => {
        reloadTasks();
    }, [reloadTasks, tableModel.filters]);

    return (
        <section>
            <h4>
                Tasks{" "}
                {!isTemplate && (
                    <>
                        &nbsp;
                        <small>
                            (
                            {tableModel.tasks &&
                                tableModel.tasks.reduce((total, task) => {
                                    return task.status === "done" ? total + 1 : total;
                                }, 0)}
                            /{tableModel.tasks && tableModel.tasks.length} completed)
                        </small>
                    </>
                )}
                {!project.archived && (
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <CreateButton onClick={onAddTaskClick}>Add task</CreateButton>
                    </RestrictedComponent>
                )}
            </h4>

            <TasksTable tableModel={tableModel} showProjectColumn={false} reloadCallback={reloadTasks} />
        </section>
    );
};

export default ProjectTasks;
