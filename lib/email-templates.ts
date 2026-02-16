import { escapeHtml } from "./sanitize";

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").trim();

interface BookingDetails {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  estimatedTotal: number;
}

export function adminNewBookingEmail(booking: BookingDetails): { subject: string; html: string } {
  const name = escapeHtml(booking.clientName);
  const email = escapeHtml(booking.clientEmail);
  const phone = escapeHtml(booking.clientPhone);
  const eventType = escapeHtml(booking.eventType);
  const eventDate = escapeHtml(booking.eventDate);

  return {
    subject: `New Catering Booking Request - ${booking.eventType}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #f59e0b; padding: 20px 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Booking Request</h1>
        </div>
        <div style="padding: 24px;">
          <p style="color: #374151; margin: 0 0 16px;">A new catering booking has been submitted and is awaiting your review.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px; width: 140px;">Client Name</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; font-weight: 600;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Email</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Phone</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Event Type</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px;">${eventType}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Date</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px;">${eventDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Guest Count</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px;">${booking.guestCount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Estimated Total</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; font-weight: 700;">$${booking.estimatedTotal.toFixed(2)}</td>
            </tr>
          </table>
          <a href="${baseUrl}/admin" style="display: inline-block; background: #087FB5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600;">Review in Admin Portal</a>
        </div>
        <div style="background: #f9fafb; padding: 16px 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated notification from I'm A Servant First LLC.</p>
        </div>
      </div>
    `,
  };
}

interface ClientConfirmationDetails {
  clientName: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  finalTotal: number;
  depositAmount: number;
  invoiceUrl: string;
}

export function clientConfirmationEmail(details: ClientConfirmationDetails): { subject: string; html: string } {
  const balanceAmount = details.finalTotal - details.depositAmount;
  const name = escapeHtml(details.clientName);
  const eventType = escapeHtml(details.eventType);
  const eventDate = escapeHtml(details.eventDate);
  const invoiceUrl = escapeHtml(details.invoiceUrl);

  return {
    subject: `Your Catering Booking is Confirmed! - ${details.eventType}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #059669; padding: 20px 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Booking Confirmed!</h1>
        </div>
        <div style="padding: 24px;">
          <p style="color: #374151; margin: 0 0 8px; font-size: 16px;">Hi ${name},</p>
          <p style="color: #374151; margin: 0 0 20px;">Great news! Your catering booking has been approved. Here are your booking details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px; width: 140px;">Event</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; font-weight: 600;">${eventType}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Date</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px;">${eventDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Guests</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px;">${details.guestCount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Total</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; font-weight: 700;">$${details.finalTotal.toFixed(2)}</td>
            </tr>
          </table>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
            <h3 style="color: #166534; margin: 0 0 8px; font-size: 14px;">Payment Schedule</h3>
            <p style="color: #15803d; margin: 0 0 4px; font-size: 14px;"><strong>Deposit:</strong> $${details.depositAmount.toFixed(2)} (due within 3 days)</p>
            <p style="color: #15803d; margin: 0; font-size: 14px;"><strong>Remaining Balance:</strong> $${balanceAmount.toFixed(2)} (due 3 days before event)</p>
          </div>
          <a href="${invoiceUrl}" style="display: inline-block; background: #087FB5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600;">View & Pay Invoice</a>
          <div style="margin-top: 20px;">
            <h3 style="color: #374151; margin: 0 0 8px; font-size: 14px;">Next Steps</h3>
            <ol style="color: #6b7280; font-size: 14px; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 4px;">Pay the deposit to secure your booking</li>
              <li style="margin-bottom: 4px;">We'll finalize the menu and details closer to the event</li>
              <li>Pay the remaining balance 3 days before the event</li>
            </ol>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 16px 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Questions? Reply to this email or contact us directly. We look forward to catering your event!</p>
        </div>
      </div>
    `,
  };
}
