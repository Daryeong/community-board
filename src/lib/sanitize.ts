import "server-only";

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

export function sanitizeText(text: string): string {
  return escapeHtml(text.trim());
}

export function sanitizeNotificationMessage(message: string): string {
  return escapeHtml(message.slice(0, 200));
}

const ALLOWED_TAGS = new Set(["b", "i", "u", "em", "strong", "p", "br", "a"]);
const ALLOWED_ATTRS = new Set(["href", "title"]);

export function sanitizeHtml(html: string): string {
  let result = html;
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  result = result.replace(/on\w+\s*=\s*"[^"]*"/gi, "");
  result = result.replace(/on\w+\s*=\s*'[^']*'/gi, "");
  result = result.replace(/javascript\s*:/gi, "");
  return result;
}
