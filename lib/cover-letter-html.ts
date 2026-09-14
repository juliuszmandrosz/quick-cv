/**
 * Standalone HTML document for the cover letter PDF. It is rendered by
 * Playwright via page.setContent(), so it carries its own styles and cannot
 * rely on the app's stylesheet. Kept visually in line with the CV template:
 * same neutral greys, same sans-serif stack, same A4 print setup.
 */
export type CoverLetterDocument = {
  fullName: string;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  city?: string | null;
  companyName?: string | null;
  body: string;
  date: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function buildCoverLetterHtml(doc: CoverLetterDocument): string {
  const contactLine = [doc.email, doc.phone, doc.linkedin]
    .filter(Boolean)
    .map((part) => escapeHtml(String(part)))
    .join(" &nbsp;|&nbsp; ");

  // The model returns paragraphs separated by blank lines. The final short
  // line is the sign-off and gets extra spacing above it.
  const paragraphs = doc.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const lastIndex = paragraphs.length - 1;
  const bodyHtml = paragraphs
    .map((paragraph, index) => {
      const isSignOff = index === lastIndex && paragraph.length < 80;
      const text = escapeHtml(paragraph).replace(/\n/g, "<br />");
      return `<p class="${isSignOff ? "sign-off" : ""}">${text}</p>`;
    })
    .join("\n");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page {
        size: A4;
        margin: 0;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 18mm 20mm;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          "Helvetica Neue", Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.65;
        color: #1f2937;
        background: #ffffff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      header {
        text-align: center;
        padding-bottom: 10mm;
        border-bottom: 1px solid #e5e7eb;
      }

      h1 {
        margin: 0 0 2mm;
        font-size: 19pt;
        font-weight: 700;
        letter-spacing: -0.2pt;
        color: #111827;
      }

      .role {
        margin: 0 0 3mm;
        font-size: 12pt;
        color: #4b5563;
      }

      .contact {
        margin: 0;
        font-size: 9.5pt;
        color: #6b7280;
      }

      .meta {
        margin-top: 9mm;
        text-align: right;
        font-size: 9.5pt;
        color: #6b7280;
      }

      main {
        margin-top: 6mm;
      }

      p {
        margin: 0 0 4.5mm;
        text-align: justify;
        hyphens: auto;
      }

      p.sign-off {
        margin-top: 8mm;
        text-align: left;
      }

      p:last-child {
        margin-bottom: 0;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>${escapeHtml(doc.fullName)}</h1>
      ${doc.title ? `<p class="role">${escapeHtml(doc.title)}</p>` : ""}
      ${contactLine ? `<p class="contact">${contactLine}</p>` : ""}
    </header>

    <div class="meta">
      ${doc.city ? `${escapeHtml(doc.city)}, ` : ""}${escapeHtml(doc.date)}
    </div>

    <main>
      ${bodyHtml}
    </main>
  </body>
</html>`;
}
