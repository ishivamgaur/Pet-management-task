// Plain HTML email. No template engine, because there is exactly one shape
// of message and a template engine would be more code than the template.
const BRAND = "#1e3a2b";
const CREAM = "#fff9f2";
const LINE = "#ecdfd0";

function layout({ heading, intro, petName, petPhoto, statusLine, ctaLabel, ctaUrl }) {
  // Some clients block remote images by default, so the alt text carries
  // the pet's name and the card below repeats it. The email still reads
  // correctly with no image at all.
  const photo = petPhoto
    ? `<img src="${petPhoto}" alt="${petName}" width="456" height="240"
             style="display:block;width:100%;max-width:456px;height:auto;margin:0 0 24px;
                    border-radius:16px;border:1px solid ${LINE};background:${CREAM}" />`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:${CREAM};font-family:Helvetica,Arial,sans-serif;color:#1a1e1c">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:520px;background:#ffffff;border:1px solid ${LINE};border-radius:20px;padding:32px">
          <tr><td>
            <p style="margin:0 0 4px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#6b726e">PawHome</p>
            <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:${BRAND}">${heading}</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6">${intro}</p>
            ${photo}
            <div style="border:1px solid ${LINE};border-radius:16px;padding:18px 20px;background:${CREAM}">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#6b726e">Pet</p>
              <p style="margin:0 0 14px;font-size:20px;font-weight:bold;color:${BRAND}">${petName}</p>
              <p style="margin:0;font-size:15px;line-height:1.6">${statusLine}</p>
            </div>

            <p style="margin:26px 0 0">
              <a href="${ctaUrl}"
                 style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;
                        font-size:15px;font-weight:bold;padding:13px 26px;border-radius:999px">${ctaLabel}</a>
            </p>
            <p style="margin:22px 0 0;font-size:13px;color:#6b726e">
              If the button does not work, paste this into your browser:<br>
              <span style="word-break:break-all">${ctaUrl}</span>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function approved({ petName, petPhoto, dashboardUrl }) {
  return {
    subject: `${petName} is coming home with you`,
    html: layout({
      heading: "Your adoption is approved",
      intro: `Good news. The shelter team has reviewed your application and said yes, so ${petName} is yours.`,
      petName,
      petPhoto,
      statusLine:
        "The shelter will be in touch shortly to arrange a handover time. Please bring a carrier or a leash and any ID you have.",
      ctaLabel: "View your application",
      ctaUrl: dashboardUrl,
    }),
    text: `Your adoption is approved.\n\n${petName} is yours. The shelter will be in touch to arrange a handover time.\n\nView your application: ${dashboardUrl}`,
  };
}

function rejected({ petName, petPhoto, dashboardUrl }) {
  return {
    subject: `An update on your ${petName} application`,
    html: layout({
      heading: "An update on your application",
      intro: `Thank you for applying for ${petName}. The shelter has reviewed your application and this time it was not the right fit, most often because another applicant was approved first.`,
      petName,
      petPhoto,
      statusLine:
        "This is not the end of it. There are other animals looking for a home, and we would love to read another application from you.",
      ctaLabel: "Browse other pets",
      ctaUrl: dashboardUrl,
    }),
    text: `An update on your ${petName} application.\n\nThis time it was not the right fit, most often because another applicant was approved first. There are other animals looking for a home.\n\nBrowse other pets: ${dashboardUrl}`,
  };
}

// Every decision the shelter makes maps to one of these.
const TEMPLATES = { approved, rejected };

module.exports = { TEMPLATES };