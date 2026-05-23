export type UserPermission = {
  id: string;
  user_id: string;
  permission_id: string;
  created_at: string;
};

export type createUPermissionDTO = Omit<UserPermission, "id" | "created_at">;

export interface UserpermissionRepository {
  createUPermission: (
    userId: string,
    permissionId: string,
  ) => Promise<UserPermission>;
  getUserPermissions: (userId: string) => Promise<UserPermission[]>;
  deleteUPermissions: (userId: string, permissionId: string) => Promise<void>;
}
export interface UserpermissionService {
  createUPermission: (
    userId: string,
    permissionId: string,
  ) => Promise<UserPermission>;
  getUserPermissions: (userId: string) => Promise<UserPermission[]>;
  deleteUPermissions: (userId: string, permissionId: string) => Promise<void>;
}
