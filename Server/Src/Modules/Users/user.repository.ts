import type { QueryResult } from "pg";
import type { Database } from "../../Config/DB.js";
import type {
  createUserDTO,
  updateUserDTO,
  User,
  UserRepository,
} from "./user.types.js";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import bcrypt from "bcryptjs";

export class UserRepo implements UserRepository {
  constructor(private database: Database) {}

  async createUser(userDetails: createUserDTO): Promise<User> {
    try {
      let sqlQuery = userDetails.oauth
        ? "INSERT INTO users(username,email,password,oauth,oauth_provider) VALUES($1,$2,$3,$4,$5)"
        : "INSERT INTO users(username,email,password) VALUES($1,$2,$3)";

      const createUserQuery: QueryResult<User> =
          await this.database.query(sqlQuery),
        newUser = createUserQuery.rows[0];

      return newUser as User;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async editUser(userId: string, newUserDetails: updateUserDTO): Promise<User> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 2;

      for (let [key, value] of Object.entries(newUserDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        if (key == "password") values.push(bcrypt.hashSync(value, 10));
        else values.push(value);
      }

      const updateUserQuery: QueryResult<User> = await this.database.query(
          `UPDATE users SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
          [userId, ...values],
        ),
        updatedUser = updateUserQuery.rows[0];

      return updatedUser as User;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<User> {
    try {
      const getUserQuery: QueryResult<User> = await this.database.query(
          "SELECT * FROM users WHERE id=$1",
          [userId],
        ),
        retrievedUser = getUserQuery.rows[0];

      return retrievedUser as User;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const getUserQuery: QueryResult<User> = await this.database.query(
          "SELECT * FROM users",
        ),
        retrievedUser = getUserQuery.rows;

      return retrievedUser;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const date = new Date(),
        deletionTimestamp = date.toUTCString();

      await this.editUser(userId, {
        deleted_at: deletionTimestamp,
      });
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
