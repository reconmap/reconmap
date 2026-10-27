import { useQueryClient } from "@tanstack/react-query";
import { requestTasksDelete, requestTasksPatch } from "api/requests/tasks";
import NativeSelect from "components/forms/NativeSelect";
import RestrictedComponent from "components/logic/RestrictedComponent";
import DeleteButton from "components/ui/buttons/DeleteButton";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { toast } from "components/ui/toast";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { ignoreAbortError } from "utilities/abort";
import { requestEntity } from "utilities/requests";
import TaskStatuses from "models/TaskStatuses";
import Breadcrumb from "components/ui/Breadcrumb";
import CreateButton from "components/ui/buttons/CreateButton";
import TaskFilters from "components/tasks/TaskFilters";
import TasksTable from "components/tasks/TasksTable";
import TaskTableModel from "components/tasks/TaskTableModel";

const TasksListPage = () => {
    const [t] = useTranslation();

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [tableModel, setTableModel] = useState(new TaskTableModel(true, true));

    const handleCreateTask = () => {
        navigate(`/tasks/create`);
    };

    const fetchTasks = useCallback((signal?: AbortSignal) => {
        const queryParams = new URLSearchParams();
        queryParams.set("orderColumn", tableModel.sortBy.column);
        queryParams.set("orderDirection", tableModel.sortBy.order);
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
    }, [tableModel.filters, tableModel.sortBy.column, tableModel.sortBy.order]);

    const reloadTasks = useCallback(() => {
        setTableModel((tableModel) => ({ ...tableModel, tasks: null }));
        fetchTasks();
    }, [fetchTasks]);

    const onStatusSelectChange = (ev) => {
        const newStatus = ev.target.value;

        requestTasksPatch({
            ids: tableModel.selection,
            newStatus: newStatus,
        })
            .then(reloadTasks)
            .then(() => {
                toast.success(`All selected tasks have been transitioned to "${newStatus}".`);
                ev.target.value = "";
            })
            .catch((err) => console.error(err));
    };

    const onDeleteButtonClick = () => {
        requestTasksDelete({ ids: tableModel.selection })
            .then(() => {
                reloadTasks();
                setTableModel({ ...tableModel, selection: [] });
                toast.success("All selected tasks were deleted.");
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchTasks(controller.signal);
        return () => controller.abort();
    }, [fetchTasks]);

    return (
        <>
            <div className="heading">
                <Breadcrumb />
                <div className="field is-grouped">
                    <CreateButton onClick={handleCreateTask}>New task</CreateButton>
                    <div className="control">
                        <NativeSelect disabled={!tableModel.selection.length} onChange={onStatusSelectChange}>
                            <option value="">(bulk status change)</option>
                            {TaskStatuses.map((status, index) => (
                                <option key={index} value={status.id}>
                                    {t("Status")} &rarr; {status.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                    <RestrictedComponent roles={["administrator"]}>
                        <DeleteButton onClick={onDeleteButtonClick} disabled={!tableModel.selection.length}>
                            Delete selected
                        </DeleteButton>
                    </RestrictedComponent>
                </div>
            </div>
            <PageTitleHeader title={t("Tasks")} />

            <div>
                <TaskFilters tableModel={tableModel} tableModelSetter={setTableModel} />
            </div>

            <TasksTable tableModel={tableModel} tableModelSetter={setTableModel} reloadCallback={reloadTasks} />
        </>
    );
};

export default TasksListPage;
