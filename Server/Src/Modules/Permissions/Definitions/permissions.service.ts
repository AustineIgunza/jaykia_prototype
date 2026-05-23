import { Warning } from "../../../../Utilities/Logger.js";
import type { PermissionRepo } from "./permissions.repository.js";
import type {
  createPermissionDTO,
  Permission,
  PermissionServ,
  updatePermissionDTO,
} from "./permissions.types.js";

export class PermissionService implements PermissionServ {
  constructor(private permissionRepo: PermissionRepo) {}

  async createPermission(
    permissionDetails: createPermissionDTO,
  ): Promise<Permission> {
    try {
      if (!permissionDetails)
        throw new Error("Permission details not provided");

      const allowedFields: string[] = ["name", "description"];
      let filteredPermissionDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(permissionDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.length <= 0)
          throw new Error(`${key} has an empty value`);

        filteredPermissionDetails[key] = value;
      }

      const permissionCreation: Permission =
        await this.permissionRepo.createPermission(
          filteredPermissionDetails as createPermissionDTO,
        );

      return permissionCreation;
    } catch (error) {
      Warning(`Error at creating permission`);
      throw error;
    }
  }

  async editPermission(
    permissionDetails: updatePermissionDTO,
  ): Promise<Permission> {
    try {
      if (!permissionDetails)
        throw new Error("Permission details not provided");

      const allowedFields: string[] = ["name", "description"];
      let filteredPermissionDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(permissionDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.length <= 0)
          throw new Error(`${key} has an empty value`);

        filteredPermissionDetails[key] = value;
      }

      const permissionCreation: Permission =
        await this.permissionRepo.editPermission(
          filteredPermissionDetails as updatePermissionDTO,
        );

      return permissionCreation;
    } catch (error) {
      Warning(`Error at editing permission`);
      throw error;
    }
  }

  async getPermission(permissionId: string): Promise<Permission> {
    try {
      if (!permissionId) throw new Error("Permission id not provided");

      const retrievalQuery: Permission =
        await this.permissionRepo.getPermission(permissionId);

      return retrievalQuery;
    } catch (error) {
      Warning(`Error at getting a permission`);
      throw error;
    }
  }

  async getAllPermission(): Promise<Permission[]> {
    try {
      const retrievalQuery: Permission[] =
        await this.permissionRepo.getAllPermission();

      return retrievalQuery;
    } catch (error) {
      Warning(`Error at getting all permission`);
      throw error;
    }
  }
  async deletePermission(permissionId: string): Promise<void> {
    try {
      await this.permissionRepo.deletePermission(permissionId);
    } catch (error) {
      Warning(`Error at deleting permission`);
      throw error;
    }
  }
}
