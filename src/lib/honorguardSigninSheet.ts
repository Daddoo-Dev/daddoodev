import ExcelJS from 'exceljs';
import type { SignInEvent, SignInRow } from '$lib/honorguardPdf';

const ROWS_PER_PAGE = 20;

/**
 * Fills the sign-in template xlsx with event and sign-in data.
 * Uses ExcelJS so the template's layout, images, and formatting are preserved.
 * Template sheets: Sign In, Sign In_2, etc. (20 rows each). C2:C5=event; rows 8+= sign-ins.
 */
export async function fillSignInTemplate(
	templateArrayBuffer: ArrayBuffer,
	event: SignInEvent,
	signIns: SignInRow[]
): Promise<ArrayBuffer> {
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.load(templateArrayBuffer);

	const worksheets = wb.worksheets;
	if (!worksheets.length) throw new Error('Template has no sheet');

	for (let page = 0; page < worksheets.length; page++) {
		const ws = worksheets[page];
		ws.getCell('C2').value = event.date ?? '';
		ws.getCell('C3').value = event.occasion ?? '';
		ws.getCell('C4').value = event.location ?? '';
		ws.getCell('C5').value = event.marshalName ?? '';

		const start = page * ROWS_PER_PAGE;
		const end = Math.min(start + ROWS_PER_PAGE, signIns.length);
		for (let i = start; i < end; i++) {
			const rowIndex = i - start;
			const r = 8 + rowIndex;
			const row = signIns[i];
			ws.getCell(r, 1).value = i + 1;
			ws.getCell(r, 2).value = row.name ?? '';
			ws.getCell(r, 3).value = row.contact ?? '';
			ws.getCell(r, 4).value = row.position ?? '';
			ws.getCell(r, 5).value = row.orgNumber ?? '';
			ws.getCell(r, 6).value = row.orgName ?? '';
		}
	}

	const buf = await wb.xlsx.writeBuffer();
	return buf as ArrayBuffer;
}
