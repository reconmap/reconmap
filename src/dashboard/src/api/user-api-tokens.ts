export enum ApiTokenScope {
    Full = "full",
    ReadOnly = "read-only"
}

export interface CreateUserApiTokenRequest {
    name: string;
    expirationDays: number;
    scope: ApiTokenScope;
}
