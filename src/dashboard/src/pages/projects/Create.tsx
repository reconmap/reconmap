import { useQueryClient } from "@tanstack/react-query";
import { requestProjectPost } from "api/requests/projects";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import { StatusCodes } from "http-status-codes";
import Project from "models/Project";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import ProjectForm from "components/projects/Form";

const ProjectCreate = () => {
    const navigate = useNavigate();
    const [query] = useSearchParams();
    const isTemplate = "true" === query.get("isTemplate");
    const [newProject, setNewProject] = useState({ ...Project, isTemplate: isTemplate });
    const queryClient = useQueryClient();

    const handleCreate = async (ev) => {
        ev.preventDefault();

        requestProjectPost(newProject).then((resp) => {
            if (resp.status !== StatusCodes.CREATED) {
                errorToast("There was a problem creating the project. Please check the form and try again");
                return;
            }

            queryClient.invalidateQueries({ queryKey: ["projects"] });
            actionCompletedToast(`The project '${newProject.name}' has been created`);

            navigate("/projects");
        });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                </Breadcrumb>
            </div>
            <PageTitleHeader title="New project details" />

            <ProjectForm project={newProject} projectSetter={setNewProject} onFormSubmit={handleCreate} />
        </div>
    );
};

export default ProjectCreate;
