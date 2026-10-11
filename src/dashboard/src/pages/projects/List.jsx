import { useProjectsQuery } from "api/projects.js";
import NativeSelect from "components/forms/NativeSelect";
import PaginationV2 from "components/layout/PaginationV2";
import RestrictedComponent from "components/logic/RestrictedComponent";
import Loading from "components/ui/Loading.jsx";
import Title from "components/ui/Title";
import useDocumentTitle from "hooks/useDocumentTitle";
import useQuery from "hooks/useQuery";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "components/ui/Breadcrumb.jsx";
import CreateButton from "components/ui/buttons/Create.jsx";
import ProjectsTable from "components/projects/Table.jsx";

const ProjectsListPage = () => {
    const navigate = useNavigate();
    const query = useQuery();
    let pageNumber = query.get("page");
    pageNumber = pageNumber !== null ? parseInt(pageNumber) : 1;
    const apiPageNumber = pageNumber - 1;

    const [statusFilter, setStatusFilter] = useState(query.get("status") ?? "active");
    const [isTemplateFilter, setIsTemplateFilter] = useState(query.get("isTemplate") ?? "false");

    const projectsParams = { limit: 10, status: statusFilter, page: apiPageNumber };
    if (isTemplateFilter !== "") {
        projectsParams.isTemplate = isTemplateFilter === "true";
    }

    const { data: projects, isLoading } = useProjectsQuery(projectsParams);

    const updateUrl = (newParams) => {
        const queryParams = new URLSearchParams();
        const status = newParams.hasOwnProperty("status") ? newParams.status : statusFilter;
        const isTemplate = newParams.hasOwnProperty("isTemplate") ? newParams.isTemplate : isTemplateFilter;
        const page = newParams.hasOwnProperty("page") ? newParams.page : pageNumber;

        if (status) queryParams.set("status", status);
        if (isTemplate) queryParams.set("isTemplate", isTemplate);
        if (page > 1) queryParams.set("page", page);

        const url = `/projects?${queryParams.toString()}`;
        navigate(url);
    };

    const handleCreateProject = () => {
        navigate("/projects/create");
    };

    const onStatusFilterChange = (ev) => {
        const newValue = ev.target.value;
        setStatusFilter(newValue);
        updateUrl({ status: newValue, page: 1 });
    };

    const onIsTemplateFilterChange = (ev) => {
        const newValue = ev.target.value;
        setIsTemplateFilter(newValue);
        updateUrl({ isTemplate: newValue, page: 1 });
    };

    const onPageChange = (pageNumber) => {
        updateUrl({ page: pageNumber + 1 });
    };

    useEffect(() => {
        setStatusFilter(query.get("status") ?? "active");
        setIsTemplateFilter(query.get("isTemplate") ?? "false");
    }, [query]);

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

                <div className="field is-grouped">
                    <div className="control">
                        <NativeSelect onChange={onStatusFilterChange} value={statusFilter}>
                            <option value="">Status = (any)</option>
                            <option value="active">Status = Active</option>
                            <option value="archived">Status = Archived</option>
                        </NativeSelect>
                    </div>

                    <div className="control">
                        <NativeSelect onChange={onIsTemplateFilterChange} value={isTemplateFilter}>
                            <option value="">Is template = (any)</option>
                            <option value="true">Is template = Yes</option>
                            <option value="false">Is template = No</option>
                        </NativeSelect>
                    </div>
                </div>
            </details>

            <ProjectsTable projects={projects.data} />
        </div>
    );
};

export default ProjectsListPage;
