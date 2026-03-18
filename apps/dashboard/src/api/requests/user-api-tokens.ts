import secureApiFetch from "services/api.js";
import { CreateUserApiTokenRequest } from "../user-api-tokens.js";

const requestUserApiTokens = () => {
    return secureApiFetch("/user-api-tokens", { method: "GET" });
};

const requestUserApiTokenPost = (data: CreateUserApiTokenRequest) => {
    return secureApiFetch("/user-api-tokens", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

const requestUserApiTokenDeletion = (tokenId: number) => {
    return secureApiFetch(`/user-api-tokens/${tokenId}`, { method: "DELETE" });
};

export {
    requestUserApiTokenDeletion,
    requestUserApiTokenPost,
    requestUserApiTokens,
};
