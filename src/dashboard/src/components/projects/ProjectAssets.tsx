import { useConfirm } from "components/ui/useConfirm";
import { useAssetsQuery, useDeleteAssetMutation } from "api/assets";
import PaginationV2 from "components/layout/PaginationV2";
import RestrictedComponent from "components/logic/RestrictedComponent";
import AssetModalDialog from "components/asset/AssetModalDialog";
import AssetBadge from "components/asset/AssetBadge";
import Tags from "components/ui/Tags";
import TabToolbar from "components/ui/TabToolbar";
import CreateButton from "components/ui/buttons/CreateButton";
import DeleteButton from "components/ui/buttons/DeleteButton";
import NativeTable from "components/ui/tables/NativeTable";
import useBoolean from "hooks/useBoolean";
import { Link, useSearchParams } from "react-router";

const ProjectAssets = ({ project }: any) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageNumber = parseInt(searchParams.get("page") ?? "1") || 1;

    const { value: isAddAssetDialogOpen, setTrue: openAddAssetDialog, setFalse: closeAddAssetDialog } = useBoolean();
    const {
        data: assets,
        isLoading,
        refetch,
    } = useAssetsQuery({ limit: 5, projectId: project.id, page: pageNumber });
    const deleteAssetMutation = useDeleteAssetMutation();
    const { confirm, confirmDialog } = useConfirm();

    const onDeleteButtonClick = async (ev, assetId) => {
        ev.preventDefault();

        if (!(await confirm("Are you sure you want to delete this asset?"))) return;

        deleteAssetMutation.mutate(assetId);
        refetch();
    };

    const onAssetFormSaved = () => {
        refetch();
        closeAddAssetDialog();
    };

    const onPageChange = (pageNumber) => {
        setSearchParams((params) => {
            params.set("page", String(pageNumber + 1));
            return params;
        });
    };

    const columns = [
        {
            header: "Name",
            cell: (asset) => <>
                {!asset.parent_id && (
                    <Link to={`/assets/${asset.id}`}>
                        <AssetBadge name={asset.name} />
                    </Link>
                )}
                {asset.parent_id !== null && <>{asset.parent?.name}</>}
            </>
        },
        {
            header: "Sub-asset",
            cell: (asset) => (
                <>
                    {asset.parent_id ? (
                        <>
                            <Link to={`/assets/${asset.id}`}>
                                <AssetBadge name={asset.name} />
                            </Link>
                        </>
                    ) : (
                        "-"
                    )}
                </>
            )
        },
        {
            header: "Type",
            cell: (asset) => (
                <>
                    {asset.type} <Tags values={asset.tags} />
                </>
            )
        },
        {
            header: "Vulnerable?",
            cell: (asset) => (
                <>
                    {asset.num_vulnerabilities > 0
                        ? `Yes (${asset.num_vulnerabilities} vulnerabilities found)`
                        : "No"}
                </>
            )
        },
        {
            header: "",
            cell: (asset) => (
                <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                    <DeleteButton display="icon" onClick={(ev) => onDeleteButtonClick(ev, asset.id)} />
                </RestrictedComponent>
            )
        }
    ]

    return (
        <section>
            <TabToolbar
                end={
                    !project.archived && (
                        <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                            <AssetModalDialog
                                project={project}
                                isOpen={isAddAssetDialogOpen}
                                onSubmit={onAssetFormSaved}
                                onCancel={closeAddAssetDialog}
                            />
                            <CreateButton onClick={openAddAssetDialog}>New asset&hellip;</CreateButton>
                        </RestrictedComponent>
                    )
                }
            />
            {(assets as any)?.pageCount > 1 && (
                <center>
                    <PaginationV2 page={pageNumber - 1} total={assets!.pageCount} onPageChange={onPageChange} />
                </center>
            )}
            <NativeTable rows={isLoading ? null : assets!.data} rowId={(asset) => asset.id} columns={columns}>
            </NativeTable>
            {confirmDialog}
        </section>
    );
};

export default ProjectAssets;
