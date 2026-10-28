import { useConfirm } from "components/ui/useConfirm";
import { useDeleteProjectMutation } from "api/projects";
import RestrictedComponent from "components/logic/RestrictedComponent";
import DeleteButton from "components/ui/buttons/DeleteButton";
import LinkButton from "components/ui/buttons/LinkButton";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import NativeTable from "components/ui/tables/NativeTable";
import { useNavigate } from "react-router";
import { requestEntityPost } from "utilities/requests";
import ClientLink from "../clients/ClientLink";
import ProjectBadge from "./ProjectBadge";
import TaskProgress from "./TaskProgress";

const ProjectsTable = ({ projects, showClientColumn = true }: any) => {
    const navigate = useNavigate();
    const cloneProject = (ev, projectId) => {
        ev.stopPropagation();

        requestEntityPost(`/projects/${projectId}/clone`)
            .then((resp) => resp.json())
            .then((data) => {
                navigate(`/projects/${data.projectId}/edit`);
            });
    };
    const deleteProjectMutation = useDeleteProjectMutation();
    const { confirm, confirmDialog } = useConfirm();

    const columns = [
        {
            header: "Name",
            cell: (project) => <ProjectBadge project={project} />,
        },
        {
            header: "Client",
            enabled: showClientColumn,
            cell: (project) => (
                <>
                    {project.isTemplate ? (
                        <span title="Not applicable">(n/a)</span>
                    ) : (
                        <ClientLink clientId={project.clientId}>{project.client?.name}</ClientLink>
                    )}
                </>
            ),
        },
        { header: "Description", className: "only-desktop", cell: (project) => project.description },
        {
            header: "Task progress",
            className: "only-desktop",
            cell: (project) => {
                if (project.isTemplate) return <span title="Not applicable">(n/a)</span>;
                if (project.numTasks === 0) return "No tasks";

                return <TaskProgress completed={project.numCompletedTasks} total={project.numTasks} />;
            },
        },
        {
            header: "Category",
            cell: (project) => (project.categoryId !== null ? project.category?.name : "(undefined)"),
        },

        { header: "Status", cell: (project) => (project.archived ? "Archived" : "Active") },
        {
            header: "",
            cell: (project) => (
                <>
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <LinkButton href={`/projects/${project.id}/edit`}>Edit</LinkButton>
                        {project.isTemplate && <PrimaryButton
                            onClick={(ev) => cloneProject(ev, project.id)}
                            key={project.id}
                            title="Clone"
                        >
                            Clone and edit
                        </PrimaryButton>}
                        <DeleteButton display="icon"
                            onClick={async () => {
                                if (await confirm("Are you sure you want to delete this project?")) {
                                    deleteProjectMutation.mutate(project.id);
                                }
                            }}
                        />
                    </RestrictedComponent>
                </>
            ),
        },
    ];

    return (
        <>
            <NativeTable columns={columns} rows={projects} rowId={(project) => project.id}></NativeTable>
            {confirmDialog}
        </>
    );
};

export default ProjectsTable;
