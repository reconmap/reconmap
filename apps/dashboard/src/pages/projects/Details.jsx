import { useDeleteProjectMutation, useProjectQueriesInvalidation, useProjectQuery } from "api/projects.js";
import { requestProjectPatch } from "api/requests/projects.js";
import NativeButton from "components/forms/NativeButton";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import NativeTabs from "components/forms/NativeTabs";
import RestrictedComponent from "components/logic/RestrictedComponent";
import Breadcrumb from "components/ui/Breadcrumb.jsx";
import DeleteButton from "components/ui/buttons/Delete.jsx";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import { actionCompletedToast } from "components/ui/toast";
import { t } from "i18next";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LinkButton from "components/ui/buttons/Link";
import SecondaryButton from "components/ui/buttons/Secondary";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import ProjectAttachmentsTab from "components/projects/AttachmentsTab";
import ProjectDetailsTab from "components/projects/DetailsTab";
import ProjectNotesTab from "components/projects/NotesTab";
import ProjectAssets from "components/projects/Assets";
import ProjectTasks from "components/projects/Tasks";
import ProjectVaultTab from "components/projects/vault/VaultTab";
import ProjectVulnerabilities from "components/projects/Vulnerabilities";
import ReportRevisions from "components/reports/Revisions";

const ProjectDetails = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();

    const { data: project } = useProjectQuery(projectId);
    const projectQueriesInvalidation = useProjectQueriesInvalidation();
    const deleteProjectMutation = useDeleteProjectMutation();

    const [tabIndex, tabIndexSetter] = useState(0);

    const cloneProject = (templateId) => {
        requestEntityPost(`/projects/${templateId}/clone`)
            .then((resp) => resp.json())
            .then((data) => {
                navigate(`/projects/${data.projectId}/edit`);
            });
    };

    const onDeleteClick = (id) => {
        deleteProjectMutation.mutate(id, {
            onSuccess: () => {
                projectQueriesInvalidation();
                navigate("/projects");
                actionCompletedToast("The project has been deleted.");
            },
            onError: (err) => {
                errorToast("An error occurred while deleting the project.");
                console.error(err);
            },
        });
    }



    const handleManageTeam = () => {
        navigate(`/projects/${project.id}/membership`);
    };

    const onArchiveButtonClick = (project) => {
        requestProjectPatch(project.id, { archived: !project.archived })
            .then(() => {
                actionCompletedToast("The project has been updated.");
                projectQueriesInvalidation();
            })
            .catch((err) => console.error(err));
    };

    return (
        <>
            <div className="heading">
                {project && (
                    <>
                        <Breadcrumb>
                            <Link to="/projects">Projects</Link>
                            <Link to={`/projects/${project.id}`}>{project.name}</Link>
                        </Breadcrumb>

                        <NativeButtonGroup>
                            <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                                {!project.archived && (
                                    <>
                                        <LinkButton href={`/projects/${project.id}/edit`}>Edit</LinkButton>

                                        <SecondaryButton onClick={handleManageTeam}>Membership</SecondaryButton>
                                    </>
                                )}

                                {project.isTemplate && <PrimaryButton onClick={() => cloneProject(project.id)}>
                                    Create project from template
                                </PrimaryButton>}

                                <NativeButton onClick={() => onArchiveButtonClick(project)}>
                                    {project.archived ? "Unarchive" : "Archive"}
                                </NativeButton>
                                <DeleteButton onClick={() => onDeleteClick(project.id)}>
                                    Delete
                                </DeleteButton>
                            </RestrictedComponent>
                        </NativeButtonGroup>
                    </>
                )}
            </div>
            {!project ? (
                <Loading />
            ) : (
                <>
                    <Title type="Project" title={project.name} />

                    <NativeTabs
                        labels={[
                            t("Details"),
                            t("Tasks"),
                            t("Assets"),
                            t("Vulnerabilities"),
                            t("Comments"),
                            t("Attachments"),
                            t("Vault"),
                            t("Reports"),
                        ]}
                        tabIndex={tabIndex}
                        tabIndexSetter={tabIndexSetter}
                    />

                    <div>
                        {0 === tabIndex && (
                            <div>
                                <ProjectDetailsTab project={project} />
                            </div>
                        )}
                        {1 === tabIndex && (
                            <div>
                                <ProjectTasks project={project} />
                            </div>
                        )}
                        {2 === tabIndex && (
                            <div>
                                <ProjectAssets project={project} />
                            </div>
                        )}
                        {3 === tabIndex && (
                            <div>
                                <ProjectVulnerabilities project={project} />
                            </div>
                        )}
                        {4 === tabIndex && (
                            <div>
                                <ProjectNotesTab project={project} />
                            </div>
                        )}
                        {5 === tabIndex && (
                            <div>
                                <ProjectAttachmentsTab project={project} />
                            </div>
                        )}
                        {6 === tabIndex && (
                            <div>
                                <ProjectVaultTab project={project} />
                            </div>
                        )}
                        {7 === tabIndex && (
                            <div>
                                <ReportRevisions projectId={project.id} />
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default ProjectDetails;
