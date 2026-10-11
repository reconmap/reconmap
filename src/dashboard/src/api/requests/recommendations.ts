import secureApiFetch from "services/api.js";

const API_BASE_URL = "/commands";

export const requestToolRecommendation = (data: any) =>
    secureApiFetch(`${API_BASE_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

