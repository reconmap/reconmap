import RestrictedComponent from "components/logic/RestrictedComponent";
import TaskTableModel from "components/tasks/TaskTableModel";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { requestEntity } from "utilities/requests";
import TasksTable from "../tasks/TasksTable";
import CreateButton from "../ui/buttons/Create";

const ProjectTasks = ({ project }: any) => {
    const navigate = useNavigate();
    const isTemplate = project.isTemplate === true;

    const [tableModel, setTableModel] = useState<any>(new TaskTableModel(false, false));

    const fetchTasks = useCallback(() => {
        const queryParams = new URLSearchParams();
        queryParams.set("projectId", project.id);
        queryParams.set("orderColumn", tableModel.sortBy.column);
        queryParams.set("orderDirection", tableModel.sortBy.order);
        queryParams.set("isTemplate", String(isTemplate));
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
    }, [project.id, tableModel.filters, tableModel.sortBy.column, tableModel.sortBy.order, isTemplate]);

    const reloadTasks = useCallback(() => {
        setTableModel((tableModel) => ({ ...tableModel, tasks: null }));
        fetchTasks();
    }, [fetchTasks]);

    const onAddTaskClick = (ev) => {
        ev.preventDefault();
        navigate(`/tasks/create?projectId=${project.id}&forTemplate=${project.isTemplate}`);
    };

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

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
                        <CreateButton onClick={onAddTaskClick}>New task</CreateButton>
                    </RestrictedComponent>
                )}
            </h4>

            <TasksTable tableModel={tableModel} showProjectColumn={false} reloadCallback={reloadTasks} />
        </section>
    );
};

export default ProjectTasks;
