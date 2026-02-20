import { Resend } from "resend";

// ── Resend instance — server-side only ────────────────────────
export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "giving@zakatfoundation.org";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ── Send donation receipt ─────────────────────────────────────
export async function sendDonationReceipt(params: {
  to:            string;
  donorName:     string | null;
  amount:        number;
  currency:      string;
  campaignTitle: string | null;
  campaignSlug:  string | null;
  reference:     string;
  isRecurring:   boolean;
}) {
  const {
    to,
    donorName,
    amount,
    currency,
    campaignTitle,
    campaignSlug,
    reference,
    isRecurring,
  } = params;

  const name        = donorName ?? "Friend";
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: currency.toUpperCase(),
  }).format(amount);

  const campaignLine = campaignTitle
    ? `<p style="color:#B8B3AC;margin:0 0 8px 0;">Campaign: <strong style="color:#F0EDE8;">${campaignTitle}</strong></p>`
    : "";

  const campaignLink = campaignSlug
    ? `<a href="${SITE_URL}/campaigns/${campaignSlug}" style="color:#C9952A;">View campaign →</a>`
    : "";

  const recurringNote = isRecurring
    ? `<p style="color:#B8B3AC;font-size:13px;margin-top:16px;">This is a monthly recurring donation. You can manage your subscription by contacting us at ${FROM}.</p>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#161616;border:1px solid #2A2A2A;border-radius:12px;overflow:hidden;max-width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1F1F1F;padding:28px 36px;border-bottom:1px solid #2A2A2A;">
              <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#C9952A;">
                Zakat Foundation of America
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px;">
              <h1 style="margin:0 0 8px 0;font-size:28px;font-weight:600;color:#F0EDE8;line-height:1.2;">
                Thank you, ${name}.
              </h1>
              <p style="margin:0 0 28px 0;font-size:15px;color:#B8B3AC;line-height:1.6;">
                Your generosity makes our work possible. May Allah accept your giving.
              </p>

              <!-- Donation summary box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1F1F1F;border:1px solid #2A2A2A;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#706B63;">Amount donated</p>
                    <p style="margin:0 0 16px 0;font-size:32px;font-weight:700;color:#F0EDE8;font-family:monospace;">${formattedAmount}</p>
                    ${campaignLine}
                    <p style="color:#706B63;font-size:12px;margin:8px 0 0 0;">Reference: <span style="color:#B8B3AC;font-family:monospace;">${reference}</span></p>
                  </td>
                </tr>
              </table>

              ${campaignLink ? `<p style="margin:0 0 24px 0;">${campaignLink}</p>` : ""}

              <p style="color:#B8B3AC;font-size:14px;line-height:1.6;margin:0 0 8px 0;">
                Your donation is tax-deductible to the extent permitted by law.
                Please retain this email as your donation receipt.
              </p>

              ${recurringNote}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;border-top:1px solid #2A2A2A;">
              <p style="margin:0;font-size:12px;color:#706B63;line-height:1.6;">
                Zakat Foundation of America · Questions? Reply to this email or contact us at
                <a href="mailto:${FROM}" style="color:#C9952A;">${FROM}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from:    `Zakat Foundation <${FROM}>`,
    to,
    subject: `Donation receipt — ${formattedAmount} · Zakat Foundation of America`,
    html,
  });
}

// ── Send newsletter broadcast ─────────────────────────────────
export async function sendNewsletter(params: {
  to:      string[];
  subject: string;
  html:    string;
}) {
  // Resend batch send — max 100 per call
  const chunks = chunkArray(params.to, 100);
  const results = [];

  for (const chunk of chunks) {
    const result = await resend.emails.send({
      from:    `Zakat Foundation <${FROM}>`,
      to:      chunk,
      subject: params.subject,
      html:    params.html,
    });
    results.push(result);
  }

  return results;
}

// ── Helper: chunk array into groups ──────────────────────────
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}