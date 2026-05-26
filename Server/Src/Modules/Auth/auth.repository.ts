import { ErrorMsg } from "../../../Utilities/Logger.js";
import type { Database } from "../../Config/DB.js";
import type { User } from "../Users/user.types.js";
import bcrypt from "bcryptjs";
import type {
  AuthRepository,
  LegacySignupDetails,
  LegacyLoginDetails,
  authType,
  OAuthSignupDetails,
  OAuthLoginDetails,
} from "./auth.types.js";
import type { QueryResult } from "pg";

export class AuthRepo implements AuthRepository {
  constructor(private db: Database) {}

  async registerUser(
    authType: authType,
    userDetails: LegacySignupDetails | OAuthSignupDetails,
  ): Promise<User> {
    try {
      let sqlQuery: string = "",
        values: any[] = [];

      if (authType == "oauth") {
        sqlQuery = `INSERT INTO users(username,email,oauth,oauth_provider) VALUES($1,$2,$3,$4) RETURNING *`;

        const { username, email, oauth_provider } =
          userDetails as OAuthSignupDetails;
        values = [username, email, true, oauth_provider];
      } else {
        sqlQuery = `INSERT INTO users(username,email,password,oauth) VALUES($1,$2,$3,$4) RETURNING *`;

        const { username, email, password } =
            userDetails as LegacySignupDetails,
          hashedPassword = bcrypt.hashSync(password, 10);
        values = [username, email, hashedPassword, false];
      }

      const insertUserQuery = await this.db.query(sqlQuery, values),
        newUser = insertUserQuery.rows[0];

      return newUser;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async loginUser(
    authType: authType,
    userDetails: LegacyLoginDetails | OAuthLoginDetails,
  ): Promise<User> {
    try {
      const sqlQuery: string = "SELECT * FROM users WHERE email=$1",
        userRetrieval: QueryResult<User> = await this.db.query(sqlQuery, [
          userDetails.email,
        ]),
        userObject = userRetrieval.rows[0];

      if (!userObject) throw new Error("User does not exist");

      if (authType == "legacy") {
        if (
          !bcrypt.compareSync(
            (userDetails as LegacyLoginDetails).password,
            userObject?.password,
          )
        )
          throw new Error("Incorrect password");
        return userObject;
      } else {
        if (
          (userDetails as OAuthLoginDetails).oauth_provider !=
          userObject.oauth_provider
        )
          throw new Error(
            `Invalid oauth provider, try ${userObject.oauth_provider}`,
          );

        return userObject;
      }
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
