import "./TaskStatusFormatter.css";

const TaskStatusFormatter = ({ task }) => {
    return (
        <span className={"task-status-formatter " + (task.status === "done" ? "task-status-formatter-done" : "")}>
            {task.status}
        </span>
    );
};

export default TaskStatusFormatter;
