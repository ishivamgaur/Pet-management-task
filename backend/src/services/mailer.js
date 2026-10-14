const ENDPOINT = "https://api.resend.com/emails";

// Resend is reached over plain HTTPS on port 443, so no host can block it
// the way Render's free tier blocks outbound SMTP on ports 25, 465 and 587.
// Sending is best effort: a provider outage must never undo a decision the
// shelter has already made and returned.
async function sendMail({ to, subject, text, html }) {
  if (!isMailConfigured()) {
    console.warn(`[mail] RESEND_API_KEY not set, skipped email to ${to}`);
    return null;
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "PawHome <onboarding@resend.dev>",
      to: [to],
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend responded ${response.status}: ${detail}`);
  }

  const { id } = await response.json();
  console.log(`[mail] sent to ${to}: ${id}`);
  return id;
}

function isMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

// Printed once on boot so a missing key shows up at deploy time rather than
// the first time somebody approves an application.
function describeMailer() {
  if (!isMailConfigured()) return "disabled, RESEND_API_KEY is not set";
  return `Resend, sending as ${process.env.EMAIL_FROM || "onboarding@resend.dev"}`;
}

module.exports = { sendMail, isMailConfigured, describeMailer };