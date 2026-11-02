import RestrictedComponent from "components/logic/RestrictedComponent";
import CreateButton from "components/ui/buttons/CreateButton";
import FindingFilters from "components/findings/FindingFilters";
import FindingTableModel from "components/findings/FindingTableModel";
import TabToolbar from "components/ui/TabToolbar";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ignoreAbortError } from "utilities/abort";
import { requestEntity } from "utilities/requests";
import FindingsTable from "../findings/FindingsTable";

const ProjectFindings = ({ project }: any) => {
    const [tableModel, setTableModel] = useState(new FindingTableModel());

    const navigate = useNavigate();

    const fetchFindings = useCallback((signal?: AbortSignal) => {
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
        const url = `/findings?${queryParams.toString()}`;
        requestEntity(url, { signal })
            .then((resp) => resp.json())
            .then((findings) => {
                setTableModel((tableModel) => ({ ...tableModel, findings: findings.data }));
            })
            .catch(ignoreAbortError);
    }, [tableModel.filters, tableModel.sortBy, project]);

    const handleCreateFinding = () => {
        navigate(`/findings/create?projectId=${project.id}`);
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchFindings(controller.signal);
        return () => controller.abort();
    }, [fetchFindings, tableModel.filters]);

    return (
        <section>
            <TabToolbar
                end={
                    !project.archived && (
                        <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                            <CreateButton onClick={handleCreateFinding}>New finding</CreateButton>
                        </RestrictedComponent>
                    )
                }
            />
            <FindingFilters
                tableModel={tableModel}
                tableModelSetter={setTableModel}
                showProjectFilter={false}
            />
            <FindingsTable
                tableModel={tableModel}
                tableModelSetter={setTableModel}
                reloadCallback={() => fetchFindings()}
                showProjectColumn={false}
                showSelection={false}
            />
        </section>
    );
};

export default ProjectFindings;
