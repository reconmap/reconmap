import { useQueryClient } from "@tanstack/react-query";
import { requestTaskPatch } from "api/requests/tasks";
import { useTaskQuery } from "api/tasks";
import { toast } from "components/ui/toast";
import { t } from "i18next";
import { Link, useNavigate, useParams } from "react-router";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import PageTitleHeader from "components/ui/PageTitleHeader";
import TaskForm from "components/tasks/TaskForm";
import { useState, type FormEvent } from "react";

const TaskEditPage = () => {
    const navigate = useNavigate();
    const { taskId } = useParams() as any;
    const queryClient = useQueryClient();

    const { data: serverTask } = useTaskQuery(taskId);
    const [taskEdits, setClientTask] = useState<any>(null);
    const clientTask = taskEdits ?? serverTask;

    const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await requestTaskPatch(taskId, clientTask);
        toast.success(`The task "${clientTask.summary}" has been updated.`);
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

export default TaskEditPage;
