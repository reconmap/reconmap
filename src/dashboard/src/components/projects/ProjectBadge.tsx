import { Link } from "react-router";
import "./ProjectBadge.css";

const ProjectBadge = ({ project }: any) => {
    return (
        <Link to={`/projects/${project.id}`} className="project-badge">
            {project.name}
        </Link>
    );
};

export default ProjectBadge;
