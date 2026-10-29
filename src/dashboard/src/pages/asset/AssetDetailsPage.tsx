import { useConfirm } from "components/ui/useConfirm";
import { useAssetQuery, useAssetsQuery, useDeleteAssetMutation } from "api/assets";
import AssetBadge from "components/asset/AssetBadge";
import { assetPath } from "models/assetTree";
import RestrictedComponent from "components/logic/RestrictedComponent";
import TimestampsSection from "components/ui/TimestampsSection";
import VulnerabilityTableModel from "components/vulnerabilities/VulnerabilityTableModel";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ignoreAbortError } from "utilities/abort";
import { requestEntity } from "utilities/requests";
import Badge from "components/badges/Badge";
import PageSkeleton from "components/ui/PageSkeleton";
import Breadcrumb from "components/ui/Breadcrumb";
import DeleteButton from "components/ui/buttons/DeleteButton";
import PageTitleHeader from "components/ui/PageTitleHeader";
import VulnerabilitiesTable from "components/vulnerabilities/VulnerabilitiesTable";
import { useTranslation } from "react-i18next";

const AssetDetailsPage = () => {
    const [t] = useTranslation();
    const { confirm, confirmDialog } = useConfirm();
    const navigate = useNavigate();
    const { assetId } = useParams() as any;
    const { data: asset } = useAssetQuery(assetId);
    const deleteAssetMutation = useDeleteAssetMutation();
    const { data: projectAssets } = useAssetsQuery({ projectId: asset?.projectId });
    const allAssets: any[] = Array.isArray(projectAssets?.data) ? projectAssets.data : [];
    const ancestors = asset ? assetPath(allAssets, asset.id).slice(0, -1) : [];
    const children = asset ? allAssets.filter((candidate) => candidate.parentId === asset.id) : [];

    const attributes = useMemo(() => {
        try {
            return asset?.attributes ? Object.entries(JSON.parse(asset.attributes)) : [];
        } catch {
            return [];
        }
    }, [asset]);

    const [savedProject, setSavedProject] = useState<any>(null);

    const [tableModel, setTableModel] = useState(new VulnerabilityTableModel());

    const fetchVulnerabilities = useCallback((signal?: AbortSignal) => {
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
        requestEntity(url, { signal })
            .then((resp) => resp.json())
            .then((vulnerabilities) => {
                setTableModel((tableModel) => ({ ...tableModel, vulnerabilities: vulnerabilities.data }));
            })
            .catch(ignoreAbortError);
    }, [tableModel.filters, tableModel.sortBy, assetId]);

    useEffect(() => {
        if (asset) {
            const controller = new AbortController();
            requestEntity(`/projects/${asset.projectId}`, { signal: controller.signal })
                .then((resp) => resp.json())
                .then((json) => {
                    setSavedProject(json);
                })
                .catch(ignoreAbortError);
            return () => controller.abort();
        }
    }, [asset]);

    const handleDelete = async () => {
        if (!(await confirm(t("Are you sure you want to delete this asset?")))) return;
        deleteAssetMutation
            .mutateAsync(assetId)
            .then((success) => {
                if (success) navigate("/projects");
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchVulnerabilities(controller.signal);
        return () => controller.abort();
    }, [fetchVulnerabilities, tableModel.filters]);

    if (!asset) return <PageSkeleton />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                    {savedProject && <Link to={`/projects/${savedProject.id}`}>{savedProject.name}</Link>}
                    {ancestors.map((ancestor) => (
                        <Link key={ancestor.id} to={`/assets/${ancestor.id}`}>
                            {ancestor.name}
                        </Link>
                    ))}
                    <span>{asset.name}</span>
                </Breadcrumb>
                <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                    <DeleteButton onClick={handleDelete} />
                </RestrictedComponent>
            </div>
            <article>
                <div className="content">
                    <PageTitleHeader title={asset.name} subHeader={t("Asset")} />

                    <div className="grid grid-two">
                        <div>
                            <h4>Kind</h4>
                            <Badge color={asset.kind === "hostname" ? "green" : "blue"}>{asset.kind ?? "-"}</Badge>
                            {asset.source && (
                                <>
                                    <h4>Discovered by</h4>
                                    <p>{asset.source}</p>
                                </>
                            )}
                            <h4>Last seen</h4>
                            <p>{new Date(asset.lastSeenAt).toLocaleString()}</p>
                        </div>

                        <div>
                            <TimestampsSection entity={asset} />
                        </div>
                    </div>

                    {attributes.length > 0 && (
                        <>
                            <h4>Attributes</h4>
                            <dl>
                                {attributes.map(([key, value]) => (
                                    <div key={key}>
                                        <dt>{key}</dt>
                                        <dd>{typeof value === "string" ? value : JSON.stringify(value)}</dd>
                                    </div>
                                ))}
                            </dl>
                        </>
                    )}

                    {children.length > 0 && (
                        <>
                            <h4>Nested assets</h4>
                            <ul>
                                {children.map((child) => (
                                    <li key={child.id}>
                                        <Link to={`/assets/${child.id}`}>
                                            <AssetBadge name={child.name} kind={child.kind ?? null} />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <h4>Vulnerabilities</h4>
                    <VulnerabilitiesTable
                        tableModel={tableModel}
                        tableModelSetter={setTableModel}
                        reloadCallback={() => fetchVulnerabilities()}
                        showProjectColumn={false}
                        showSelection={false}
                    />
                </div>
            </article>
            {confirmDialog}
        </div>
    );
};

export default AssetDetailsPage;
