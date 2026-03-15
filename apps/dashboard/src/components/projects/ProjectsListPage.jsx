import { useProjectsQuery } from "api/projects.js";
import NativeSelect from "components/form/NativeSelect";
import PaginationV2 from "components/layout/PaginationV2";
import RestrictedComponent from "components/logic/RestrictedComponent";
import Loading from "components/ui/Loading.jsx";
import Title from "components/ui/Title";
import useDocumentTitle from "hooks/useDocumentTitle";
import useQuery from "hooks/useQuery";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb.jsx";
import CreateButton from "../ui/buttons/Create.jsx";
import ProjectsTable from "./Table.jsx";

const ProjectsListPage = () => {
    const navigate = useNavigate();
    const query = useQuery();
    let pageNumber = query.get("page");
    pageNumber = pageNumber !== null ? parseInt(pageNumber) : 1;
    const apiPageNumber = pageNumber - 1;

    const [statusFilter, setStatusFilter] = useState("active");
    const { data: projects, isLoading } = useProjectsQuery({ isTemplate: false, limit: 10, status: statusFilter, page: apiPageNumber });

    const handleCreateProject = () => {
        navigate("/projects/create");
    };

    const onStatusFilterChange = (ev) => {
        setStatusFilter(ev.target.value);
    };

    const onPageChange = (pageNumber) => {
        const queryParams = new URLSearchParams();
        queryParams.set("page", pageNumber + 1);
        const url = `/projects?${queryParams.toString()}`;
        navigate(url);
    };

    useDocumentTitle("Projects");

    if (isLoading) return <Loading />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb />
                <PaginationV2 page={apiPageNumber} total={projects.pageCount} onPageChange={onPageChange} />

                <div>
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <CreateButton onClick={handleCreateProject}>Create project</CreateButton>
                    </RestrictedComponent>
                </div>
            </div>
            <Title title={`Projects (${projects.totalCount})`} />

            <details>
                <summary>Filters</summary>

                <div className="control">
                    <NativeSelect onChange={onStatusFilterChange} defaultValue="active">
                        <option value="">Status = (any)</option>
                        <option value="active">Status = Active</option>
                        <option value="archived">Status = Archived</option>
                    </NativeSelect>
                </div>
            </details>

            <ProjectsTable projects={projects.data} />
        </div>
    );
};

export default ProjectsListPage;
