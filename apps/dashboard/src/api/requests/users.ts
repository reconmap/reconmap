import { UserInterface } from "models/User.js";
import secureApiFetch from "services/api.js";
import { requestEntityPatch } from "utilities/requests.js";

const API_PREFIX: string = "/users";

const createUserApi = (user: UserInterface): Promise<Response> => {
    return secureApiFetch(API_PREFIX, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    });
};

const getUser = (userId: number): Promise<Response> => {
    return secureApiFetch(`${API_PREFIX}/${userId}`, {
        method: "GET",
    });
};

const requestUserActivity = (userId: number): Promise<Response> => {
    return secureApiFetch(`${API_PREFIX}/${userId}/activity`, {
        method: "GET",
    });
};

const getUsers = (): Promise<Response> => {
    return secureApiFetch(API_PREFIX, {
        method: "GET",
    });
};

// Language, timezone and preferences are personal: only the profile owner can send them (see ownerFields).
interface OwnerFields {
    locale: string;
    timezone: string;
    preferences: Record<string, unknown>;
}

const updateUser = (user: UserInterface, ownerFields?: OwnerFields): Promise<Response> => {
    // Only editable fields are sent: the API rejects read-only ones (such as mfaEnabled).
    const { id, subjectId, fullName, mfaEnabled, lastLoginAt, createdAt, updatedAt, preferences, locale, timezone, ...editable } = user;

    return secureApiFetch(`${API_PREFIX}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...editable, ...ownerFields }),
    });
};

const deleteUser = (userId: number): Promise<Response> => {
    return secureApiFetch(`${API_PREFIX}/${userId}`, {
        method: "DELETE",
    });
};

const requestUserPatch = (userId: number, data: any): Promise<Response> => requestEntityPatch(`${API_PREFIX}/${userId}`, data);

const deleteUsers = (userIds: number[]): Promise<Response> => {
    return secureApiFetch(API_PREFIX, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Bulk-Operation": "DELETE",
        },
        body: JSON.stringify(userIds),
    });
};

const requestUserAction = (userId: number, action: string): Promise<Response> => {
    return secureApiFetch(`${API_PREFIX}/${userId}/actions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: action }),
    });
};

const enableMfaApi = (userId: number): Promise<Response> => {
    return requestUserAction(userId, "enable-mfa");
};

const resetPassword = (userId: number): Promise<Response> => {
    return requestUserAction(userId, "reset-password");
};

export type { OwnerFields };

export {
    createUserApi,
    deleteUser,
    deleteUsers,
    enableMfaApi,
    getUser,
    getUsers,
    requestUserActivity,
    requestUserPatch,
    resetPassword,
    updateUser,
};
