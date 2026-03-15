import { useAssetQuery, useDeleteAssetMutation } from "api/assets.js";
import RestrictedComponent from "components/logic/RestrictedComponent";
import TimestampsSection from "components/ui/TimestampsSection";
import VulnerabilityTableModel from "components/vulnerabilities/VulnerabilityTableModel";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { requestEntity } from "utilities/requests.js";
import Badge from "../badges/Badge";
import Breadcrumb from "../ui/Breadcrumb";
import DeleteButton from "../ui/buttons/Delete";
import Loading from "../ui/Loading";
import Title from "../ui/Title";
import VulnerabilitiesTable from "../vulnerabilities/VulnerabilitiesTable";

const TargetView = () => {
    const navigate = useNavigate();
    const { targetId } = useParams();
    const { data: target } = useAssetQuery(targetId);
    const deleteAssetMutation = useDeleteAssetMutation();

    const [savedProject, setSavedProject] = useState(null);

    const [tableModel, setTableModel] = useState(new VulnerabilityTableModel());

    const fetchVulnerabilities = useCallback(() => {
        const queryParams = new URLSearchParams();
        queryParams.set("targetId", targetId);
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
    }, [tableModel.filters, tableModel.sortBy, targetId]);

    useEffect(() => {
        if (target) {
            requestEntity(`/projects/${target.project_id}`)
                .then((resp) => resp.json())
                .then((json) => {
                    setSavedProject(json);
                });
        }
    }, [target]);

    const handleDelete = () => {
        deleteAssetMutation
            .mutate(targetId)
            .then((success) => {
                if (success) navigate("/projects");
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        fetchVulnerabilities();
    }, [fetchVulnerabilities, tableModel.filters]);

    if (!target) return <Loading />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                    {savedProject && <Link to={`/projects/${savedProject.id}`}>{savedProject.name}</Link>}
                    <a>{target.name}</a>
                </Breadcrumb>
                <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                    <DeleteButton onClick={handleDelete} />
                </RestrictedComponent>
            </div>
            <article>
                <div className="content">
                    <Title type="Asset" title={target.name} />

                    <div className="grid grid-two">
                        <div>
                            <h4>Kind</h4>
                            <Badge color={target.kind === "hostname" ? "green" : "blue"}>{target.kind}</Badge>
                        </div>

                        <div>
                            <TimestampsSection entity={target} />
                        </div>
                    </div>

                    <h4>Findings</h4>
                    <VulnerabilitiesTable
                        tableModel={tableModel}
                        tableModelSetter={setTableModel}
                        reloadCallback={fetchVulnerabilities}
                        showProjectColumn={false}
                        showSelection={false}
                    />
                </div>
            </article>
        </div>
    );
};

export default TargetView;
