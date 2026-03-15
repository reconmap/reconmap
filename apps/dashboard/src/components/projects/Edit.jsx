import { useQueryClient } from "@tanstack/react-query";
import { useProjectQuery } from "api/projects.js";
import { requestProjectPut } from "api/requests/projects.js";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import Loading from "../ui/Loading";
import Title from "../ui/Title";
import { actionCompletedToast } from "../ui/toast";
import ProjectForm from "./Form";

const ProjectEdit = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { data: serverProject, isLoading: isProjectLoading } = useProjectQuery(projectId);
    const [clientProject, setClientProject] = useState(null);
    const queryClient = useQueryClient();

    const onFormSubmit = async (ev) => {
        ev.preventDefault();

        await requestProjectPut(projectId, clientProject);
        queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
        actionCompletedToast(`The project "${clientProject.name}" has been updated.`);

        if (clientProject.is_template) {
            navigate(`/projects/templates/${projectId}`);
        } else {
            navigate(`/projects/${projectId}`);
        }
    };

    useEffect(() => {
        setClientProject(serverProject);
    }, [serverProject]);

    if (isProjectLoading || !clientProject) {
        return <Loading />;
    }

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                    <Link to={`/projects/${serverProject.id}`}>{serverProject.name}</Link>
                </Breadcrumb>
            </div>
            <Title title="Project details" />

            <ProjectForm
                isEdit={true}
                project={clientProject}
                projectSetter={setClientProject}
                onFormSubmit={onFormSubmit}
            />
        </div>
    );
};

export default ProjectEdit;
