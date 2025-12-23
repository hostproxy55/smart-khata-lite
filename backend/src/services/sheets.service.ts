import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

// Since we can't have real credentials in this environment, 
// we will implement a mock mode if credentials are missing.
const IS_MOCK_MODE = !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

let doc: GoogleSpreadsheet;

interface MockDB {
  [key: string]: any[];
}

// Mock in-memory storage for when credentials aren't present
const mockDB: MockDB = {
  Customers: [
    { id: '1', name: 'Rahim Uddin', phone: '01712345678', createdAt: new Date('2024-01-15').toISOString() },
    { id: '2', name: 'Karim Mia', phone: '01812345678', createdAt: new Date('2024-02-01').toISOString() }
  ],
  Transactions: [
    { id: 't1', customerId: '1', type: 'due', amount: '2500', productName: 'Rice 25kg', date: new Date().toISOString(), createdAt: new Date().toISOString() }
  ]
};

export const connectToSheets = async () => {
  if (IS_MOCK_MODE) {
    console.warn("⚠️  Running in MOCK MODE (No Google Credentials Found). Data will not be persisted.");
    return;
  }

  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();
    console.log(`Connected to sheet: ${doc.title}`);
  } catch (error) {
    console.error("Failed to connect to Google Sheets:", error);
    throw error;
  }
};

const getSheet = async (sheetTitle: string) => {
  if (IS_MOCK_MODE) return null;
  let sheet = doc.sheetsByTitle[sheetTitle];
  if (!sheet) {
    // Auto-create sheet if it doesn't exist
    if (sheetTitle === 'Customers') {
      console.log('Creating new sheet: Customers');
      sheet = await doc.addSheet({ title: 'Customers', headerValues: ['id', 'name', 'phone', 'createdAt'] });
    } else if (sheetTitle === 'Transactions') {
      console.log('Creating new sheet: Transactions');
      sheet = await doc.addSheet({ title: 'Transactions', headerValues: ['id', 'customerId', 'type', 'amount', 'productName', 'note', 'date', 'createdAt'] });
    }
  }
  return sheet;
}

export const getRows = async (sheetTitle: string) => {
  if (IS_MOCK_MODE) {
    return mockDB[sheetTitle] || [];
  }
  
  const sheet = await getSheet(sheetTitle);
  if (!sheet) return [];
  const rows = await sheet.getRows();
  return rows.map(row => {
    const obj = row.toObject();
    return obj;
  });
};

export const getRowById = async (sheetTitle: string, id: string) => {
  if (IS_MOCK_MODE) {
    return (mockDB[sheetTitle] || []).find(row => row.id === id);
  }

  const sheet = await getSheet(sheetTitle);
  if (!sheet) return null;
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('id') === id);
  return row ? row.toObject() : null;
};

export const addRow = async (sheetTitle: string, data: any) => {
  if (IS_MOCK_MODE) {
    console.log(`[MOCK] Adding row to ${sheetTitle}:`, data);
    if (!mockDB[sheetTitle]) mockDB[sheetTitle] = [];
    mockDB[sheetTitle].push(data);
    return data;
  }

  const sheet = await getSheet(sheetTitle);
  if (!sheet) throw new Error(`Sheet ${sheetTitle} not found`);

  console.log(`[REAL] Adding row to ${sheetTitle} in Google Sheet...`);
  const row = await sheet.addRow(data);
  return row.toObject();
};

export const updateRow = async (sheetTitle: string, id: string, data: any) => {
  if (IS_MOCK_MODE) {
    const list = mockDB[sheetTitle] || [];
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      mockDB[sheetTitle][index] = { ...list[index], ...data };
      return mockDB[sheetTitle][index];
    }
    return null;
  }

  const sheet = await getSheet(sheetTitle);
  if (!sheet) throw new Error(`Sheet ${sheetTitle} not found`);
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('id') === id);
  if (row) {
    row.assign(data);
    await row.save();
    return row.toObject();
  }
  return null;
};

export const deleteRow = async (sheetTitle: string, id: string) => {
  if (IS_MOCK_MODE) {
    const list = mockDB[sheetTitle] || [];
    const initialLength = list.length;
    mockDB[sheetTitle] = list.filter(item => item.id !== id);
    return mockDB[sheetTitle].length < initialLength;
  }

  const sheet = await getSheet(sheetTitle);
  if (!sheet) throw new Error(`Sheet ${sheetTitle} not found`);
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('id') === id);
  if (row) {
    await row.delete();
    return true;
  }
  return false;
};
