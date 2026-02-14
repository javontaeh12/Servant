/**
 * Escape HTML special characters to prevent XSS in HTML email bodies.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Strip CR/LF/tab characters from email header values to prevent header injection.
 */
export function sanitizeHeaderValue(str: string): string {
  return str.replace(/[\r\n\t]/g, "");
}
