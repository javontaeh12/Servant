// Email utility — placeholder until an email service (e.g. Resend) is configured
// Previously used Gmail API via Google OAuth, which has been removed

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  console.log(`[EMAIL] To: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  console.log(`[EMAIL] Body length: ${html.length} chars`);
  console.warn(
    "[EMAIL] No email service configured. Message logged but not sent. Add RESEND_API_KEY to enable."
  );
}
