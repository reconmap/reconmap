import { useAssetsQuery, useDeleteAssetMutation } from "api/assets.js";
import PaginationV2 from "components/layout/PaginationV2";
import RestrictedComponent from "components/logic/RestrictedComponent";
import AssetModalDialog from "components/asset/ModalDialog";
import AssetBadge from "components/asset/AssetBadge";
import Tags from "components/ui/Tags";
import CreateButton from "components/ui/buttons/Create";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import useBoolean from "hooks/useBoolean";
import useQuery from "hooks/useQuery";
import { useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../ui/Loading";

const ProjectAssets = ({ project }) => {
    const query = useQuery();
    const urlPageNumber = query.get("page") !== null ? parseInt(query.get("page")) : 1;
    const [pageNumber, setPageNumber] = useState(urlPageNumber);

    const { value: isAddAssetDialogOpen, setTrue: openAddAssetDialog, setFalse: closeAddAssetDialog } = useBoolean();
    const {
        data: assets,
        isLoading,
        refetch,
    } = useAssetsQuery({ limit: 5, projectId: project.id, page: pageNumber - 1 });
    const deleteAssetMutation = useDeleteAssetMutation();

    const onDeleteButtonClick = (ev, assetId) => {
        ev.preventDefault();

        deleteAssetMutation.mutate(assetId);
        refetch();
    };

    const onAssetFormSaved = () => {
        refetch();
        closeAddAssetDialog();
    };

    const onPageChange = (pageNumber) => {
        setPageNumber(pageNumber + 1);
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
                    <DeleteIconButton onClick={(ev) => onDeleteButtonClick(ev, asset.id)} />
                </RestrictedComponent>
            )
        }
    ]

    return (
        <section>
            <h4 className="title is-4">Assets</h4>
            {!project.archived && (
                <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                    <AssetModalDialog
                        project={project}
                        isOpen={isAddAssetDialogOpen}
                        onSubmit={onAssetFormSaved}
                        onCancel={closeAddAssetDialog}
                    />
                    <CreateButton onClick={openAddAssetDialog}>Add asset&hellip;</CreateButton>
                </RestrictedComponent>
            )}
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    {assets.pageCount > 1 && (
                        <center>
                            <PaginationV2 page={pageNumber - 1} total={assets.pageCount} onPageChange={onPageChange} />
                        </center>
                    )}
                    <NativeTable rows={assets.data} rowId={(asset) => asset.id} columns={columns}>
                    </NativeTable>
                </>
            )}
        </section>
    );
};

export default ProjectAssets;
