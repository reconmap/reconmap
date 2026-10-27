import { beforeEach, describe, expect, it, vi } from "vitest";

const secureApiFetch = vi.hoisted(() => vi.fn());

vi.mock("services/api", () => ({
    default: secureApiFetch,
}));

import { requestEntities, requestEntity, requestEntityPost } from "./requests";

describe("requests", () => {
    const signal = new AbortController().signal;

    beforeEach(() => {
        secureApiFetch.mockReset();
        secureApiFetch.mockResolvedValue(new Response(null, { status: 204 }));
    });

    it("forwards the signal of a GET request", async () => {
        await requestEntity("/tasks/1", { signal });

        expect(secureApiFetch).toHaveBeenCalledWith("/tasks/1", { signal, method: "GET" });
    });

    it("forwards the signal of a GET request with params", async () => {
        await requestEntities("/tasks", { keywords: "xss" }, { signal });

        expect(secureApiFetch).toHaveBeenCalledWith("/tasks?keywords=xss", { signal, method: "GET" });
    });

    it("forwards the signal of a POST request", async () => {
        const formData = new FormData();

        await requestEntityPost("/system/data", formData, { signal });

        expect(secureApiFetch).toHaveBeenCalledWith("/system/data", { signal, method: "POST", body: formData });
    });

    it("does not change requests made without init", async () => {
        await requestEntity("/tasks/1");

        expect(secureApiFetch).toHaveBeenCalledWith("/tasks/1", { method: "GET" });
    });
});
