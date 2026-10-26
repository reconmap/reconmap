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

const requestProject = (projectId: string) => requestEntity(`${API_BASE_URL}/${projectId}`);

const requestProjects = async (params: Record<string, any>) => {
    const queryParams = new URLSearchParams(params).toString();
    return (await requestEntities(`/projects?` + queryParams)).json();
};

const requestProjectUsers = (projectId: string) => {
    return secureApiFetch(`/projects/${projectId}/members`, { method: "GET" });
};

export const requestProjectMemberPost = (projectId: string, userId: number) =>
    requestEntityPost(`/projects/${projectId}/members`, { userId });

const requestProjectUserDelete = (projectId: string, userId: number) =>
    requestEntityDelete(`/projects/${projectId}/members/${userId}`);

const requestProjectVault = (projectId: string) => {
    return secureApiFetch(`/projects/${projectId}/secrets`, { method: "GET" });
};

const requestProjectCategories = () => requestEntities(`${API_BASE_URL}/categories`);

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

