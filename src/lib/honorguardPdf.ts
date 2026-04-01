import { PDFDocument, StandardFonts } from 'pdf-lib';

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

const MARGIN = 50;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const ROW_HEIGHT = 20;
const FONT_SIZE = 10;
const HEADER_FONT_SIZE = 12;
const ROWS_PER_PAGE = 20;

export async function buildSignInPdf(
  event: SignInEvent,
  signIns: SignInRow[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const tableLeft = MARGIN;
  let y = PAGE_HEIGHT - MARGIN;

  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  function drawText(
    p: { drawText: (text: string, opts: { x: number; y: number; size: number; font: ReturnType<typeof doc.embedFont> }) => void },
    text: string,
    x: number,
    yVal: number,
    size: number = FONT_SIZE,
    useBold: boolean = false
  ) {
    const f = useBold ? boldFont : font;
    const line = String(text).slice(0, 80);
    p.drawText(line, { x, y: yVal, size, font: f });
  }

  drawText(page, 'Honor Guard Sign-In', tableLeft, y, 16, true);
  y -= 24;

  drawText(page, `Date: ${event.date || '—'}`, tableLeft, y, HEADER_FONT_SIZE);
  y -= ROW_HEIGHT;
  drawText(page, `Occasion: ${event.occasion || '—'}`, tableLeft, y, HEADER_FONT_SIZE);
  y -= ROW_HEIGHT;
  drawText(page, `Location: ${event.location || '—'}`, tableLeft, y, HEADER_FONT_SIZE);
  y -= ROW_HEIGHT;
  drawText(page, `Marshal: ${event.marshalName || '—'}`, tableLeft, y, HEADER_FONT_SIZE);
  y -= 28;

  const colWidthsWithNum = [28, 112, 96, 66, 46, 116];
  const headers = ['#', 'Name', 'Contact', 'Position', 'Org #', 'Org Name'];

  function drawPageHeader(p: typeof page, yVal: number) {
    let x = tableLeft;
    headers.forEach((h, i) => {
      drawText(p, h, x, yVal, FONT_SIZE, true);
      x += colWidthsWithNum[i];
    });
  }

  let currentPage = page;
  let x = tableLeft;
  drawPageHeader(currentPage, y);
  y -= ROW_HEIGHT + 4;

  for (let idx = 0; idx < signIns.length; idx++) {
    const rowNum = idx + 1;
    const rowOnPage = idx % ROWS_PER_PAGE;
    if (rowOnPage === 0 && idx > 0) {
      currentPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
      drawText(currentPage, 'Honor Guard Sign-In', tableLeft, y, 16, true);
      y -= 24;
      drawText(currentPage, `Date: ${event.date || '—'}`, tableLeft, y, HEADER_FONT_SIZE);
      y -= ROW_HEIGHT;
      drawText(currentPage, `Occasion: ${event.occasion || '—'}`, tableLeft, y, HEADER_FONT_SIZE);
      y -= ROW_HEIGHT;
      drawText(currentPage, `Location: ${event.location || '—'}`, tableLeft, y, HEADER_FONT_SIZE);
      y -= ROW_HEIGHT;
      drawText(currentPage, `Marshal: ${event.marshalName || '—'}`, tableLeft, y, HEADER_FONT_SIZE);
      y -= 28;
      drawPageHeader(currentPage, y);
      y -= ROW_HEIGHT + 4;
    }
    const row = signIns[idx];
    x = tableLeft;
    const cells = [String(rowNum), row.name, row.contact, row.position, row.orgNumber, row.orgName];
    cells.forEach((cell, i) => {
      currentPage.drawText(String(cell || '').slice(0, i === 0 ? 4 : 30), { x, y, size: FONT_SIZE, font });
      x += colWidthsWithNum[i];
    });
    y -= ROW_HEIGHT;
  }

  return doc.save();
}
