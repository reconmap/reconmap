import { requestEntityPost } from "utilities/requests";
import { useDeleteProjectMutation, useProjectQueriesInvalidation, useProjectQuery } from "api/projects";
import { requestProjectPatch } from "api/requests/projects";
import NativeButton from "components/forms/NativeButton";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import NativeTabs from "components/forms/NativeTabs";
import RestrictedComponent from "components/logic/RestrictedComponent";
import Breadcrumb from "components/ui/Breadcrumb";
import DeleteButton from "components/ui/buttons/DeleteButton";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import { toast } from "components/ui/toast";
import { t } from "i18next";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import LinkButton from "components/ui/buttons/LinkButton";
import SecondaryButton from "components/ui/buttons/SecondaryButton";
import Loading from "components/ui/Loading";
import PageTitleHeader from "components/ui/PageTitleHeader";
import ProjectAttachmentsTab from "components/projects/ProjectAttachmentsTab";
import ProjectDetailsTab from "components/projects/ProjectDetailsTab";
import CommentsPanel from "components/comments/CommentsPanel";
import ProjectAssets from "components/projects/ProjectAssets";
import ProjectTasks from "components/projects/ProjectTasks";
import ProjectVaultTab from "components/projects/vault/ProjectVaultTab";
import ProjectVulnerabilities from "components/projects/ProjectVulnerabilities";
import ReportRevisions from "components/reports/ReportRevisions";

const ProjectDetailsPage = () => {
    const navigate = useNavigate();
    const { projectId } = useParams() as any;

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
                toast.success("The project has been deleted.");
            },
            onError: (err) => {
                toast.error("An error occurred while deleting the project.");
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
                toast.success("The project has been updated.");
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
                    <PageTitleHeader title={project.name} subHeader={t("Project")} />

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
                                <CommentsPanel parentType="project" parentId={project.id} />
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

export default ProjectDetailsPage;
