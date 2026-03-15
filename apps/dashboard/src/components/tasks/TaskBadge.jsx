import { Link } from "react-router-dom";
import "./TaskBadge.css";

const TaskBadge = ({ task }) => {
    return (
        <Link className="task-badge" to={"/tasks/" + task.id}>
            {task.summary}
        </Link>
    );
};

export default TaskBadge;
