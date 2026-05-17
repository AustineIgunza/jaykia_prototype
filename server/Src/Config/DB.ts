import { Pool, type QueryResult } from "../../node_modules/@types/pg/index.js";
import { DATABASE_URL } from "./Env.js";
import { ErrorMsg } from "../../Utilities/Logger.js";

export class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: DATABASE_URL,
    });
  }

  async query(query: string, args?: any[]) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result: QueryResult<any> = await client.query(query, args);
      await client.query("COMMIT");

      return result;
    } catch (error) {
      ErrorMsg(error as Error);
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
