import { useMemo, useState, type MouseEvent } from "react";
import { useConfirm } from "components/ui/useConfirm";
import { useAssetsQuery, useDeleteAssetMutation } from "api/assets";
import RestrictedComponent from "components/logic/RestrictedComponent";
import AssetModalDialog from "components/asset/AssetModalDialog";
import AssetBadge from "components/asset/AssetBadge";
import Tags from "components/ui/Tags";
import TabToolbar from "components/ui/TabToolbar";
import CreateButton from "components/ui/buttons/CreateButton";
import DeleteButton from "components/ui/buttons/DeleteButton";
import NativeTable from "components/ui/tables/NativeTable";
import useBoolean from "hooks/useBoolean";
import { buildAssetTree, type AssetNode } from "models/assetTree";
import { Link } from "react-router";

type VisibleRow = { node: AssetNode; depth: number };

const visibleRows = (nodes: AssetNode[], collapsed: Set<string>, depth = 0): VisibleRow[] =>
    nodes.flatMap((node) => [
        { node, depth },
        ...(collapsed.has(node.id) ? [] : visibleRows(node.children, collapsed, depth + 1)),
    ]);

const countDescendants = (node: AssetNode): number =>
    node.children.reduce((total, child) => total + 1 + countDescendants(child), 0);

const ProjectAssets = ({ project }: any) => {
    const { value: isAddAssetDialogOpen, setTrue: openAddAssetDialog, setFalse: closeAddAssetDialog } = useBoolean();
    const { data: assets, isLoading, refetch } = useAssetsQuery({ projectId: project.id });
    const deleteAssetMutation = useDeleteAssetMutation();
    const { confirm, confirmDialog } = useConfirm();
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const tree = useMemo(() => buildAssetTree(Array.isArray(assets?.data) ? assets.data : []), [assets]);
    const rows = useMemo(() => visibleRows(tree, collapsed), [tree, collapsed]);

    const toggle = (assetId: string) =>
        setCollapsed((current) => {
            const next = new Set(current);
            if (!next.delete(assetId)) next.add(assetId);
            return next;
        });

    const onDeleteButtonClick = async (event: MouseEvent<HTMLElement>, node: AssetNode) => {
        event.preventDefault();

        const descendants = countDescendants(node);
        const message = descendants
            ? `Are you sure you want to delete this asset and its ${descendants} nested assets?`
            : "Are you sure you want to delete this asset?";
        if (!(await confirm(message))) return;

        await deleteAssetMutation.mutateAsync(node.id);
        refetch();
    };

    const onAssetFormSaved = () => {
        refetch();
        closeAddAssetDialog();
    };

    const columns = [
        {
            header: "Name",
            cell: ({ node, depth }: VisibleRow) => (
                <div style={{ paddingLeft: `${depth * 20}px`, display: "flex", alignItems: "center", gap: "4px" }}>
                    {node.children.length > 0 ? (
                        <button
                            type="button"
                            aria-label={collapsed.has(node.id) ? "Expand" : "Collapse"}
                            aria-expanded={!collapsed.has(node.id)}
                            onClick={() => toggle(node.id)}
                            style={{ width: "1.5em", background: "none", border: 0, cursor: "pointer", padding: 0 }}
                        >
                            {collapsed.has(node.id) ? "▸" : "▾"}
                        </button>
                    ) : (
                        <span style={{ width: "1.5em" }} />
                    )}
                    <Link to={`/assets/${node.id}`}>
                        <AssetBadge name={node.name} kind={node.kind ?? null} />
                    </Link>
                    {collapsed.has(node.id) && <small>({countDescendants(node)})</small>}
                </div>
            ),
        },
        {
            header: "Kind",
            cell: ({ node }: VisibleRow) => (
                <>
                    {node.kind} <Tags values={node.tags} />
                </>
            ),
        },
        {
            header: "Last seen",
            cell: ({ node }: VisibleRow) => <>{node.lastSeenAt ? new Date(String(node.lastSeenAt)).toLocaleString() : "-"}</>,
        },
        {
            header: "",
            cell: ({ node }: VisibleRow) => (
                <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                    <DeleteButton display="icon" onClick={(event) => onDeleteButtonClick(event, node)} />
                </RestrictedComponent>
            ),
        },
    ];

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
            <NativeTable rows={isLoading ? null : rows} rowId={({ node }: VisibleRow) => node.id} columns={columns} />
            {confirmDialog}
        </section>
    );
};

export default ProjectAssets;
