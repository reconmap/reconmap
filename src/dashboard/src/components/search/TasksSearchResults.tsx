import { requestTasks } from "api/requests/tasks";
import TaskTableModel from "components/tasks/TaskTableModel";
import { useEffect, useState } from "react";
import { ignoreAbortError } from "utilities/abort";
import TasksTable from "../tasks/TasksTable";

const TasksSearchResults = ({ keywords, emptyResultsSetter: setEmptyResults }: any) => {
    const [tableModel, setTableModel] = useState(new TaskTableModel());

    useEffect(() => {
        const controller = new AbortController();

        const reloadData = () => {
            requestTasks({ keywords }, { signal: controller.signal })
                .then((resp) => resp.json())
                .then((tasks) => {
                    setTableModel((tableModel) => ({ ...tableModel, tasks: tasks }));
                    setEmptyResults((emptyResults) =>
                        0 === tasks.length
                            ? emptyResults.concat("tasks")
                            : emptyResults.filter((value) => value !== "tasks"),
                    );
                })
                .catch(ignoreAbortError);
        };

        reloadData();

        return () => controller.abort();
    }, [keywords, setEmptyResults]);

    if (tableModel.tasks.length === 0) return <></>;

    return (
        <>
            <h3>{tableModel.tasks.length} matching tasks</h3>
            <TasksTable tableModel={tableModel} />
        </>
    );
};

export default TasksSearchResults;
