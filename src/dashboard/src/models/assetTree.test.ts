import { describe, expect, it } from "vitest";
import { assetPath, buildAssetTree, flattenAssetTree } from "./assetTree";

const assets = [
    { id: "3", parentId: "2", name: "/admin" },
    { id: "1", parentId: null, name: "10.0.0.1" },
    { id: "2", parentId: "1", name: "443/tcp" },
    { id: "4", parentId: "missing", name: "orphan" },
];

describe("asset tree", () => {
    it("nests children under their parent and treats orphans as roots", () => {
        const tree = buildAssetTree(assets);

        expect(tree.map((n) => n.name)).toEqual(["10.0.0.1", "orphan"]);
        expect(tree[0].children[0].children[0].name).toBe("/admin");
    });

    it("flattens depth first with depths", () => {
        const flat = flattenAssetTree(buildAssetTree(assets));

        expect(flat.map(({ node, depth }) => `${depth}:${node.name}`)).toEqual([
            "0:10.0.0.1",
            "1:443/tcp",
            "2:/admin",
            "0:orphan",
        ]);
    });

    it("returns the path from the root to an asset", () => {
        expect(assetPath(assets, "3").map((a) => a.name)).toEqual(["10.0.0.1", "443/tcp", "/admin"]);
    });
});
