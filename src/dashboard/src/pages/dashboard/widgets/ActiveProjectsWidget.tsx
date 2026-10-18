import { useProjectsQuery } from "api/projects";
import ProjectBadge from "components/projects/ProjectBadge";
import NativeTable from "components/ui/tables/NativeTable";
import DashboardWidget from "./Widget";

const ActiveProjectsWidget = () => {
    const { data: projects, isLoading, isError, error } = useProjectsQuery({ limit: 5, status: "active" });

    if (isError) return <DashboardWidget title="Active projects"><p className="has-text-danger">Error loading projects: {error.message}</p></DashboardWidget>;

    return (
        <DashboardWidget title="Active projects">
            <NativeTable rows={isLoading ? null : projects.data} rowId={(project) => project.id} columns={[
                {
                    header: "Name",
                    cell: (project) => <ProjectBadge key={project.id} project={project} />,
                },
                {
                    header: "Client",
                    cell: (project) => project.client?.name ?? "-",
                },
            ]}>
            </NativeTable>
        </DashboardWidget>
    );
};

export default ActiveProjectsWidget;
