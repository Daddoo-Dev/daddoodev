/**
 * Builds sign-in sheet HTML that matches the Fourth Degree Color Corp template
 * (from Google Sheets export / static template). No row/column headers.
 * Used with html2pdf to generate PDF.
 */

export type SignInEvent = {
  date: string;
  occasion: string;
  location: string;
  marshalName: string;
};

export type SignInRow = {
  name: string;
  contact: string;
  position: string;
  orgNumber: string;
  orgName: string;
};

const ROWS_PER_PAGE = 20;

/** Relative path for template images (used by preview and PDF generation). */
export const SIGNIN_SHEET_IMAGE_BASE = '/4TH%20DEGREE%20HG%20SIGN-IN%20TEMPLATE/resources';

/** Base URL for template images (no trailing slash). */
function getBaseUrl(): string {
  if (typeof window === 'undefined') return SIGNIN_SHEET_IMAGE_BASE;
  return `${window.location.origin}${SIGNIN_SHEET_IMAGE_BASE}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Approx px per character for Courier at 10pt (monospace). Use conservative value so long text shrinks enough. */
const PX_PER_CHAR_10PT = 7.5;
const MIN_FONT_PT = 6;

/**
 * Font size (pt) so text fits in one line. Courier monospace; char width scales with size.
 * @param textLength - character count
 * @param widthPx - cell width (padding handled via -6)
 * @param maxFontPt - max size (12 for name, 10 for contact/orgName)
 */
function shrinkToFitFontPt(textLength: number, widthPx: number, maxFontPt: number): number {
  if (textLength <= 0) return maxFontPt;
  const usablePx = widthPx - 6;
  const maxCharsAtMax = (usablePx * 10) / (PX_PER_CHAR_10PT * maxFontPt);
  if (textLength <= maxCharsAtMax) return maxFontPt;
  const pt = (usablePx * 10) / (PX_PER_CHAR_10PT * textLength);
  return Math.max(MIN_FONT_PT, Math.min(maxFontPt, Math.floor(pt * 10) / 10));
}

/**
 * Returns HTML for one page of the sign-in sheet (event block + table header + up to 20 rows + footer).
 */
function buildOnePageHtml(
  event: SignInEvent,
  rows: SignInRow[],
  pageNum: number,
  totalPages: number,
  startRowNum: number,
  baseUrl: string
): string {
  const img0 = `${baseUrl}/image_1636881766_0.jpg`;
  const img1 = `${baseUrl}/image_1636881766_1.jpg`;

  const lastDataIndex = rows.length - 1;
  const dataRows = rows
    .map(
      (row, i) => {
        const isLast = i === lastDataIndex && rows.length === ROWS_PER_PAGE;
        const bottomBorder = isLast ? '2px' : '1px';
        const namePt = shrinkToFitFontPt(row.name.length, 222, 12);
        const contactPt = shrinkToFitFontPt(row.contact.length, 184, 10);
        const orgNamePt = shrinkToFitFontPt(row.orgName.length, 218, 10);
        return `
    <tr style="height:29px">
      <td style="width:20px;min-width:20px;max-width:20px;box-sizing:border-box;border-bottom:${bottomBorder} solid #000;border-right:2px solid #000;background:#fff;text-align:center;font-family:Arial;font-size:10pt;vertical-align:middle;padding:0 1px">${startRowNum + i}</td>
      <td style="width:222px;border-bottom:${bottomBorder} solid #000;border-right:1px solid #000;background:#fff;text-align:left;font-family:'Courier New',Courier,monospace;vertical-align:middle;padding:0 3px;padding-left:3px;overflow:hidden"><span style="font-size:${namePt}pt;white-space:nowrap;display:block;overflow:hidden;text-overflow:ellipsis">${escapeHtml(row.name)}</span></td>
      <td style="width:184px;border-bottom:${bottomBorder} solid #000;border-right:1px solid #000;background:#fff;text-align:center;font-family:'Courier New',Courier,monospace;vertical-align:middle;padding:0 3px;padding-left:3px;overflow:hidden"><span style="font-size:${contactPt}pt;white-space:nowrap;display:block;overflow:hidden;text-overflow:ellipsis">${escapeHtml(row.contact)}</span></td>
      <td style="width:72px;border-bottom:${bottomBorder} solid #000;border-right:1px solid #000;background:#fff;text-align:center;font-family:Arial;font-size:10pt;vertical-align:middle;padding:0 3px">${escapeHtml(row.position)}</td>
      <td style="width:60px;border-bottom:${bottomBorder} solid #000;border-right:1px solid #000;background:#fff;text-align:center;font-family:Arial;font-size:10pt;vertical-align:middle;padding:0 3px">${escapeHtml(row.orgNumber)}</td>
      <td style="width:218px;border-bottom:${bottomBorder} solid #000;border-right:2px solid #000;background:#fff;text-align:left;font-family:'Courier New',Courier,monospace;vertical-align:middle;padding:0 3px;padding-left:3px;overflow:hidden"><span style="font-size:${orgNamePt}pt;white-space:nowrap;display:block;overflow:hidden;text-overflow:ellipsis">${escapeHtml(row.orgName)}</span></td>
    </tr>`;
      }
    )
    .join('');

  // Pad to 20 rows with empty rows (last row has 2px bottom border)
  const emptyRows: string[] = [];
  for (let i = rows.length; i < ROWS_PER_PAGE; i++) {
    const isLast = i === ROWS_PER_PAGE - 1;
    const bottomBorder = isLast ? '2px' : '1px';
    emptyRows.push(`
    <tr style="height:29px">
      <td style="width:20px;min-width:20px;max-width:20px;box-sizing:border-box;border-bottom:${bottomBorder} solid #000;border-right:2px solid #000;background:#fff;text-align:center;font-family:Arial;font-size:10pt;vertical-align:middle;padding:0 1px">${startRowNum + i + 1}</td>
      <td style="width:222px;border-bottom:${bottomBorder} solid #000;border-right:1px solid #000;background:#fff;padding:0 3px;padding-left:3px;font-family:'Courier New',Courier,monospace"></td>
      <td style="width:184px;border-bottom:${bottomBorder} solid #000;border-right:1px solid #000;background:#fff;padding:0 3px;padding-left:3px;font-family:'Courier New',Courier,monospace"></td>
      <td style="width:72px;border-bottom:${bottomBorder} solid #000;border-right:1px solid #000;background:#fff;padding:0 3px;font-family:Arial"></td>
      <td style="width:60px;border-bottom:${bottomBorder} solid #000;border-right:1px solid #000;background:#fff;padding:0 3px;font-family:Arial"></td>
      <td style="width:218px;border-bottom:${bottomBorder} solid #000;border-right:2px solid #000;background:#fff;padding:0 3px;padding-left:3px;font-family:'Courier New',Courier,monospace"></td>
    </tr>`);
  }

  return `
  <div class="signin-page" style="page-break-after:always;font-family:Arial;font-size:10pt;color:#000;background:#fff">
    <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:793px;table-layout:fixed">
      <tr style="height:27px">
        <td colspan="6" style="text-align:center;font-size:14pt;vertical-align:middle;padding:0 3px">Fourth Degree Color Corp Sign in Sheet</td>
      </tr>
      <tr style="height:39px">
        <td style="width:85px;vertical-align:middle;text-align:right;padding:0 3px"><img src="${img0}" width="85" height="112" alt="" style="vertical-align:middle" /></td>
        <td style="width:140px;text-align:right;font-weight:bold;font-size:12pt;vertical-align:middle;padding:0 3px">Event Date<br><span style="font-weight:normal">(yyyy/mm/dd)</span></td>
        <td style="width:184px;text-align:center;vertical-align:middle;padding:0 3px">${escapeHtml(event.date || '')}</td>
        <td style="width:72px"></td>
        <td style="width:60px"></td>
        <td style="width:255px;vertical-align:middle;padding:0 3px"><img src="${img1}" width="95" height="120" alt="" style="vertical-align:middle" /></td>
      </tr>
      <tr style="height:39px">
        <td></td>
        <td style="text-align:right;font-weight:bold;font-size:12pt;vertical-align:middle;padding:0 3px">Occasion:</td>
        <td colspan="3" style="text-align:left;font-size:9pt;vertical-align:middle;padding:0 3px">${escapeHtml(event.occasion || '')}</td>
        <td rowspan="2" style="text-align:center;font-style:italic;font-size:10pt;vertical-align:middle;padding:0 3px"><strong>Blessed Father Michael J. McGivney</strong><br>HIS VISION, YOUR MISSION</td>
      </tr>
      <tr style="height:39px">
        <td></td>
        <td style="text-align:right;font-weight:bold;font-size:12pt;vertical-align:middle;padding:0 3px">Location:</td>
        <td colspan="3" style="text-align:left;font-size:10pt;vertical-align:middle;padding:0 3px">${escapeHtml(event.location || '')}</td>
      </tr>
      <tr style="height:39px">
        <td></td>
        <td style="text-align:right;font-weight:bold;font-size:12pt;vertical-align:middle;padding:0 3px">Marshal:</td>
        <td colspan="3" style="text-align:left;font-size:10pt;vertical-align:middle;padding:0 3px">${escapeHtml(event.marshalName || '')}</td>
        <td></td>
      </tr>
      <tr style="height:36px">
        <td colspan="6" style="text-align:center;font-size:10pt;font-style:italic;vertical-align:middle;padding:0 3px">Please forward all sign in sheets to District Marshal __________________ at: _______________________ by email.</td>
      </tr>
    </table>
    <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:793px;table-layout:fixed">
      <tr style="height:47px">
        <td style="width:20px;min-width:20px;max-width:20px;box-sizing:border-box;border-right:2px solid #000;background:#fff;padding:0 1px"></td>
        <td style="width:222px;border-bottom:1px solid #000;border-right:1px solid #000;background:#fff;text-align:left;font-weight:bold;font-size:14pt;vertical-align:middle;padding:0 3px;padding-left:3px">Name (please print)<br><span style="font-size:9pt">Last Name, First Name</span></td>
        <td style="width:184px;border-bottom:1px solid #000;border-right:1px solid #000;background:#fff;text-align:center;font-weight:bold;font-size:14pt;vertical-align:middle;padding:0 3px;padding-left:3px">Contact Info<br><span style="font-size:8pt">(email or phone)</span></td>
        <td style="width:72px;border-bottom:1px solid #000;border-right:1px solid #000;background:#fff;text-align:center;font-weight:bold;font-size:11pt;vertical-align:middle;padding:0 3px">Position<br><span style="font-size:8pt">(CCC, HG, etc)</span></td>
        <td style="width:60px;border-bottom:1px solid #000;border-right:1px solid #000;background:#fff;text-align:center;font-weight:bold;font-size:14pt;vertical-align:middle;padding:0 3px">Assy#</td>
        <td style="width:218px;border-bottom:1px solid #000;border-right:2px solid #000;background:#fff;text-align:center;font-weight:bold;font-size:14pt;vertical-align:middle;padding:0 3px;padding-left:3px">Assy Name</td>
      </tr>
      ${dataRows}
      ${emptyRows.join('')}
      <tr style="height:23px">
        <td colspan="3" style="background:#d8d8d8;text-align:left;font-family:docs-Teko,Arial;font-size:10pt;vertical-align:top;padding:0 3px">Please Turn Off Cell Phones</td>
        <td colspan="2" style="background:#d8d8d8;padding:0 3px"></td>
        <td style="background:#d8d8d8;text-align:center;font-family:docs-Teko,Arial;font-size:10pt;vertical-align:top;padding:0 3px"> Page ${pageNum} of ${totalPages}</td>
      </tr>
      <tr style="height:16px">
        <td colspan="6" style="background:#000;color:#fff;text-align:center;font-style:italic;font-size:11pt;vertical-align:top;padding:0 3px">Tempest Fugit, Memento Mori &#x1F547; Time Flies, Remember Death</td>
      </tr>
    </table>
  </div>`;
}

/**
 * Returns body HTML for all pages of the sign-in sheet.
 * @param baseUrlOverride - When provided (e.g. on server), use this for image URLs instead of window.location.origin.
 */
export function buildSignInSheetHtml(
  event: SignInEvent,
  signIns: SignInRow[],
  baseUrlOverride?: string
): string {
  const totalPages = Math.max(1, Math.ceil(signIns.length / ROWS_PER_PAGE));
  const baseUrl = baseUrlOverride ?? getBaseUrl();

  const pages: string[] = [];
  for (let p = 0; p < totalPages; p++) {
    const start = p * ROWS_PER_PAGE;
    const chunk = signIns.slice(start, start + ROWS_PER_PAGE);
    pages.push(
      buildOnePageHtml(event, chunk, p + 1, totalPages, start + 1, baseUrl)
    );
  }

  /** Return body content only for injection into a container (for html2pdf). */
  return pages.join('');
}
