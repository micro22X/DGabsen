import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  // Handle newline characters in the private key
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    console.warn('Google credentials are not set in environment variables. Using dummy mode.');
    return null;
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  });
}

export async function getSheetData(range: string) {
  const auth = getAuth();
  if (!auth) return [];
  
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheetId) throw new Error('GOOGLE_SHEET_ID is missing');

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });
    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    // Silent fail for empty sheet or invalid range during initialization
    return [];
  }
}

export async function appendSheetData(range: string, values: any[][]) {
  const auth = getAuth();
  if (!auth) {
    console.warn('Google credentials missing. Simulating successful append.');
    return { updates: { updatedRows: values.length } };
  }
  
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.GOOGLE_SHEET_ID;

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error appending sheet data:', error);
    throw error;
  }
}
