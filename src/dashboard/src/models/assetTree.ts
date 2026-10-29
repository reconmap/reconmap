export type AssetNode = {
    id: string;
    parentId?: string | null;
    projectId: string;
    name: string;
    type?: string | null;
    source?: string | null;
    attributes?: string | null;
    tags?: string | null;
    children: AssetNode[];
    [key: string]: unknown;
};

/** Turns the API's flat asset list into a forest. Nodes whose parent is missing become roots. */
export const buildAssetTree = (assets: any[]): AssetNode[] => {
    const byId = new Map<string, AssetNode>();
    assets.forEach((asset) => byId.set(asset.id, { ...asset, children: [] }));

    const roots: AssetNode[] = [];
    byId.forEach((node) => {
        const parent = node.parentId ? byId.get(node.parentId) : undefined;
        if (parent) parent.children.push(node);
        else roots.push(node);
    });

    const byName = (a: AssetNode, b: AssetNode) => a.name.localeCompare(b.name, undefined, { numeric: true });
    const sortRecursively = (nodes: AssetNode[]) => {
        nodes.sort(byName);
        nodes.forEach((node) => sortRecursively(node.children));
    };
    sortRecursively(roots);

    return roots;
};

/** Names from the root down to the given asset (inclusive). */
export const assetPath = (assets: any[], assetId: string): any[] => {
    const byId = new Map(assets.map((asset) => [asset.id, asset]));
    const path: any[] = [];
    let cursor = byId.get(assetId);
    const seen = new Set<string>();
    while (cursor && !seen.has(cursor.id)) {
        seen.add(cursor.id);
        path.unshift(cursor);
        cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
    }
    return path;
};

/** Flattens a forest depth-first, with each node's depth. */
export const flattenAssetTree = (nodes: AssetNode[], depth = 0): { node: AssetNode; depth: number }[] =>
    nodes.flatMap((node) => [{ node, depth }, ...flattenAssetTree(node.children, depth + 1)]);
