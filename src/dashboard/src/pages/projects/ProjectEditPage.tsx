import { useQueryClient } from "@tanstack/react-query";
import { useProjectQuery } from "api/projects";
import { requestProjectPut } from "api/requests/projects";
import { Link, useNavigate, useParams } from "react-router";
import PageSkeleton from "components/ui/PageSkeleton";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { actionCompletedToast } from "components/ui/toast";
import ProjectForm from "components/projects/ProjectForm";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ProjectEditPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { projectId } = useParams() as any;
    const { data: serverProject, isLoading: isProjectLoading } = useProjectQuery(projectId);
    const [projectEdits, setClientProject] = useState<any>(null);
    const clientProject = projectEdits ?? serverProject;
    const queryClient = useQueryClient();

    const onFormSubmit = async (ev) => {
        ev.preventDefault();

        await requestProjectPut(projectId, clientProject);
        queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
        actionCompletedToast(`The project "${clientProject.name}" has been updated.`);

        navigate(`/projects/${projectId}`);
    };

    if (isProjectLoading || !clientProject) {
        return <PageSkeleton />;
    }

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                    <Link to={`/projects/${serverProject.id}`}>{serverProject.name}</Link>
                </Breadcrumb>
            </div>
            <PageTitleHeader title={t("Edit project")} />

            <ProjectForm
                project={clientProject}
                projectSetter={setClientProject}
                onFormSubmit={onFormSubmit}
            />
        </div>
    );
};

export default ProjectEditPage;
