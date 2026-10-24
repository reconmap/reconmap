import { useQueryClient } from "@tanstack/react-query";
import { requestTaskPatch } from "api/requests/tasks";
import { useTaskQuery } from "api/tasks";
import { actionCompletedToast } from "components/ui/toast";
import { t } from "i18next";
import { Link, useNavigate, useParams } from "react-router";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import PageTitleHeader from "components/ui/PageTitleHeader";
import TaskForm from "components/tasks/TaskForm";
import { useState } from "react";

const EditTaskPage = () => {
    const navigate = useNavigate();
    const { taskId } = useParams() as any;
    const queryClient = useQueryClient();

    const { data: serverTask } = useTaskQuery(taskId);
    const [taskEdits, setClientTask] = useState<any>(null);
    const clientTask = taskEdits ?? serverTask;

    const onFormSubmit = async (ev) => {
        ev.preventDefault();

        await requestTaskPatch(taskId, clientTask);
        actionCompletedToast(`The task "${clientTask.summary}" has been updated.`);
        queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
        navigate(`/tasks/${taskId}`);
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/tasks">{t("Tasks")}</Link>
                </Breadcrumb>
            </div>

            <PageTitleHeader title={t("Edit task")} />

            {!clientTask ? (
                <Loading />
            ) : (
                <TaskForm
                    forTemplate={clientTask.project_is_template === 1}
                    onFormSubmit={onFormSubmit}
                    task={clientTask}
                    taskSetter={setClientTask}
                />
            )}
        </div>
    );
};

export default EditTaskPage;
