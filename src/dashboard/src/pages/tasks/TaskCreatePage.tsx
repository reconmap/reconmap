import { requestTaskPost } from "api/requests/tasks";
import { toast } from "components/ui/toast";
import Task from "models/Task";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import TaskForm from "components/tasks/TaskForm";

const TaskCreatePage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [query] = useSearchParams();
    const defaultProjectId = "";
    const projectIdParam = query.get("projectId") || defaultProjectId;
    const forTemplate = parseInt(query.get("forTemplate")!) === 1;

    const [newTask, setNewTask] = useState({ ...Task, projectId: projectIdParam });

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        requestTaskPost(newTask)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(() => {
                navigate(`/projects/${newTask.projectId}`);
                toast.success(`The task '${newTask.summary}' has been created.`);
            })
            .catch((error) => {
                console.error("Error creating task:", error);
                toast.error("Failed to create task. Please try again.");
            });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/tasks">{t("Tasks")}</Link>
                </Breadcrumb>
            </div>

            <PageTitleHeader title={t("New task")} />

            <TaskForm onFormSubmit={onFormSubmit} task={newTask} forTemplate={forTemplate} taskSetter={setNewTask} />
        </div>
    );
};

export default TaskCreatePage;
