import { useProjectsQuery } from "api/projects.js";
import { useVulnerabilityCategoriesQuery } from "api/vulnerabilities.js";
import NativeSelect from "components/form/NativeSelect";
import Risks from "models/Risks";

const VulnerabilityFilters = ({ tableModel, tableModelSetter: setTableModel, showProjectFilter = true }) => {
    const { data: categories, isLoading, isError } = useVulnerabilityCategoriesQuery({ parentsOnly: true });
    const { data: projects, isLoading: isLoadingProjects } = useProjectsQuery({ status: "active" });

    const onFilterChange = (ev) => {
        setTableModel({
            ...tableModel,
            filters: {
                ...tableModel.filters,
                [ev.target.name]: ev.target.value,
            },
        });
    };

    return (
        <details>
            <summary>Filters</summary>
            <div className="field is-grouped">
                {showProjectFilter && (
                    <div className="control">
                        <NativeSelect name="projectId" onChange={onFilterChange}>
                            <option value="">Project = (any)</option>
                            {!isLoadingProjects &&
                                projects.data.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        Project = {project.name}
                                    </option>
                                ))}
                        </NativeSelect>
                    </div>
                )}

                <div className="control">
                    <NativeSelect name="status" onChange={onFilterChange}>
                        <option value="">Status = (any)</option>
                        <option value="open">Status = Open</option>
                        <option value="closed">Status = Closed</option>
                    </NativeSelect>
                </div>

                <div className="control">
                    <NativeSelect name="risk" onChange={onFilterChange}>
                        <option value="">Risk = (any)</option>
                        {Risks.map((risk) => (
                            <option key={risk.id} value={risk.id}>
                                Risk = {risk.name}
                            </option>
                        ))}
                    </NativeSelect>
                </div>

                <div className="control">
                    <NativeSelect name="categoryId" onChange={onFilterChange}>
                        <option value="">Category = (any)</option>
                        {!isLoading && !isError && (
                            <>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        Category = {category.name}
                                    </option>
                                ))}
                            </>
                        )}
                    </NativeSelect>
                </div>
            </div>
        </details>
    );
};

export default VulnerabilityFilters;
