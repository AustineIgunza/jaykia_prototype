import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

export const PORT = process.env.PORT,
  DATABASE_URL = process.env.DATABASE_URL;
