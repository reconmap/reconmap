import Configuration from "Configuration.js";
import KeyCloakService from "./keycloak.js";

function resetSessionStorageAndRedirect() {
    window.location.assign(Configuration.getContextPath());
}

async function secureApiFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const user = KeyCloakService.getUserInfo();

    const headers = new Headers(init.headers);
    if (user?.access_token) {
        headers.set("Authorization", `Bearer ${user.access_token}`);
    }

    const requestInit: RequestInit = {
        ...init,
        headers,
        credentials: "include",
    };

    const resp = await fetch(Configuration.getDefaultApiUrl() + url, requestInit);

    if (resp.status === 401) {
        resetSessionStorageAndRedirect();
    }

    return resp;
}

const downloadFromApi = (url: string) => {
    secureApiFetch(url, { method: "GET" })
        .then((resp) => {
            const contentDispositionHeader = resp.headers.get("content-disposition");
            if (!contentDispositionHeader) {
                throw new Error("Content-Disposition header not found in response.");
            }
            const filenameRe = /filename="?([^";]+)"?/i;
            const match = filenameRe.exec(contentDispositionHeader);
            if (!match || !match[1]) {
                throw new Error("Filename not found in Content-Disposition header.");
            }
            const filename = match[1];
            return Promise.all([resp.blob(), filename]);
        })
        .then((values) => {
            const blob = values[0];
            const filename = values[1];
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });
};

export { downloadFromApi };

export default secureApiFetch;
