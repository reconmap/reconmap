import secureApiFetch from "services/api.js";

const API_BASE_URL = "/organisations";

const requestContactDelete = (organisationId: number, contactId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${organisationId}/contacts/${contactId}`, {
        method: "DELETE",
    });
};

export { requestContactDelete };
