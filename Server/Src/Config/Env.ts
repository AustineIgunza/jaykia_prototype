import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

export const PORT = process.env.PORT,
  DATABASE_URL = process.env.DATABASE_URL,
  JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN,
  GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_SIGNUP_REDIRECT_URI = process.env.GOOGLE_SIGNUP_REDIRECT_URI,
  GOOGLE_LOGIN_REDIRECT_URI = process.env.GOOGLE_LOGIN_REDIRECT_URI,
  MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET,
  MPESA_PASSKEY = process.env.MPESA_PASSKEY,
  MPESA_SHORTCODE = process.env.MPESA_SHORTCODE,
  MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL,
  PAYSTACK_SKEY = process.env.PAYSTACK_SECRET_KEY,
  MAILGUN_USER = process.env.MAILGUN_USERNAME,
  MAILGUN_PASSWORD = process.env.MAILGUN_PASSWORD;
