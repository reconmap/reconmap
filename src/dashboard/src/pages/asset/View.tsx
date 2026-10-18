import { useAssetQuery, useDeleteAssetMutation } from "api/assets";
import RestrictedComponent from "components/logic/RestrictedComponent";
import TimestampsSection from "components/ui/TimestampsSection";
import VulnerabilityTableModel from "components/vulnerabilities/VulnerabilityTableModel";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { requestEntity } from "utilities/requests";
import Badge from "components/badges/Badge";
import PageSkeleton from "components/ui/PageSkeleton";
import Breadcrumb from "components/ui/Breadcrumb";
import DeleteButton from "components/ui/buttons/Delete";
import Title from "components/ui/Title";
import VulnerabilitiesTable from "components/vulnerabilities/VulnerabilitiesTable";

const AssetView = () => {
    const navigate = useNavigate();
    const { assetId } = useParams() as any;
    const { data: asset } = useAssetQuery(assetId);
    const deleteAssetMutation = useDeleteAssetMutation();

    const [savedProject, setSavedProject] = useState<any>(null);

    const [tableModel, setTableModel] = useState(new VulnerabilityTableModel());

    const fetchVulnerabilities = useCallback(() => {
        const queryParams = new URLSearchParams();
        queryParams.set("assetId", assetId);
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
        requestEntity(url)
            .then((resp) => resp.json())
            .then((vulnerabilities) => {
                setTableModel((tableModel) => ({ ...tableModel, vulnerabilities: vulnerabilities.data }));
            });
    }, [tableModel.filters, tableModel.sortBy, assetId]);

    useEffect(() => {
        if (asset) {
            requestEntity(`/projects/${asset.project_id}`)
                .then((resp) => resp.json())
                .then((json) => {
                    setSavedProject(json);
                });
        }
    }, [asset]);

    const handleDelete = () => {
        deleteAssetMutation
            .mutateAsync(assetId)
            .then((success) => {
                if (success) navigate("/projects");
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        fetchVulnerabilities();
    }, [fetchVulnerabilities, tableModel.filters]);

    if (!asset) return <PageSkeleton />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                    {savedProject && <Link to={`/projects/${savedProject.id}`}>{savedProject.name}</Link>}
                    <span>{asset.name}</span>
                </Breadcrumb>
                <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                    <DeleteButton onClick={handleDelete} />
                </RestrictedComponent>
            </div>
            <article>
                <div className="content">
                    <Title type="Asset" title={asset.name} />

                    <div className="grid grid-two">
                        <div>
                            <h4>Type</h4>
                            <Badge color={asset.type === "hostname" ? "green" : "blue"}>{asset.type}</Badge>
                        </div>

                        <div>
                            <TimestampsSection entity={asset} />
                        </div>
                    </div>

                    <h4>Vulnerabilities</h4>
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

export default AssetView;
