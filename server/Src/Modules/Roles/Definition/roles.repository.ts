import type { QueryResult } from "pg";
import { ErrorMsg } from "../../../../Utilities/Logger.js";
import type { Database } from "../../../Config/DB.js";
import type {
  createRoleDTO,
  Role,
  RoleRepository,
  updateRoleDTO,
} from "./roles.types.js";

export class RoleRepo implements RoleRepository {
  constructor(private db: Database) {}

  async createRole(details: createRoleDTO): Promise<Role> {
    try {
      const roleCreationQuery: QueryResult<Role> = await this.db.query(
          "INSERT INTO roles(role_name,role_description) VALUES($1,$2)",
          [details.name, details.description],
        ),
        createdRole = roleCreationQuery.rows;

      return createdRole[0] as Role;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
  async editRole(roleId: string, newDetails: updateRoleDTO): Promise<Role> {
    try {
      let keys: string[] = [],
        values: string[] = [],
        paramIndex: number = 2;

      for (let [key, value] of Object.entries(newDetails)) {
        keys.push(`${key}=${paramIndex++}`);
        values.push(value);
      }

      const editSQL = `UPDATE roles SET ${keys.join(",")} WHERE id=$1`,
        editQuery: QueryResult<Role> = await this.db.query(editSQL, [
          roleId,
          ...values,
        ]),
        editResult = editQuery.rows;

      return editResult[0] as Role;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const getQuery: QueryResult<Role> = await this.db.query(
        "SELECT * FROM roles",
      );

      return getQuery.rows;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      await this.db.query("DELETE FROM roles WHERE id=$1", [roleId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
