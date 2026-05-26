export type RolePermission = {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
};

export type createRPermissionDTO = Omit<RolePermission, "id" | "created_at">;

export interface RolepermissionRepository {
  createRPermission: (
    roleId: string,
    permissionId: string,
  ) => Promise<RolePermission>;
  getRolePermissions: (roleId: string) => Promise<RolePermission[]>;
  deleteRolePermissions: (
    roleId: string,
    permissionId: string,
  ) => Promise<void>;
}
export interface RolepermissionService {
  createRPermission: (
    roleId: string,
    permissionId: string,
  ) => Promise<RolePermission>;
  getRolePermissions: (roleId: string) => Promise<RolePermission[]>;
  deleteRolePermissions: (
    roleId: string,
    permissionId: string,
  ) => Promise<void>;
}
