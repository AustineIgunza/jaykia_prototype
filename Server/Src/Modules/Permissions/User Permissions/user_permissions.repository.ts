import type { QueryResult } from "pg";
import { ErrorMsg } from "../../../../Utilities/Logger.js";
import type { Database } from "../../../Config/DB.js";
import type {
  UserPermission,
  UserpermissionRepository,
} from "./user_permissions.types.js";

export class UserPermissionRepo implements UserpermissionRepository {
  constructor(private db: Database) {}

  async createUPermission(
    userId: string,
    permissionId: string,
  ): Promise<UserPermission> {
    try {
      const sqlQuery: string = `INSERT INTO user_permissions(user_id,permission_id) VALUES($1,$2)`,
        createQuery: QueryResult<UserPermission> = await this.db.query(
          sqlQuery,
          [userId, permissionId],
        ),
        createRow: UserPermission = createQuery.rows[0]!;

      return createRow;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    try {
      const sqlQuery: string = `SELECT * FROM user_permissions WHERE user_id=$1`,
        selectQuery: QueryResult<UserPermission> = await this.db.query(
          sqlQuery,
          [userId],
        ),
        selectRow: UserPermission[] = selectQuery.rows;

      return selectRow;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteUPermissions(
    userId: string,
    permissionId: string,
  ): Promise<void> {
    try {
      const sqlQuery: string = `DELETE FROM user_permission WHERE user_id=$1 AND permission_id=$2`;

      await this.db.query(sqlQuery, [userId, permissionId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
