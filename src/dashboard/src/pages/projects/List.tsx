import { useProjectsQuery } from "api/projects";
import NativeSelect from "components/forms/NativeSelect";
import PaginationV2 from "components/layout/PaginationV2";
import RestrictedComponent from "components/logic/RestrictedComponent";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useNavigate, useSearchParams } from "react-router";
import Breadcrumb from "components/ui/Breadcrumb";
import CreateButton from "components/ui/buttons/Create";
import ProjectsTable from "components/projects/Table";
import { useTranslation } from "react-i18next";

const ProjectsListPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [query] = useSearchParams();
    let pageNumber: any = query.get("page");
    pageNumber = pageNumber !== null ? parseInt(pageNumber) : 1;
    const apiPageNumber = pageNumber - 1;

    // The URL is the source of truth for the filters; changing them navigates.
    const statusFilter = query.get("status") ?? "active";
    const isTemplateFilter = query.get("isTemplate") ?? "false";

    const projectsParams: any = { limit: 10, status: statusFilter, page: pageNumber };
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
        updateUrl({ status: ev.target.value, page: 1 });
    };

    const onIsTemplateFilterChange = (ev) => {
        updateUrl({ isTemplate: ev.target.value, page: 1 });
    };

    const onPageChange = (pageNumber) => {
        updateUrl({ page: pageNumber + 1 });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb />
                <PaginationV2 page={apiPageNumber} total={projects?.pageCount ?? 0} onPageChange={onPageChange} />

                <div>
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <CreateButton onClick={handleCreateProject}>New project</CreateButton>
                    </RestrictedComponent>
                </div>
            </div>
            <PageTitleHeader title={t("Projects")} header={isLoading ? t("Projects") : `${t("Projects")} (${projects.totalCount})`} />

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

            <ProjectsTable projects={isLoading ? null : projects.data} />
        </div>
    );
};

export default ProjectsListPage;
