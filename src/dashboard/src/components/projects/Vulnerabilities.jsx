import RestrictedComponent from "components/logic/RestrictedComponent";
import CreateButton from "components/ui/buttons/Create";
import VulnerabilityFilters from "components/vulnerabilities/Filters";
import VulnerabilityTableModel from "components/vulnerabilities/VulnerabilityTableModel";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestEntity } from "utilities/requests.js";
import VulnerabilitiesTable from "../vulnerabilities/VulnerabilitiesTable";

const ProjectVulnerabilities = ({ project }) => {
    const [tableModel, setTableModel] = useState(new VulnerabilityTableModel());

    const navigate = useNavigate();

    const fetchVulnerabilities = useCallback(() => {
        const queryParams = new URLSearchParams();
        queryParams.set("projectId", project.id);
        queryParams.set("isTemplate", false);
        queryParams.set("orderColumn", tableModel.sortBy.column);
        queryParams.set("orderDirection", tableModel.sortBy.order);
        Object.keys(tableModel.filters).forEach(
            (key) =>
                tableModel.filters[key] !== null &&
                tableModel.filters[key].length !== 0 &&
                queryParams.append(key, tableModel.filters[key]),
        );
        const url = `/vulnerabilities?${queryParams.toString()}`;
        requestEntity(url)
            .then((resp) => resp.json())
            .then((vulnerabilities) => {
                setTableModel((tableModel) => ({ ...tableModel, vulnerabilities: vulnerabilities.data }));
            });
    }, [tableModel.filters, tableModel.sortBy, project]);

    const handleCreateVulnerability = () => {
        navigate(`/vulnerabilities/create?projectId=${project.id}`);
    };

    useEffect(() => {
        fetchVulnerabilities();
    }, [fetchVulnerabilities, tableModel.filters]);

    return (
        <section>
            <div>
                <VulnerabilityFilters
                    tableModel={tableModel}
                    tableModelSetter={setTableModel}
                    showProjectFilter={false}
                />
                <hr />
                {!project.archived && (
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <CreateButton onClick={handleCreateVulnerability}>Add new vulnerability</CreateButton>
                    </RestrictedComponent>
                )}
            </div>
            <VulnerabilitiesTable
                tableModel={tableModel}
                tableModelSetter={setTableModel}
                reloadCallback={fetchVulnerabilities}
                showProjectColumn={false}
                showSelection={false}
            />
        </section>
    );
};

export default ProjectVulnerabilities;
