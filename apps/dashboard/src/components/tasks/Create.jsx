import { requestTaskPost } from "api/requests/tasks.js";
import { actionCompletedToast } from "components/ui/toast";
import { errorToast } from "components/ui/toast.jsx";
import useQuery from "hooks/useQuery";
import Task from "models/Task";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import Title from "../ui/Title";
import TaskForm from "./TaskForm";

const TaskCreationPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const query = useQuery();
    const defaultProjectId = "";
    const projectIdParam = useRef(query.get("projectId") || defaultProjectId);
    const forTemplate = parseInt(query.get("forTemplate")) === 1;

    const [newTask, setNewTask] = useState({ ...Task, projectId: projectIdParam.current });

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
                actionCompletedToast(`The task '${newTask.summary}' has been created.`);
            })
            .catch((error) => {
                console.error("Error creating task:", error);
                errorToast("Failed to create task. Please try again.");
            });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/tasks">{t("Tasks")}</Link>
                </Breadcrumb>
            </div>

            <Title title="New task details" />

            <TaskForm onFormSubmit={onFormSubmit} task={newTask} forTemplate={forTemplate} taskSetter={setNewTask} />
        </div>
    );
};

export default TaskCreationPage;
