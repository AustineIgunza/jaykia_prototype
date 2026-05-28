import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import { MAILGUN_USER, MAILGUN_PASSWORD } from "../Src/Config/Env.js";

export type BookingMail = {
  bookingId: string;
  name: string;
  date: string;
  passengers: number;
  luggageItems: number;
  departureTime: string;
  arrivalTime: string;
  action: "created" | "updated" | "deleted";
};

const transporter = nodemailer.createTransport({
  host: "smtp.eu.mailgun.org",
  port: 587,
  secure: false,
  auth: {
    user: MAILGUN_USER,
    pass: MAILGUN_PASSWORD,
  },
});

export async function sendMail(userEmail: string, bookingDetails: BookingMail) {
  try {
    const mailInfo: SMTPTransport.SentMessageInfo = await transporter.sendMail({
      from: "no-reply@ferracorp.com",
      to: userEmail,
      subject: "JayKia - Authentication Code",
      text: "Authentication",
      html: `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:40px 0;background-color:#f4f6f8;">
      <tr>
        <td align="center">

          <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:10px;padding:30px;">

            <!-- Header -->
            <tr>
              <td align="center" style="font-size:22px;font-weight:bold;color:#111;">
                Booking ${bookingDetails.action}
              </td>
            </tr>

            <tr>
              <td style="padding-top:10px;font-size:14px;color:#555;text-align:center;">
                Your booking has been successfully confirmed. Here are your trip details.
              </td>
            </tr>

            <!-- Status Badge -->
            <tr>
              <td align="center" style="padding:20px 0;">
                <span style="
                  background:#facc15;
                  color:#111;
                  font-weight:bold;
                  padding:6px 12px;
                  border-radius:20px;
                  font-size:12px;
                  letter-spacing:1px;
                ">
                  CONFIRMED
                </span>
              </td>
            </tr>

            <!-- Booking Details -->
            <tr>
              <td style="padding:10px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333;">

                  <tr>
                    <td style="padding:8px 0;color:#777;">Booking ID</td>
                    <td style="padding:8px 0;text-align:right;font-weight:bold;">
                      ${bookingDetails.bookingId}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0;color:#777;">Name</td>
                    <td style="padding:8px 0;text-align:right;">
                      ${bookingDetails.name}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0;color:#777;">Date</td>
                    <td style="padding:8px 0;text-align:right;">
                      ${bookingDetails.date}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0;color:#777;">Passengers</td>
                    <td style="padding:8px 0;text-align:right;">
                      ${bookingDetails.passengers}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0;color:#777;">Luggage Items</td>
                    <td style="padding:8px 0;text-align:right;">
                      ${bookingDetails.luggageItems}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0;color:#777;">Departure Time</td>
                    <td style="padding:8px 0;text-align:right;">
                      ${bookingDetails.departureTime}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0;color:#777;">Arrival Time</td>
                    <td style="padding:8px 0;text-align:right;">
                      ${bookingDetails.arrivalTime}
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:20px 0;border-top:1px solid #eee;"></td>
            </tr>

            <!-- Note -->
            <tr>
              <td style="font-size:13px;color:#777;text-align:center;">
                Please arrive at least 10 minutes before departure time.<br/>
                If you need to make changes, contact support immediately.
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding-top:25px;font-size:12px;color:#aaa;text-align:center;">
                © 2026 JayKia
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>`,
    });

    console.log("Message sent: %s", mailInfo.messageId);
  } catch (error) {
    throw error;
  }
}
