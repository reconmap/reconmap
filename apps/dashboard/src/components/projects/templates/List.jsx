import { useDeleteProjectMutation, useProjectsQuery } from "api/projects.js";
import BadgeOutline from "components/badges/BadgeOutline";
import ProjectBadge from "components/projects/ProjectBadge";
import Breadcrumb from "components/ui/Breadcrumb";
import CreateButton from "components/ui/buttons/Create";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LinkButton from "components/ui/buttons/Link";
import PrimaryButton from "components/ui/buttons/Primary";
import Loading from "components/ui/Loading";
import NoResults from "components/ui/NoResults";
import Title from "components/ui/Title";
import { Link, useNavigate } from "react-router-dom";
import { requestEntityPost } from "utilities/requests.js";

const TemplatesList = () => {
    const navigate = useNavigate();
    const { data: templates, isLoading } = useProjectsQuery({ isTemplate: true });
    const deleteProjectMutation = useDeleteProjectMutation();

    const cloneProject = (ev, templateId) => {
        ev.stopPropagation();

        requestEntityPost(`/projects/${templateId}/clone`)
            .then((resp) => resp.json())
            .then((data) => {
                navigate(`/projects/${data.projectId}/edit`);
            });
    };

    const viewProject = (templateId) => {
        navigate(`/projects/templates/${templateId}`);
    };

    const deleteTemplate = (ev, templateId) => {
        ev.stopPropagation();

        deleteProjectMutation.mutate(templateId);
    };

    const onAddProjectTemplateClick = () => {
        navigate(`/projects/create?isTemplate=true`);
    };

    return (
        <>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                </Breadcrumb>

                <CreateButton onClick={onAddProjectTemplateClick}>Add project template</CreateButton>
            </div>
            <Title title="Project templates" />
            {isLoading ? (
                <Loading />
            ) : (
                <table className="table is-fullwidth">
                    <thead>
                        <tr>
                            <th style={{ width: "190px" }}>Name</th>
                            <th>Description</th>
                            <th style={{ width: "16ch" }}>Number of tasks</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.data.length === 0 ? (
                            <tr>
                                <td colSpan={4}>
                                    <NoResults />
                                </td>
                            </tr>
                        ) : (
                            templates.data.map((template) => (
                                <tr key={template.id} onClick={() => viewProject(template.id)}>
                                    <td>
                                        <ProjectBadge project={template} />
                                    </td>
                                    <td>{template.description}</td>
                                    <td>
                                        <BadgeOutline>{template.num_tasks}</BadgeOutline>
                                    </td>
                                    <td>
                                        <LinkButton href={`/projects/${template.id}/edit`}>Edit</LinkButton>
                                        <PrimaryButton
                                            onClick={(ev) => cloneProject(ev, template.id)}
                                            key={template.id}
                                            title="Clone"
                                        >
                                            Clone and edit
                                        </PrimaryButton>
                                        <DeleteIconButton onClick={(ev) => deleteTemplate(ev, template.id)} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </>
    );
};

export default TemplatesList;
