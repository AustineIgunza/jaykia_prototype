import { Warning } from "../../../../Utilities/Logger.js";
import type {
  UserPermission,
  UserpermissionRepository,
  UserpermissionService,
} from "./user_permissions.types.js";

export class UserPermissionServ implements UserpermissionService {
  constructor(private UPRepo: UserpermissionRepository) {}

  async createUPermission(
    userId: string,
    permissionId: string,
  ): Promise<UserPermission> {
    try {
      if (!userId || !permissionId)
        throw new Error("User id and permission id must be provided");

      const userPCreation: UserPermission = await this.UPRepo.createUPermission(
        userId,
        permissionId,
      );

      return userPCreation;
    } catch (error) {
      Warning(`Error at user creation permission`);
      throw error;
    }
  }
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    try {
      if (!userId) throw new Error("User id must be provided");

      const userPRetrieval = await this.UPRepo.getUserPermissions(userId);

      return userPRetrieval;
    } catch (error) {
      Warning(`Error at getting user permission`);
      throw error;
    }
  }
  async deleteUPermissions(
    userId: string,
    permissionId: string,
  ): Promise<void> {
    try {
      if (!userId || !permissionId)
        throw new Error("User id and permission id must be provided");

      await this.UPRepo.deleteUPermissions(userId, permissionId);
    } catch (error) {
      Warning(`Error at deleting user permission`);
      throw error;
    }
  }
}
