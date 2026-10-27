import RestrictedComponent from "components/logic/RestrictedComponent";
import CreateButton from "components/ui/buttons/CreateButton";
import VulnerabilityFilters from "components/vulnerabilities/VulnerabilityFilters";
import VulnerabilityTableModel from "components/vulnerabilities/VulnerabilityTableModel";
import TabToolbar from "components/ui/TabToolbar";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ignoreAbortError } from "utilities/abort";
import { requestEntity } from "utilities/requests";
import VulnerabilitiesTable from "../vulnerabilities/VulnerabilitiesTable";

const ProjectVulnerabilities = ({ project }: any) => {
    const [tableModel, setTableModel] = useState(new VulnerabilityTableModel());

    const navigate = useNavigate();

    const fetchVulnerabilities = useCallback((signal?: AbortSignal) => {
        const queryParams = new URLSearchParams();
        queryParams.set("projectId", project.id);
        queryParams.set("isTemplate", "false");
        queryParams.set("orderColumn", tableModel.sortBy.column);
        queryParams.set("orderDirection", tableModel.sortBy.order);
        Object.keys(tableModel.filters).forEach(
            (key) =>
                tableModel.filters[key] !== null &&
                tableModel.filters[key].length !== 0 &&
                queryParams.append(key, tableModel.filters[key]),
        );
        const url = `/vulnerabilities?${queryParams.toString()}`;
        requestEntity(url, { signal })
            .then((resp) => resp.json())
            .then((vulnerabilities) => {
                setTableModel((tableModel) => ({ ...tableModel, vulnerabilities: vulnerabilities.data }));
            })
            .catch(ignoreAbortError);
    }, [tableModel.filters, tableModel.sortBy, project]);

    const handleCreateVulnerability = () => {
        navigate(`/vulnerabilities/create?projectId=${project.id}`);
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchVulnerabilities(controller.signal);
        return () => controller.abort();
    }, [fetchVulnerabilities, tableModel.filters]);

    return (
        <section>
            <TabToolbar
                end={
                    !project.archived && (
                        <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                            <CreateButton onClick={handleCreateVulnerability}>New vulnerability</CreateButton>
                        </RestrictedComponent>
                    )
                }
            />
            <VulnerabilityFilters
                tableModel={tableModel}
                tableModelSetter={setTableModel}
                showProjectFilter={false}
            />
            <VulnerabilitiesTable
                tableModel={tableModel}
                tableModelSetter={setTableModel}
                reloadCallback={() => fetchVulnerabilities()}
                showProjectColumn={false}
                showSelection={false}
            />
        </section>
    );
};

export default ProjectVulnerabilities;
