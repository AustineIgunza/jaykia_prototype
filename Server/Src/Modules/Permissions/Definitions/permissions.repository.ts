import { constrainedMemory } from "process";
import type {
  createPermissionDTO,
  Permission,
  PermissionRepository,
  updatePermissionDTO,
} from "./permissions.types.js";
import type { Database } from "../../../Config/DB.js";
import { ErrorMsg } from "../../../../Utilities/Logger.js";
import type { QueryResult } from "pg";

export class PermissionRepo implements PermissionRepository {
  constructor(private db: Database) {}

  async createPermission(
    permissionDetails: createPermissionDTO,
  ): Promise<Permission> {
    try {
      const { name, description } = permissionDetails;

      const sqlQuery =
          "INSERT INTO permissions(name,description) VALUES($1,$2)",
        permissionCreation = await this.db.query(sqlQuery, [name, description]),
        permissionResult = permissionCreation.rows[0];

      return permissionResult;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async editPermission(
    permissionDetails: updatePermissionDTO,
  ): Promise<Permission> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 1;

      for (let [key, value] of Object.entries(permissionDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const sqlQuery: string = `UPDATE permissions SET ${keys.join(",")}`,
        editQuery: QueryResult<Permission> = await this.db.query(sqlQuery, [
          ...values,
        ]),
        editResult = editQuery.rows[0];

      return editResult!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getAllPermission(): Promise<Permission[]> {
    try {
      const sqlQuery: string = "SELECT * FROM permissions",
        getQuery: QueryResult<Permission> = await this.db.query(sqlQuery),
        getResult = getQuery.rows;

      return getResult;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getPermission(permissionId: string): Promise<Permission> {
    try {
      const sqlQuery: string = "SELECT * FROM permissions WHERE id=$1",
        getQuery: QueryResult<Permission> = await this.db.query(sqlQuery, [
          permissionId,
        ]),
        getResult = getQuery.rows[0];

      return getResult!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deletePermission(permissionId: string): Promise<void> {
    try {
      const sqlQuery: string = "DELETE FROM permissions WHERE id=$1";

      await this.db.query(sqlQuery, [permissionId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
