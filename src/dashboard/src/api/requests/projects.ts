import secureApiFetch from "services/api";
import {
    requestEntities,
    requestEntity,
    requestEntityDelete,
    requestEntityPatch,
    requestEntityPost,
    requestEntityPut,
} from "utilities/requests";

const API_BASE_URL = "/projects";

const requestProject = (projectId: string, init?: RequestInit) => requestEntity(`${API_BASE_URL}/${projectId}`, init);

const requestProjects = async (params: Record<string, any>, init?: RequestInit) => {
    const queryParams = new URLSearchParams(params).toString();
    return (await requestEntities(`/projects?` + queryParams, undefined, init)).json();
};

const requestProjectUsers = (projectId: string, init?: RequestInit) => {
    return secureApiFetch(`/projects/${projectId}/members`, { ...init, method: "GET" });
};

export const requestProjectMemberPost = (projectId: string, userId: number) =>
    requestEntityPost(`/projects/${projectId}/members`, { userId });

const requestProjectUserDelete = (projectId: string, userId: number) =>
    requestEntityDelete(`/projects/${projectId}/members/${userId}`);

const requestProjectVault = (projectId: string, init?: RequestInit) => {
    return secureApiFetch(`/projects/${projectId}/secrets`, { ...init, method: "GET" });
};

const requestProjectCategories = (init?: RequestInit) => requestEntities(`${API_BASE_URL}/categories`, undefined, init);

const requestProjectDelete = (projectId: string) => requestEntityDelete(`${API_BASE_URL}/${projectId}`);

const requestProjectPost = (project: Record<string, any>) => {
    return secureApiFetch(`/projects`, {
        method: "POST",
        body: JSON.stringify(project),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export const requestProjectPut = (projectId: string, data: any) =>
    requestEntityPut(`${API_BASE_URL}/${projectId}`, data);

export const requestProjectPatch = (projectId: string, data: any) =>
    requestEntityPatch(`${API_BASE_URL}/${projectId}`, data);

export {
    requestProject,
    requestProjectCategories,
    requestProjectDelete,
    requestProjectPost,
    requestProjects,
    requestProjectUserDelete,
    requestProjectUsers,
    requestProjectVault
};

