export enum ApiTokenScope {
    Full = "full",
    ReadOnly = "read-only"
}

export interface UserApiToken {
    id: number;
    name: string;
    createdAt: string;
    expiresAt: string;
    scope: ApiTokenScope;
    tokenValue?: string;
}

export interface CreateUserApiTokenRequest {
    name: string;
    expirationDays: number;
    scope: ApiTokenScope;
}
