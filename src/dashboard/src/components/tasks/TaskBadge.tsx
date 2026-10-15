import { Link } from "react-router";
import "./TaskBadge.css";

const TaskBadge = ({ task }: any) => {
    return (
        <Link className="task-badge" to={"/tasks/" + task.id}>
            {task.summary}
        </Link>
    );
};

export default TaskBadge;
