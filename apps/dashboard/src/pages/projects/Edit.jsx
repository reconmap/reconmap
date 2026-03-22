import { useQueryClient } from "@tanstack/react-query";
import { useProjectQuery } from "api/projects.js";
import { requestProjectPut } from "api/requests/projects.js";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import { actionCompletedToast } from "components/ui/toast";
import ProjectForm from "components/projects/Form";

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

        navigate(`/projects/${projectId}`);
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
