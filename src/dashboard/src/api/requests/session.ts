import { requestEntityDelete, requestEntityPost } from "utilities/requests";

const API_BASE_URL = "/sessions";

export const requestSessionPost = () => requestEntityPost(API_BASE_URL);

export const requestSessionDelete = () => requestEntityDelete(API_BASE_URL);
