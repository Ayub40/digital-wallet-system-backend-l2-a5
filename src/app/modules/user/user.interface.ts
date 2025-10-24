import { Types } from "mongoose";

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    AGENT = "AGENT"
}

export interface IAuthProvider {
    provider: "google" | "credentials";  // "Google", "Credential"
    providerId: string;
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
};

export enum IsAgentStatus {
    APPROVED = "APPROVED",
    SUSPENDED = "SUSPENDED"
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phone?: string;
    isDeleted?: boolean,
    isActive?: IsActive,
    isVerified?: boolean,
    role: Role;
    isApproved: boolean,
    isAgentStatus?: IsAgentStatus,
    auths: IAuthProvider[];
    wallet?: Types.ObjectId,
}
