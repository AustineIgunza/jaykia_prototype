export type UserRole = {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
};

export type UserSpecificRoles = {
  userId: string;
  roles: string[];
};

export type createUserRoleDTO = Pick<UserRole, "user_id" | "role_id">;

export interface UserRoleRepository {
  createUserRole: (userId: string, roleId: string) => Promise<UserRole>;
  getUserRoles: (userId: string) => Promise<UserSpecificRoles>;
  deleteUserRole: (userId: string, roleId: string) => Promise<void>;
}

export interface UserRoleService {
  createUserRole: (userId: string, roleId: string) => Promise<UserRole>;
  getUserRoles: (userId: string) => Promise<UserSpecificRoles>;
  deleteUserRole: (userId: string, roleId: string) => Promise<void>;
}
