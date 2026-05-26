import { ErrorMsg } from "../../../../Utilities/Logger.js";
import type { Database } from "../../../Config/DB.js";
import type {
  UserRole,
  UserRoleRepository,
  UserSpecificRoles,
  UserSpecificRolesWithPermissions,
} from "./user_roles.types.js";

export class UserRoleRepo implements UserRoleRepository {
  constructor(private db: Database) {}

  async createUserRole(userId: string, roleId: string): Promise<UserRole> {
    try {
      const sqlQuery = `INSERT INTO user_roles(user_id,role_id) VALUES($1,$2) RETURNING *`,
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
      const sqlQuery = `SELECT * FROM user_roles ur INNER JOIN roles r ON ur.role_id=r.id WHERE ur.user_id=$1`,
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

  async getUserRolesWithPermissions(
    userId: string,
  ): Promise<UserSpecificRolesWithPermissions> {
    const sqlString = `
      SELECT
        r.id                AS "roleId",
        r.role_name         AS "roleName",
        r.role_description  AS "roleDescription",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'permissionId', p.id,
              'name',         p.name,
              'description',  p.description
            ) ORDER BY p.name
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS permissions
      FROM user_roles ur
      JOIN roles             r  ON r.id  = ur.role_id
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions      p  ON p.id = rp.permission_id
      WHERE ur.user_id = $1
      GROUP BY r.id, r.role_name, r.role_description
      ORDER BY r.role_name
    `,
      sqlQuery = await this.db.query(sqlString, [userId]);

    return {
      userId,
      roles: sqlQuery.rows,
    };
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
