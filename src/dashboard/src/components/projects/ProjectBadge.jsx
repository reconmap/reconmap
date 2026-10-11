import { Link } from "react-router-dom";
import "./ProjectBadge.css";

const ProjectBadge = ({ project }) => {
    return (
        <Link to={`/projects/${project.id}`} className="project-badge">
            {project.name}
        </Link>
    );
};

export default ProjectBadge;
