// User Types
export interface CreateUserProps {
    email: string,
    username: string,
    password: string,
    name: string,
    isAdmin: boolean
}
export interface UpdateUserProps {
    email?: string,
    username?: string,
    password?: string,
    name?: string,
}
export interface UserQueryProps {
    username?: string;
    isAdmin?: string | boolean;
}
