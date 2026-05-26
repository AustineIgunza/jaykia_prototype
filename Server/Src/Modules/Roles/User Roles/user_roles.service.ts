import { ErrorMsg, Warning } from "../../../../Utilities/Logger.js";
import type { UserRoleRepo } from "./user_roles.repository.js";
import type {
  UserRole,
  UserRoleService,
  UserSpecificRoles,
  UserSpecificRolesWithPermissions,
} from "./user_roles.types.js";

export class UserRolesServ implements UserRoleService {
  constructor(private repo: UserRoleRepo) {}

  async createUserRole(userId: string, roleId: string): Promise<UserRole> {
    try {
      console.log(userId + " : " + roleId);
      if (!userId || !roleId)
        throw new Error("Incomplete credentials provided");

      const createUserRole = await this.repo.createUserRole(userId, roleId);

      return createUserRole;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<UserSpecificRoles> {
    try {
      if (!userId) throw new Error("User id must be provided");

      const retrievalUserRole = await this.repo.getUserRoles(userId);

      return retrievalUserRole;
    } catch (error) {
      Warning(`Error at getting user roles`);
      throw error;
    }
  }

  async getUserRolesWithPermissions(
    userId: string,
  ): Promise<UserSpecificRolesWithPermissions> {
    try {
      if (!userId) throw new Error("User id must be provided");

      const retrieveUserRolesPermissions =
        await this.repo.getUserRolesWithPermissions(userId);

      return retrieveUserRolesPermissions;
    } catch (error) {
      Warning("Error at getting user roles and permissions");
      throw error;
    }
  }

  async deleteUserRole(userId: string, roleId: string): Promise<void> {
    try {
      if (!userId || !roleId)
        throw new Error("User id and role id must be provided");

      await this.repo.deleteUserRole(userId, roleId);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
