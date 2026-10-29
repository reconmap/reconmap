import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("api/assets.js", () => ({
    requestAssetEnsure: vi.fn(),
}));

import { requestAssetEnsure } from "api/assets";
import { ensureUrlAsset } from "./url";

const mockedRequestAssetEnsure = vi.mocked(requestAssetEnsure);

describe("scan url helpers", () => {
    beforeEach(() => {
        mockedRequestAssetEnsure.mockReset();
    });

    it("requests the URL asset ensure endpoint with a trimmed URL", async () => {
        mockedRequestAssetEnsure.mockResolvedValue(new Response(null, { status: 200 }));

        await ensureUrlAsset("018f0000-0000-7000-8000-000000000001", "  https://example.com/path  ");

        expect(mockedRequestAssetEnsure).toHaveBeenCalledWith({
            projectId: "018f0000-0000-7000-8000-000000000001",
            name: "https://example.com/path",
            type: "url",
        });
    });
});
