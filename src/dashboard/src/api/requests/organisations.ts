import {
    requestEntities,
    requestEntity,
    requestEntityDelete,
    requestEntityPost,
    requestEntityPut,
} from "utilities/requests";

const API_BASE_URL = "/organisations";

export const requestOrganisation = (organisationId: number, init?: RequestInit) =>
    requestEntity(`${API_BASE_URL}/${organisationId}`, init);

export const requestOrganisations = (params: any, init?: RequestInit) => requestEntities(API_BASE_URL, params, init);

export const requestOrganisationContacts = (organisationId: number, init?: RequestInit) =>
    requestEntities(`${API_BASE_URL}/${organisationId}/contacts`, undefined, init);

export const requestOrganisationPost = (organisation: FormData) => requestEntityPost(API_BASE_URL, organisation);

export const requestOrganisationContactPost = (organisationId: number, contact: any) =>
    requestEntityPost(`${API_BASE_URL}/${organisationId}/contacts`, contact);

export const requestOrganisationPut = (organisationId: number, data: any) =>
    requestEntityPut(`${API_BASE_URL}/${organisationId}`, data);

export const requestOrganisationDelete = (organisationId: number) =>
    requestEntityDelete(`${API_BASE_URL}/${organisationId}`);
