"use server";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return null;
  }

  return { apiKey, from };
}

export async function sendEmail(payload: EmailPayload) {
  const config = getEmailConfig();
  if (!config) {
    return { error: "Email provider is not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    return { error: message || "Email delivery failed" };
  }

  return { error: null };
}
