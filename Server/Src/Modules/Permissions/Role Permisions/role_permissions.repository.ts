import type { QueryResult } from "pg";
import { ErrorMsg } from "../../../../Utilities/Logger.js";
import type { Database } from "../../../Config/DB.js";
import type {
  RolePermission,
  RolepermissionRepository,
} from "./role_permissions.types.js";

export class RolePermissionRepo implements RolepermissionRepository {
  constructor(private db: Database) {}

  async createRPermission(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission> {
    try {
      const sqlQuery: string = `INSERT INTO role_permissions(role_id,permission_id) VALUES($1,$2) RETURNING *`,
        createQuery: QueryResult<RolePermission> = await this.db.query(
          sqlQuery,
          [roleId, permissionId],
        ),
        createRow: RolePermission = createQuery.rows[0]!;

      return createRow;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    try {
      const sqlQuery: string = `SELECT p.* FROM role_permissions rp 
          INNER JOIN permissions p ON rp.permission_id = p.id 
          WHERE rp.role_id = $1`,
        selectQuery: QueryResult<RolePermission> = await this.db.query(
          sqlQuery,
          [roleId],
        ),
        selectRow: RolePermission[] = selectQuery.rows;

      return selectRow;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteRolePermissions(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    try {
      const sqlQuery: string = `DELETE FROM role_permissions WHERE role_id=$1 AND permission_id=$2`;

      await this.db.query(sqlQuery, [roleId, permissionId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
