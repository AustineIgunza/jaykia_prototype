import * as https from "https";
import {
  MPESA_CALLBACK_URL,
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_PASSKEY,
  MPESA_SHORTCODE,
} from "./../../../../Config/Env.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalises a Kenyan phone number to the 254XXXXXXXXX format
 * that Safaricom's API requires.
 *   07XXXXXXXX  → 2547XXXXXXXX
 *   +2547XXXXXXXX → 2547XXXXXXXX
 *   2547XXXXXXXX  → unchanged
 */
export function normalisePhone(phone: string): string {
  const stripped = phone.replace(/\s+/g, "").replace(/^\+/, "");
  if (stripped.startsWith("0")) return `254${stripped.slice(1)}`;
  if (stripped.startsWith("254")) return stripped;
  throw new Error(`Unrecognised phone format: ${phone}`);
}

function getMpesaTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MpesaInternalService {
  private readonly baseUrl = "https://sandbox.safaricom.co.ke";

  // ── Token ──────────────────────────────────────────────────────────────────

  async generateToken(): Promise<string> {
    const auth = Buffer.from(
      `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
    ).toString("base64");

    return this.httpsGet<{ access_token: string }>(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      { Authorization: `Basic ${auth}`, Accept: "application/json" },
    ).then((data) => {
      if (!data.access_token) throw new Error("Failed to obtain M-Pesa token");
      return data.access_token;
    });
  }

  // ── STK Push ───────────────────────────────────────────────────────────────

  async initiateStkPush(
    phoneNumber: string,
    amount: number,
    paymentId: string,
  ): Promise<{ MerchantRequestID: string; CheckoutRequestID: string }> {
    const token = await this.generateToken();
    const timestamp = getMpesaTimestamp();
    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`,
    ).toString("base64");

    const normalised = normalisePhone(phoneNumber);

    const body = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount), // Safaricom rejects decimals
      PartyA: normalised,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: normalised,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: paymentId.slice(0, 12),
      TransactionDesc: "Booking Payment",
    };

    const response = await this.httpsPost<{
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResponseCode: string;
      ResponseDescription: string;
      errorCode?: string;
      errorMessage?: string;
    }>(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, body, {
      Authorization: `Bearer ${token}`,
    });

    if (response.errorCode || response.ResponseCode !== "0") {
      throw new Error(
        response.errorMessage ??
          response.ResponseDescription ??
          "STK Push failed",
      );
    }

    return {
      MerchantRequestID: response.MerchantRequestID,
      CheckoutRequestID: response.CheckoutRequestID,
    };
  }

  // ── Generic HTTPS helpers ──────────────────────────────────────────────────

  private httpsGet<T>(
    url: string,
    headers: Record<string, string>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: "GET",
          headers,
        },
        (res) => {
          let data = "";

          res.on("data", (chunk: Buffer) => {
            data += chunk.toString();
          });

          res.on("end", () => {
            console.log("STATUS:", res.statusCode);
            console.log("HEADERS:", res.headers);
            console.log("RAW RESPONSE:", data);

            // Handle empty responses
            if (!data.trim()) {
              return reject(new Error("Empty response received from server"));
            }

            try {
              const parsed = JSON.parse(data);

              // Handle HTTP errors
              if (res.statusCode && res.statusCode >= 400) {
                return reject(
                  new Error(
                    parsed.errorMessage ||
                      parsed.message ||
                      `HTTP Error ${res.statusCode}`,
                  ),
                );
              }

              resolve(parsed);
            } catch (error) {
              console.error("JSON Parse Error:", error);

              reject(new Error(`Failed to parse JSON response: ${data}`));
            }
          });
        },
      );

      req.on("error", (error) => {
        console.error("HTTPS Request Error:", error);
        reject(error);
      });

      req.end();
    });
  }

  private httpsPost<T>(
    url: string,
    body: object,
    extraHeaders: Record<string, string> = {},
  ): Promise<T> {
    const serialised = JSON.stringify(body);

    return new Promise((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(serialised),
            ...extraHeaders,
          },
        },
        (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk.toString();
          });

          res.on("end", () => {
            console.log("STATUS:", res.statusCode);
            console.log("RAW RESPONSE:", data);

            // Empty response protection
            if (!data.trim()) {
              return reject(new Error("Empty response from server"));
            }

            try {
              const parsed = JSON.parse(data);

              // HTTP failure protection
              if (res.statusCode && res.statusCode >= 400) {
                return reject(
                  new Error(
                    parsed.errorMessage ||
                      parsed.message ||
                      `HTTP Error ${res.statusCode}`,
                  ),
                );
              }

              resolve(parsed);
            } catch (error) {
              reject(new Error(`Failed to parse JSON response: ${data}`));
            }
          });
        },
      );

      req.on("error", (err) => {
        reject(err);
      });

      req.write(serialised);
      req.end();
    });
  }
}
