import { useProjectsQuery } from "api/projects.js";
import ProjectBadge from "components/projects/ProjectBadge";
import Loading from "components/ui/Loading";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import DashboardWidget from "./Widget";

const ActiveProjectsWidget = () => {
    const { data: projects, isLoading, isError, error } = useProjectsQuery({ limit: 5, status: "active" });

    if (isLoading) return <Loading />;

    if (isError) return <p>Error loading projects: {error.message}</p>;

    return (
        <DashboardWidget title="Active projects">
            <NativeTable rows={projects.data} rowId={(project) => project.id} columns={[
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
