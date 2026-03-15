import {
    requestEntities,
    requestEntity,
    requestEntityDelete,
    requestEntityPost,
    requestEntityPut,
} from "utilities/requests.js";

const API_BASE_URL = "/organisations";

export const requestOrganisation = (organisationId: number) => requestEntity(`${API_BASE_URL}/${organisationId}`);

export const requestOrganisations = (params: any) => requestEntities(API_BASE_URL, params);

export const requestOrganisationContacts = (organisationId: number) =>
    requestEntities(`${API_BASE_URL}/${organisationId}/contacts`);

export const requestOrganisationPost = (organisation: FormData) => requestEntityPost(API_BASE_URL, organisation);

export const requestOrganisationContactPost = (organisationId: number, contact: any) =>
    requestEntityPost(`${API_BASE_URL}/${organisationId}/contacts`, contact);

export const requestOrganisationPut = (organisationId: number, data: any) =>
    requestEntityPut(`${API_BASE_URL}/${organisationId}`, data);

export const requestOrganisationDelete = (organisationId: number) =>
    requestEntityDelete(`${API_BASE_URL}/${organisationId}`);
