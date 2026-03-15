import { useDeleteProjectMutation } from "api/projects.js";
import RestrictedComponent from "components/logic/RestrictedComponent";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LinkButton from "components/ui/buttons/Link";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import ClientLink from "../clients/Link";
import ProjectBadge from "./ProjectBadge";

const ProjectsTable = ({ projects, showClientColumn = true }) => {
    const deleteProjectMutation = useDeleteProjectMutation();

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
            header: "Category",
            cell: (project) => (project.categoryId !== null ? project.category?.name : "(undefined)"),
        },
        {
            header: "Vulnerability metrics",
            cell: (project) => (project.vulnerabilityMetrics ? project.vulnerabilityMetrics : "(undefined)"),
        },
        { header: "Status", cell: (project) => (project.archived ? "Archived" : "Active") },
        {
            header: "",
            cell: (project) => (
                <>
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <LinkButton href={`/projects/${project.id}/edit`}>Edit</LinkButton>
                        <DeleteIconButton onClick={() => deleteProjectMutation.mutate(project.id)} />
                    </RestrictedComponent>
                </>
            ),
        },
    ];

    return <NativeTable columns={columns} rows={projects} rowId={(project) => project.id}></NativeTable>;
};

export default ProjectsTable;
