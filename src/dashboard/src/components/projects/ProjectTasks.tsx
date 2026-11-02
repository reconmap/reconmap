import RestrictedComponent from "components/logic/RestrictedComponent";
import TaskTableModel from "components/tasks/TaskTableModel";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router";
import { ignoreAbortError } from "utilities/abort";
import { requestEntity } from "utilities/requests";
import TasksTable from "../tasks/TasksTable";
import TaskProgress from "./TaskProgress";
import CreateButton from "../ui/buttons/CreateButton";
import TabToolbar from "../ui/TabToolbar";

const ProjectTasks = ({ project }: any) => {
    const navigate = useNavigate();
    const isTemplate = project.isTemplate === true;

    const [tableModel, setTableModel] = useState<any>(new TaskTableModel(false, false));

    const fetchTasks = useCallback((signal?: AbortSignal) => {
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

        requestEntity(url, { signal })
            .then((resp) => {
                return resp.json();
            })
            .then((data) => {
                setTableModel((tableModel) => ({ ...tableModel, tasks: data }));
            })
            .catch(ignoreAbortError);
    }, [project.id, tableModel.filters, tableModel.sortBy.column, tableModel.sortBy.order, isTemplate]);

    const reloadTasks = useCallback(() => {
        setTableModel((tableModel) => ({ ...tableModel, tasks: null }));
        fetchTasks();
    }, [fetchTasks]);

    const onAddTaskClick = (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        navigate(`/tasks/create?projectId=${project.id}&forTemplate=${project.isTemplate}`);
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchTasks(controller.signal);
        return () => controller.abort();
    }, [fetchTasks]);

    return (
        <section>
            <TabToolbar
                start={
                    !isTemplate &&
                    tableModel.tasks &&
                    tableModel.tasks.length > 0 && (
                        <TaskProgress
                            completed={tableModel.tasks.filter((task) => task.status === "done").length}
                            total={tableModel.tasks.length}
                        />
                    )
                }
                end={
                    !project.archived && (
                        <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                            <CreateButton onClick={onAddTaskClick}>New task</CreateButton>
                        </RestrictedComponent>
                    )
                }
            />

            <TasksTable tableModel={tableModel} showProjectColumn={false} reloadCallback={reloadTasks} />
        </section>
    );
};

export default ProjectTasks;
