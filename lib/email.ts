type EmailInput = { to: string | string[]; subject: string; html: string };

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[character] || character));
}

export async function sendEmail(input: EmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("Email skipped: RESEND_API_KEY or EMAIL_FROM is not configured.");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, ...input }),
  });
  if (!response.ok) {
    console.error("Email delivery failed:", response.status, await response.text());
    return false;
  }
  return true;
}

export function emailLayout(title: string, content: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033"><div style="background:#0ea5e9;color:#fff;padding:22px;border-radius:12px 12px 0 0"><strong>NoveltyScholars</strong></div><div style="padding:28px;border:1px solid #dbe4ee;border-top:0"><h1 style="font-size:22px">${escapeHtml(title)}</h1>${content}<p style="margin-top:28px;color:#64748b;font-size:13px">Need help? Reply to this email or visit our support page.</p></div></div>`;
}
