import { google } from "googleapis";
import { getGmailOAuth2Client } from "./google-calendar";
import { sanitizeHeaderValue } from "./sanitize";
import { readBusiness } from "./business-storage";

export async function sendEmail(to: string, subject: string, htmlBody: string) {
  const auth = await getGmailOAuth2Client();
  const gmail = google.gmail({ version: "v1", auth });

  const business = await readBusiness();
  const fromEmail = sanitizeHeaderValue(
    business.email || process.env.ALLOWED_ADMIN_EMAILS?.split(",")[0]?.trim() || "noreply@example.com"
  );
  const safeTo = sanitizeHeaderValue(to);
  const safeSubject = sanitizeHeaderValue(subject);

  const messageParts = [
    `From: I'm A Servant First LLC <${fromEmail}>`,
    `To: ${safeTo}`,
    `Subject: ${safeSubject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    htmlBody,
  ];

  const message = messageParts.join("\r\n");

  // Base64url encode the message
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
}
