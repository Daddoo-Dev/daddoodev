import type { PageLoad } from './$types';
import { buildSignInSheetHtml, SIGNIN_SHEET_IMAGE_BASE } from '$lib/honorguardPdfHtml';
import type { SignInEvent, SignInRow } from '$lib/honorguardPdfHtml';

export const prerender = true;

const DUMMY_EVENT: SignInEvent = {
  date: '',
  occasion: 'Sample occasion',
  location: 'Sample location',
  marshalName: 'Sample marshal'
};

const DUMMY_SIGN_INS: SignInRow[] = [
  { name: 'Reallylongname, Guerrero von Dieter', contact: 'one@example.com', position: 'HG', orgNumber: '94', orgName: 'Longmont' },
  { name: 'Sample, Two', contact: 'iliketohavethelongestemailaddressintheworld@example.com', position: 'CCC', orgNumber: '94', orgName: 'Longmont' }
];

export const load: PageLoad = () => {
  const sheetHtml = buildSignInSheetHtml(DUMMY_EVENT, DUMMY_SIGN_INS, SIGNIN_SHEET_IMAGE_BASE);
  return { sheetHtml };
};
