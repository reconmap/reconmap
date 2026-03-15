import { useDeleteProjectMutation, useProjectQuery } from "api/projects.js";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import NativeTabs from "components/form/NativeTabs";
import Breadcrumb from "components/ui/Breadcrumb";
import DeleteButton from "components/ui/buttons/Delete";
import LinkButton from "components/ui/buttons/Link";
import PrimaryButton from "components/ui/buttons/Primary";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { requestEntityPost } from "utilities/requests.js";
import ProjectDetailsTab from "../DetailsTab";
import ProjectTasks from "../Tasks";

const TemplateDetails = () => {
    const navigate = useNavigate();
    const { templateId } = useParams();
    const { data: template } = useProjectQuery(templateId);
    const deleteProjectMutation = useDeleteProjectMutation();

    const [tabIndex, tabIndexSetter] = useState(0);

    const cloneProject = (templateId) => {
        requestEntityPost(`/projects/${templateId}/clone`)
            .then((resp) => resp.json())
            .then((data) => {
                navigate(`/projects/${data.projectId}/edit`);
            });
    };

    const destroy = (projectId) => {
        deleteProjectMutation.mutate(projectId).then(() => {
            navigate("/projects/templates");
        });
    };

    if (template && !template.is_template) {
        return <Navigate to={`/projects/${template.id}`} />;
    }

    return (
        <>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                    <Link to="/projects/templates">Templates</Link>
                </Breadcrumb>
                {template && (
                    <NativeButtonGroup>
                        <PrimaryButton onClick={() => cloneProject(template.id)}>
                            Create project from template
                        </PrimaryButton>
                        <LinkButton href={`/projects/${template.id}/edit`}>Edit</LinkButton>
                        <DeleteButton onClick={() => destroy(template.id)} />
                    </NativeButtonGroup>
                )}
            </div>
            {!template ? (
                <Loading />
            ) : (
                <article>
                    <Title type="Project template" title={template.name} />

                    <div>
                        <NativeTabs labels={["Details", "Tasks"]} tabIndex={tabIndex} tabIndexSetter={tabIndexSetter} />
                        <div>
                            {0 === tabIndex && (
                                <div>
                                    <ProjectDetailsTab project={template} />
                                </div>
                            )}
                            {1 === tabIndex && (
                                <div>
                                    <ProjectTasks project={template} />
                                </div>
                            )}
                        </div>
                    </div>
                </article>
            )}
        </>
    );
};

export default TemplateDetails;
