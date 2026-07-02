import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("api/assets.js", () => ({
    requestAssetEnsure: vi.fn(),
}));

import { requestAssetEnsure } from "api/assets.js";
import { ensureUrlAsset, getUrlCapableUsages, isUrlCapableUsage } from "./url.js";

const mockedRequestAssetEnsure = vi.mocked(requestAssetEnsure);

describe("scan url helpers", () => {
    beforeEach(() => {
        mockedRequestAssetEnsure.mockReset();
    });

    it("detects URL-capable usages", () => {
        expect(isUrlCapableUsage({ arguments: "-j {{{URL|||https://localhost}}}" })).toBe(true);
        expect(isUrlCapableUsage({ arguments: "-oX - {{{Host|||localhost}}}" })).toBe(false);
        expect(
            getUrlCapableUsages([
                { arguments: "-j {{{URL|||https://localhost}}}" },
                { arguments: "-oX - {{{Host|||localhost}}}" },
            ]),
        ).toHaveLength(1);
    });

    it("requests the URL asset ensure endpoint with a trimmed URL", async () => {
        mockedRequestAssetEnsure.mockResolvedValue(new Response(null, { status: 200 }));

        await ensureUrlAsset(9, "  https://example.com/path  ");

        expect(mockedRequestAssetEnsure).toHaveBeenCalledWith({
            projectId: 9,
            name: "https://example.com/path",
            type: "url",
        });
    });
});
