export type UserRole =
 | 'ADMIN'
 | 'STAFF'
 | 'HORSE_OWNER'
 | 'JOCKEY'
 | 'TRAINER'
 | 'REFEREE'
 | 'USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface User {
 id: number;
 username: string;
 email: string;
 fullName?: string;
 phoneNumber?: string;
 avatarUrl?: string;
 role: UserRole;
 status: UserStatus;
 createdAt?: string;
}

export interface LoginPayload {
 username: string;
 password: string;
}

export interface LoginResult {
 accessToken: string;
 tokenType: string;
 user: User;
}

export interface RegisterPayload {
 username: string;
 email: string;
 password: string;
 fullName?: string;
 phoneNumber?: string;
 role?: UserRole;
}

export interface UserListParams {
 page?: number;
 size?: number;
 keyword?: string;
 role?: UserRole;
 status?: UserStatus;
}

export interface UpdateInfoPayload {
 fullName?: string;
 phoneNumber?: string;
}
