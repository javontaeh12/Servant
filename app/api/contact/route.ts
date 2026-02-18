import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/gmail";
import { readBusiness } from "@/lib/business-storage";
import { checkRateLimit } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!checkRateLimit(`contact:${ip}`, 3, 60000)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const business = await readBusiness();
    const adminEmail =
      business.email ||
      process.env.ALLOWED_ADMIN_EMAILS?.split(",")[0]?.trim();

    if (!adminEmail) {
      return NextResponse.json(
        { success: false, error: "No admin email configured." },
        { status: 500 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "Not provided");
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    const subject = `New Contact Form Message from ${name}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #4B9CD3; padding: 20px 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Contact Message</h1>
        </div>
        <div style="padding: 24px;">
          <p style="color: #374151; margin: 0 0 16px;">Someone reached out through your website contact form.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px; width: 100px;">Name</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; font-weight: 600;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Email</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px;"><a href="mailto:${safeEmail}" style="color: #087FB5;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Phone</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px;">${safePhone}</td>
            </tr>
          </table>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">Message</p>
            <p style="color: #111827; font-size: 14px; line-height: 1.6; margin: 0;">${safeMessage}</p>
          </div>
          <a href="mailto:${safeEmail}" style="display: inline-block; background: #087FB5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600;">Reply to ${safeName}</a>
        </div>
        <div style="background: #f9fafb; padding: 16px 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">This message was sent from the contact form on your website.</p>
        </div>
      </div>
    `;

    await sendEmail(adminEmail, subject, html);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message." },
      { status: 500 }
    );
  }
}
