import type { Permission } from "../../Permissions/Definitions/permissions.types.js";

export type Role = {
  id: string;
  name: string;
  description: string;
};

export type createRoleDTO = Omit<Role, "id">;
export type updateRoleDTO = Partial<Omit<Role, "id">>;

export type RoleWithPermissions = {
  roleId: string;
  roleName: string;
  roleDescription: string | null;
  permissions: Permission[];
};

export interface RoleRepository {
  createRole: (details: createRoleDTO) => Promise<Role>;
  editRole: (roleId: string, newDetails: updateRoleDTO) => Promise<Role>;
  getRoles: () => Promise<Role[]>;
  deleteRole: (roleId: string) => Promise<void>;
  getRoleWithPermissions: (roleId: string) => Promise<RoleWithPermissions>;
}
export interface RoleService {
  createRole: (details: createRoleDTO) => Promise<Role>;
  editRole: (roleId: string, newDetails: updateRoleDTO) => Promise<Role>;
  getRoles: () => Promise<Role[]>;
  deleteRole: (roleId: string) => Promise<void>;
  getRoleWithPermissions: (roleId: string) => Promise<RoleWithPermissions>;
}
