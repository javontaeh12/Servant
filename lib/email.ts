import nodemailer from "nodemailer";

const FROM_EMAIL = process.env.ADMIN_EMAIL || "imaservantfirst07@gmail.com";
const BUSINESS_NAME = "I'm A Servant First Catering";

function getTransporter() {
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!appPassword) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: FROM_EMAIL,
      pass: appPassword,
    },
  });
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[EMAIL] No GMAIL_APP_PASSWORD configured. Email not sent.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${BUSINESS_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[EMAIL] Failed to send:", err);
  }
}

// ========== Notification Templates ==========

export async function notifyAdminNewBooking(booking: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  eventType: string;
  serviceStyle: string;
  notes: string;
}): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const date = new Date(booking.eventDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  await sendEmail(
    adminEmail,
    `New Booking Request - ${booking.clientName}`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e293b; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">${BUSINESS_NAME}</h1>
        <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">New Booking Request</p>
      </div>
      <div style="padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 16px; font-size: 15px;">A new booking request has been submitted:</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 120px;">Client</td><td style="padding: 8px 0; font-weight: 600;">${booking.clientName}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;">${booking.clientEmail}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Phone</td><td style="padding: 8px 0;">${booking.clientPhone || "Not provided"}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Date</td><td style="padding: 8px 0; font-weight: 600;">${date}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Time</td><td style="padding: 8px 0;">${booking.eventTime}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Guests</td><td style="padding: 8px 0;">${booking.guestCount}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Event Type</td><td style="padding: 8px 0;">${booking.eventType}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Service</td><td style="padding: 8px 0;">${booking.serviceStyle}</td></tr>
          ${booking.notes ? `<tr><td style="padding: 8px 0; color: #64748b;">Notes</td><td style="padding: 8px 0;">${booking.notes}</td></tr>` : ""}
        </table>
        <div style="margin-top: 24px; text-align: center;">
          <a href="https://iasfcatering.com/admin" style="display: inline-block; background: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">Review in Admin Portal</a>
        </div>
      </div>
    </div>
    `
  );
}

export async function notifyClientBookingConfirmed(booking: {
  clientName: string;
  clientEmail: string;
  eventDate: string;
  eventTime: string;
  eventType: string;
  invoiceUrl?: string | null;
  finalTotal?: number;
  depositAmount?: number;
}): Promise<void> {
  const date = new Date(booking.eventDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const invoiceSection = booking.invoiceUrl
    ? `<div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #166534;">Invoice Ready</p>
        ${booking.finalTotal ? `<p style="margin: 0 0 4px; font-size: 14px; color: #166534;">Total: $${booking.finalTotal.toFixed(2)}</p>` : ""}
        ${booking.depositAmount ? `<p style="margin: 0 0 12px; font-size: 14px; color: #166534;">Deposit Due: $${booking.depositAmount.toFixed(2)}</p>` : ""}
        <a href="${booking.invoiceUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 10px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">View & Pay Invoice</a>
      </div>`
    : "";

  await sendEmail(
    booking.clientEmail,
    `Booking Confirmed - ${BUSINESS_NAME}`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e293b; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">${BUSINESS_NAME}</h1>
        <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Booking Confirmed</p>
      </div>
      <div style="padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 16px; font-size: 15px;">Hi ${booking.clientName.split(" ")[0]},</p>
        <p style="margin: 0 0 16px; font-size: 15px;">Great news! Your booking has been <strong style="color: #16a34a;">confirmed</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 120px;">Event</td><td style="padding: 8px 0; font-weight: 600;">${booking.eventType}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Date</td><td style="padding: 8px 0; font-weight: 600;">${date}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Time</td><td style="padding: 8px 0;">${booking.eventTime}</td></tr>
        </table>
        ${invoiceSection}
        <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8;">Questions? Reply to this email or call us directly.</p>
      </div>
    </div>
    `
  );
}

export async function notifyClientBookingRejected(booking: {
  clientName: string;
  clientEmail: string;
  eventDate: string;
  eventType: string;
}): Promise<void> {
  const date = new Date(booking.eventDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  await sendEmail(
    booking.clientEmail,
    `Booking Update - ${BUSINESS_NAME}`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e293b; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">${BUSINESS_NAME}</h1>
        <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Booking Update</p>
      </div>
      <div style="padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 16px; font-size: 15px;">Hi ${booking.clientName.split(" ")[0]},</p>
        <p style="margin: 0 0 16px; font-size: 15px;">Unfortunately, we're unable to accommodate your booking for <strong>${booking.eventType}</strong> on <strong>${date}</strong> at this time.</p>
        <p style="margin: 0 0 16px; font-size: 15px;">We'd love to help you find an alternative date. Please feel free to submit a new request or contact us directly.</p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://iasfcatering.com/quote" style="display: inline-block; background: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">Request New Date</a>
        </div>
        <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8;">Questions? Reply to this email or call us directly.</p>
      </div>
    </div>
    `
  );
}
