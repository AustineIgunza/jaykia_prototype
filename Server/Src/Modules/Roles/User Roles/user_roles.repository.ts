import { ErrorMsg } from "../../../../Utilities/Logger.js";
import type { Database } from "../../../Config/DB.js";
import type {
  UserRole,
  UserRoleRepository,
  UserSpecificRoles,
} from "./user_roles.types.js";

export class UserRoleRepo implements UserRoleRepository {
  constructor(private db: Database) {}

  async createUserRole(userId: string, roleId: string): Promise<UserRole> {
    try {
      const sqlQuery = `INSERT INTO user_roles(user_id,role_id) VALUES($1,$2)`,
        createUserRoleQuery = await this.db.query(sqlQuery, [userId, roleId]),
        createUserRoleResult = createUserRoleQuery.rows;

      return createUserRoleResult[0];
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<UserSpecificRoles> {
    try {
      const sqlQuery = `SELECT * FROM user_roles ur INNER JOIN roles r ON ur.role_id=r.id`,
        getUserRoleQuery = await this.db.query(sqlQuery, [userId]),
        getUserRoleResult = getUserRoleQuery.rows;

      return {
        userId: userId,
        roles: getUserRoleResult,
      };
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteUserRole(userId: string, roleId: string): Promise<void> {
    try {
      const sqlQuery = `DELETE FROM user_roles WHERE user_id=$1 AND role_id=$2`;

      await this.db.query(sqlQuery, [userId, roleId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
