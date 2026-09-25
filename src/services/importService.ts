import * as XLSX from 'xlsx';
import { Client, ClientType, ClientStatus, KycStatus, InvestmentPlan, MonthlyLedgerEntry } from '../types';

export interface FieldDefinition {
  key: string;
  label: string;
  required?: boolean;
  type: 'string' | 'number' | 'date' | 'select';
  options?: string[];
  aliases: string[];
  description?: string;
  category?: 'Core' | 'Bhishi / Group' | 'Financial & ID' | 'Bank & Nominee' | 'Address';
}

export const CLIENT_IMPORT_FIELDS: FieldDefinition[] = [
  // --- CORE MEMBER INFO ---
  {
    key: 'name',
    label: 'Full Name / Member Name',
    required: true,
    type: 'string',
    aliases: ['name', 'fullname', 'full_name', 'member_name', 'client_name', 'customer_name', 'नाव', 'sabhasad_name', 'person_name', 'नाव_आडनाव', 'सभासदाचे_नाव'],
    description: 'Full name of the member',
    category: 'Core',
  },
  {
    key: 'phone',
    label: 'Mobile / Phone Number',
    required: true,
    type: 'string',
    aliases: ['phone', 'mobile', 'mobile_no', 'phone_no', 'contact', 'contact_no', 'cell', 'whatsapp', 'मोबाईल', 'phone_number', 'संपर्क_क्र', 'मोबाईल_नंबर'],
    description: '10-digit mobile phone number',
    category: 'Core',
  },
  {
    key: 'memberNumber',
    label: 'Member / Sabhasad Number',
    type: 'string',
    aliases: ['member_number', 'member_no', 'member_id', 'sabhasad_no', 'sabhasad_kramank', 'सभासद_क्र', 'सभासद_नंबर', 'roll_no', 'member_code', 'सभासद_क्रमांक'],
    description: 'Member sequence or roll number (e.g. 101, B-12)',
    category: 'Bhishi / Group',
  },
  {
    key: 'srNo',
    label: 'Sr. No / Serial Number',
    type: 'number',
    aliases: ['sr_no', 'srno', 's_no', 'serial_number', 'serial_no', 'अ_क्र', 'अनुक्रमांक', 'no', 'num', 'sr'],
    description: 'Serial number from spreadsheet (e.g. 1, 2, 3)',
    category: 'Core',
  },
  {
    key: 'bishiGroupName',
    label: 'Bishi Group / Mandal Name',
    type: 'string',
    aliases: ['group_name', 'bishi_group', 'group', 'mandal', 'chit_group', 'pool_name', 'बीशी_गट', 'गट_नाव', 'मंडळ', 'scheme_name'],
    description: 'Name of the Bhishi savings group or batch',
    category: 'Bhishi / Group',
  },
  {
    key: 'monthlyInstallment',
    label: 'Monthly Installment / Hfta / AMT (₹)',
    type: 'number',
    aliases: ['monthly_installment', 'amt', 'amount', 'installment', 'hfta', 'hafta', 'monthly_hfta', 'मासिक_हप्ता', 'हप्ता', 'monthly_amount', 'installment_amount', 'दरमहा_हप्ता', 'हप्ता_रक्कम'],
    description: 'Regular monthly contribution / hfta amount',
    category: 'Bhishi / Group',
  },
  {
    key: 'monthsPaid',
    label: 'Months / Installments Paid',
    type: 'number',
    aliases: ['months_paid', 'paid_months', 'paid_installments', 'hafta_paid', 'भरलेले_महिने', 'भरलेले_हप्ते', 'completed_months', 'no_of_installments'],
    description: 'Number of installments already paid',
    category: 'Bhishi / Group',
  },
  {
    key: 'totalMonths',
    label: 'Total Group Duration (Months)',
    type: 'number',
    aliases: ['total_months', 'total_duration', 'tenure_months', 'group_duration', 'एकूण_महिने', 'एकूण_मुदत', 'total_installments', 'एकूण_हप्ते'],
    description: 'Total duration of the Bhishi group (e.g. 12, 20, 24)',
    category: 'Bhishi / Group',
  },
  {
    key: 'totalPaid',
    label: 'Total Amount Collected / Paid (₹)',
    type: 'number',
    aliases: ['total_paid', 'collected_amount', 'paid_amount', 'total_collected', 'एकूण_जमा', 'जमा_रक्कम', 'एकूण_भरलेली_रक्कम', 'total_contribution'],
    description: 'Cumulative amount paid by the member to date',
    category: 'Bhishi / Group',
  },
  {
    key: 'balanceAmount',
    label: 'Remaining Balance / Due Amount (₹)',
    type: 'number',
    aliases: ['balance_amount', 'balance', 'due_amount', 'remaining_amount', 'outstanding', 'शिल्लक_रक्कम', 'थकबाकी', 'येणे_बाकी', 'pending_amount'],
    description: 'Pending or remaining balance amount',
    category: 'Bhishi / Group',
  },
  {
    key: 'penaltyAmount',
    label: 'Penalty / Late Fee / Danda (₹)',
    type: 'number',
    aliases: ['penalty', 'penalty_amount', 'late_fee', 'fine', 'danda', 'दंड', 'विलंब_शुल्क', 'penalty_fee'],
    description: 'Penalty or late fee charged',
    category: 'Bhishi / Group',
  },
  {
    key: 'aadhaarNumber',
    label: 'Aadhaar Card Number',
    type: 'string',
    aliases: ['aadhaar', 'aadhaar_no', 'aadhaar_number', 'aadhar', 'aadhar_no', 'आधार_कार्ड', 'आधार_क्रमांक', 'uid', 'unique_id'],
    description: '12-digit Aadhaar number',
    category: 'Financial & ID',
  },
  {
    key: 'panNumber',
    label: 'PAN Card Number',
    type: 'string',
    aliases: ['pan', 'pan_no', 'pan_number', 'pan_card', 'पॅन_कार्ड', 'पॅन_क्रमांक'],
    description: '10-character alphanumeric PAN',
    category: 'Financial & ID',
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'string',
    aliases: ['email', 'email_address', 'mail', 'e_mail', 'ईमेल'],
    description: 'Email ID for portal login & notifications',
    category: 'Core',
  },
  {
    key: 'clientType',
    label: 'Client Type',
    type: 'select',
    options: ['INVESTOR', 'BORROWER', 'INVESTOR_BORROWER'],
    aliases: ['client_type', 'type', 'category', 'role', 'member_type', 'investor_or_borrower', 'वर्गवारी'],
    description: 'INVESTOR, BORROWER, or INVESTOR_BORROWER',
    category: 'Core',
  },
  {
    key: 'gender',
    label: 'Gender',
    type: 'select',
    options: ['MALE', 'FEMALE', 'OTHER'],
    aliases: ['gender', 'sex', 'लिंग'],
    description: 'MALE, FEMALE, or OTHER',
    category: 'Core',
  },
  {
    key: 'dateOfBirth',
    label: 'Date of Birth / Age',
    type: 'date',
    aliases: ['dob', 'date_of_birth', 'birthdate', 'birth_date', 'जन्म_दिनांक', 'वय', 'age'],
    description: 'YYYY-MM-DD or DD/MM/YYYY',
    category: 'Core',
  },
  {
    key: 'address',
    label: 'Address / Residence',
    type: 'string',
    aliases: ['address', 'residence', 'address_line', 'street', 'पत्ता', 'रहिवासी_पत्ता', 'गाव_पत्ता'],
    description: 'Residential address / flat / street',
    category: 'Address',
  },
  {
    key: 'city',
    label: 'City / Village / Gaon',
    type: 'string',
    aliases: ['city', 'town', 'village', 'gaon', 'शहर', 'गाव', 'location', 'गावाचे_नाव'],
    description: 'City or Village name (e.g. Miraj, Sangli, Pune)',
    category: 'Address',
  },
  {
    key: 'state',
    label: 'State',
    type: 'string',
    aliases: ['state', 'province', 'राज्य'],
    description: 'State name (e.g. Maharashtra)',
    category: 'Address',
  },
  {
    key: 'pinCode',
    label: 'PIN / Postal Code',
    type: 'string',
    aliases: ['pin', 'pincode', 'pin_code', 'postal_code', 'zip', 'zip_code', 'पिन_कोड'],
    description: '6-digit PIN code',
    category: 'Address',
  },
  {
    key: 'occupation',
    label: 'Occupation / Business',
    type: 'string',
    aliases: ['occupation', 'profession', 'job', 'work', 'व्यवसाय', 'business', 'नोकरी_व्यवसाय'],
    description: 'Business, Farming, Salaried, Shopkeeper, etc.',
    category: 'Core',
  },
  {
    key: 'companyName',
    label: 'Company / Firm / Shop Name',
    type: 'string',
    aliases: ['company', 'company_name', 'firm', 'shop', 'shop_name', 'organization', 'दुकान_नाव'],
    description: 'Employer or business firm name',
    category: 'Core',
  },
  {
    key: 'monthlyIncome',
    label: 'Monthly Income (₹)',
    type: 'number',
    aliases: ['monthly_income', 'income', 'salary', 'monthly_earnings', 'मासिक_उत्पन्न', 'उत्पन्न'],
    description: 'Approximate monthly income',
    category: 'Financial & ID',
  },
  {
    key: 'bankName',
    label: 'Bank Name',
    type: 'string',
    aliases: ['bank', 'bank_name', 'बँक', 'बँकेचे_नाव'],
    description: 'Name of bank (e.g. SBI, HDFC, Bank of Maharashtra)',
    category: 'Bank & Nominee',
  },
  {
    key: 'accountNumber',
    label: 'Bank Account Number',
    type: 'string',
    aliases: ['account_no', 'account_number', 'acc_no', 'bank_acc', 'ac_no', 'खाते_क्रमांक', 'बँक_खाते_क्र'],
    description: 'Bank account number',
    category: 'Bank & Nominee',
  },
  {
    key: 'accountHolderName',
    label: 'Account Holder Name',
    type: 'string',
    aliases: ['account_holder', 'account_holder_name', 'holder_name', 'acc_holder', 'खातेदाराचे_नाव'],
    description: 'Name registered on the bank account',
    category: 'Bank & Nominee',
  },
  {
    key: 'ifscCode',
    label: 'Bank IFSC Code',
    type: 'string',
    aliases: ['ifsc', 'ifsc_code', 'आयएफएससी'],
    description: '11-character bank IFSC code',
    category: 'Bank & Nominee',
  },
  {
    key: 'nomineeName',
    label: 'Nominee / Warasdar Name',
    type: 'string',
    aliases: ['nominee', 'nominee_name', 'warasdar', 'वारसदार', 'वारसदाराचे_नाव'],
    description: 'Name of the nominee / beneficiary',
    category: 'Bank & Nominee',
  },
  {
    key: 'nomineeRelationship',
    label: 'Nominee Relationship',
    type: 'string',
    aliases: ['nominee_relationship', 'nominee_relation', 'relation', 'relationship', 'नाते', 'वारसदार_नाते'],
    description: 'Spouse, Father, Mother, Son, Daughter, etc.',
    category: 'Bank & Nominee',
  },
  {
    key: 'nomineePhone',
    label: 'Nominee Contact Phone',
    type: 'string',
    aliases: ['nominee_phone', 'nominee_mobile', 'nominee_contact', 'वारसदार_मोबाईल'],
    description: 'Mobile number of the nominee',
    category: 'Bank & Nominee',
  },
  {
    key: 'initialInvestmentAmount',
    label: 'Initial / Active Investment (₹)',
    type: 'number',
    aliases: ['investment', 'investment_amount', 'initial_investment', 'invested_amount', 'bishi_amount', 'deposit', 'ठेव', 'गुंतवणूक_रक्कम', 'ठेव_रक्कम'],
    description: 'Active investment amount (auto-creates investment record if > 0)',
    category: 'Financial & ID',
  },
  {
    key: 'initialLoanAmount',
    label: 'Active Loan Amount (₹)',
    type: 'number',
    aliases: ['loan', 'loan_amount', 'initial_loan', 'borrowed_amount', 'कर्ज', 'कर्ज_रक्कम', 'उचल'],
    description: 'Active loan amount (auto-creates loan record if > 0)',
    category: 'Financial & ID',
  },
  {
    key: 'status',
    label: 'Account Status',
    type: 'select',
    options: ['ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION'],
    aliases: ['status', 'account_status', 'member_status', 'स्थिती'],
    description: 'ACTIVE or INACTIVE',
    category: 'Core',
  },
  {
    key: 'notes',
    label: 'Notes / Remarks',
    type: 'string',
    aliases: ['notes', 'remarks', 'comment', 'description', 'टीप', 'शेरा'],
    description: 'Additional notes or remarks',
    category: 'Core',
  },
];

export interface ParsedClientRow {
  rowIndex: number;
  raw: Record<string, any>;
  data: {
    name: string;
    phone: string;
    email: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    occupation: string;
    companyName: string;
    monthlyIncome: number;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    nomineeName: string;
    nomineeRelationship: string;
    nomineePhone: string;
    clientType: ClientType;
    status: ClientStatus;
    kycStatus: KycStatus;
    notes: string;

    // Bhishi attributes
    srNo?: number | string;
    memberNumber?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    bishiGroupName?: string;
    monthlyInstallment?: number;
    monthsPaid?: number;
    totalMonths?: number;
    penaltyAmount?: number;
    totalPaid?: number;
    balanceAmount?: number;

    // Month-by-month Bhishi Ledger history from Excel matrix
    monthlyLedger?: MonthlyLedgerEntry[];

    // Dynamic unmapped custom fields
    customFields: Record<string, any>;

    // Portfolio creation triggers
    initialInvestmentAmount?: number;
    investmentPlanDurationMonths?: number;
    investmentReturnRate?: number;
    initialLoanAmount?: number;
    loanInterestRate?: number;
    loanTenureMonths?: number;
  };
  isValid: boolean;
  isDuplicate: boolean;
  duplicateClient?: Client;
  errors: string[];
  warnings: string[];
}

export interface ParseResult {
  sheetNames: string[];
  activeSheet: string;
  isMatrixFormat: boolean;
  bishiGroupName?: string;
  monthNamesDetected?: string[];
  headers: string[];
  rawRowsCount: number;
  columnMapping: Record<string, string>;
  rows: ParsedClientRow[];
  summary: {
    total: number;
    valid: number;
    duplicates: number;
    errors: number;
    totalInvestments: number;
    totalLoans: number;
    totalMonthlyInstallments: number;
  };
}

const MONTH_NAMES = [
  'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP',
  'OCTOBER', 'NOVEMBER', 'DECEMBER', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER',
  'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर', 'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर'
];

function normalizeKey(str: string): string {
  return (str || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F]/g, '');
}

export function autoMapHeaders(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedHeaders = new Set<string>();

  for (const field of CLIENT_IMPORT_FIELDS) {
    const exactMatch = headers.find(
      (h) =>
        !usedHeaders.has(h) &&
        (normalizeKey(h) === normalizeKey(field.key) || normalizeKey(h) === normalizeKey(field.label))
    );

    if (exactMatch) {
      mapping[field.key] = exactMatch;
      usedHeaders.add(exactMatch);
      continue;
    }

    const aliasMatch = headers.find((h) => {
      if (usedHeaders.has(h)) return false;
      const normalized = normalizeKey(h);
      return field.aliases.some((alias) => normalizeKey(alias) === normalized);
    });

    if (aliasMatch) {
      mapping[field.key] = aliasMatch;
      usedHeaders.add(aliasMatch);
      continue;
    }

    const partialMatch = headers.find((h) => {
      if (usedHeaders.has(h)) return false;
      const normalized = normalizeKey(h);
      return field.aliases.some((alias) => {
        const normAlias = normalizeKey(alias);
        return normalized.includes(normAlias) || normAlias.includes(normalized);
      });
    });

    if (partialMatch) {
      mapping[field.key] = partialMatch;
      usedHeaders.add(partialMatch);
    }
  }

  return mapping;
}

export function parseDateValue(val: any): string {
  if (!val) return '';

  if (typeof val === 'number' && val > 1000 && val < 60000) {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }

  const str = String(val).trim();
  if (!str || str.startsWith('#')) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // DD/MM/YYYY or DD/MM/YY
  const ddmmyy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (ddmmyy) {
    const day = ddmmyy[1].padStart(2, '0');
    const month = ddmmyy[2].padStart(2, '0');
    let year = ddmmyy[3];
    if (year.length === 2) {
      year = parseInt(year, 10) > 50 ? `19${year}` : `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return '';
}

export function cleanPhoneNumber(val: any): string {
  if (!val) return '';
  let str = String(val).replace(/[^0-9]/g, '');
  if (str.startsWith('91') && str.length === 12) {
    str = str.slice(2);
  } else if (str.startsWith('0') && str.length === 11) {
    str = str.slice(1);
  }
  return str;
}

export function cleanNumber(val: any, fallback = 0): number {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Intelligent parser specifically for Sai Bhishi Monthly Matrix Sheets (OCT to SEP ledger)
 */
export function parseMatrixSheet(
  rows2D: any[][],
  existingClients: Client[] = []
): ParseResult | null {
  if (!rows2D || rows2D.length < 3) return null;

  // 1. Search for title row and header row
  let title = 'SAI BHISHI MANDALE';
  let headerRowIndex = -1;
  let subHeaderRowIndex = -1;

  for (let r = 0; r < Math.min(6, rows2D.length); r++) {
    const rowStr = rows2D[r].map((c) => String(c || '').toUpperCase()).join(' ');
    if (rowStr.includes('BHISHI') || rowStr.includes('MANDALE') || rowStr.includes('BISHI')) {
      const match = rows2D[r].find((c) => String(c).toUpperCase().includes('BHISHI') || String(c).toUpperCase().includes('BISHI'));
      if (match) title = String(match).trim();
    }

    // Check if this row is the main SR / NAME / AMT or 1, 2, 3 header
    const hasSr = rows2D[r].some((c) => ['SR', 'SR NO', 'SR. NO', 'NO'].includes(String(c || '').trim().toUpperCase()));
    const hasName = rows2D[r].some((c) => ['NAME', 'MEMBER NAME', 'CLIENT NAME'].includes(String(c || '').trim().toUpperCase()));
    const hasAmt = rows2D[r].some((c) => ['AMT', 'AMOUNT', 'HFTA'].includes(String(c || '').trim().toUpperCase()));

    if ((hasSr && hasName) || (hasName && hasAmt)) {
      headerRowIndex = r;
      if (r + 1 < rows2D.length) {
        subHeaderRowIndex = r + 1;
      }
      break;
    }
  }

  if (headerRowIndex === -1) {
    return null;
  }

  const headerRow = rows2D[headerRowIndex].map((c) => String(c || '').trim());
  const subHeaderRow = subHeaderRowIndex !== -1 ? rows2D[subHeaderRowIndex].map((c) => String(c || '').trim()) : [];

  // Find column indexes
  let srCol = headerRow.findIndex((c) => ['SR', 'SR NO', 'SR. NO', 'NO'].includes(c.toUpperCase()));
  if (srCol === -1 && subHeaderRow.length > 0) {
    srCol = subHeaderRow.findIndex((c) => ['SR', 'SR NO', 'SR. NO', 'NO'].includes(c.toUpperCase()));
  }
  if (srCol === -1) srCol = 0;

  let nameCol = headerRow.findIndex((c) => ['NAME', 'MEMBER NAME', 'CLIENT NAME'].includes(c.toUpperCase()));
  if (nameCol === -1 && subHeaderRow.length > 0) {
    nameCol = subHeaderRow.findIndex((c) => ['NAME', 'MEMBER NAME'].includes(c.toUpperCase()));
  }
  if (nameCol === -1) nameCol = 1;

  let amtCol = headerRow.findIndex((c) => ['AMT', 'AMOUNT', 'HFTA', 'HAFTA'].includes(c.toUpperCase()));
  if (amtCol === -1 && subHeaderRow.length > 0) {
    amtCol = subHeaderRow.findIndex((c) => ['AMT', 'AMOUNT', 'HFTA'].includes(c.toUpperCase()));
  }
  if (amtCol === -1) amtCol = 2;

  // Identify Month Columns & Date Columns
  interface MonthColDef {
    monthIndex: number;
    monthName: string;
    amountCol: number;
    dateCol?: number;
  }

  const monthColDefs: MonthColDef[] = [];
  const maxCols = Math.max(headerRow.length, subHeaderRow.length);
  let currentMonthIndex = 1;

  for (let c = amtCol + 1; c < maxCols; c++) {
    const topCell = (headerRow[c] || '').toUpperCase();
    const subCell = (subHeaderRow[c] || '').toUpperCase();

    // Check if this column represents a month (e.g. "OCT", "1", "NOV", etc.)
    const isNum = /^\d+$/.test(topCell);
    const isMonthName = MONTH_NAMES.some((m) => topCell === m || subCell === m || topCell.startsWith(m) || subCell.startsWith(m));

    if (isNum || isMonthName) {
      const monthName = isMonthName
        ? (MONTH_NAMES.find((m) => topCell === m || subCell === m || topCell.startsWith(m) || subCell.startsWith(m)) || `M${currentMonthIndex}`)
        : (subCell || `M${topCell}`);

      let dateCol: number | undefined = undefined;
      // Check if next column is DATE
      if (c + 1 < maxCols) {
        const nextSub = (subHeaderRow[c + 1] || '').toUpperCase();
        const nextTop = (headerRow[c + 1] || '').toUpperCase();
        if (nextSub.includes('DATE') || nextTop.includes('DATE') || nextSub.includes('दिनांक')) {
          dateCol = c + 1;
        }
      }

      monthColDefs.push({
        monthIndex: currentMonthIndex,
        monthName: monthName.slice(0, 3).toUpperCase(),
        amountCol: c,
        dateCol,
      });

      currentMonthIndex++;
      if (dateCol !== undefined) {
        c++; // Skip the date column in loop
      }
    }
  }

  if (monthColDefs.length === 0) {
    return null; // Not a matrix format
  }

  // Parse member rows starting after headers
  const startRow = subHeaderRowIndex !== -1 ? subHeaderRowIndex + 1 : headerRowIndex + 1;
  const parsedMembers: Array<{
    srNo: number | string;
    name: string;
    monthlyInstallment: number;
    monthlyLedger: MonthlyLedgerEntry[];
    totalPaid: number;
    monthsPaid: number;
    balanceAmount: number;
    rawRows: any[];
  }> = [];

  let currentMember: (typeof parsedMembers)[0] | null = null;

  for (let r = startRow; r < rows2D.length; r++) {
    const row = rows2D[r];
    if (!row || row.length === 0) continue;

    const rawSr = row[srCol];
    const rawName = String(row[nameCol] || '').trim();
    const rawAmt = cleanNumber(row[amtCol], 0);

    // Stop if we hit a TOTAL row
    if (rawName.toUpperCase().includes('TOTAL') || rawName.toUpperCase().includes('एकूण')) {
      break;
    }

    const isNewMember =
      (rawSr !== undefined && rawSr !== '' && !isNaN(Number(rawSr))) ||
      (rawName && rawAmt > 0 && (!currentMember || currentMember.name !== rawName));

    if (isNewMember && rawName) {
      if (currentMember) {
        parsedMembers.push(currentMember);
      }

      const srNo = rawSr !== undefined && rawSr !== '' ? rawSr : parsedMembers.length + 1;

      currentMember = {
        srNo,
        name: rawName,
        monthlyInstallment: rawAmt,
        monthlyLedger: monthColDefs.map((m) => ({
          monthIndex: m.monthIndex,
          monthName: m.monthName,
          amountDue: rawAmt,
          amountPaid: 0,
          paymentDate: '',
          status: 'UNPAID',
          splits: [],
        })),
        totalPaid: 0,
        monthsPaid: 0,
        balanceAmount: 0,
        rawRows: [row],
      };
    } else if (currentMember) {
      currentMember.rawRows.push(row);
    }

    // Accumulate monthly amounts and dates for current member
    if (currentMember) {
      monthColDefs.forEach((mDef, mIdx) => {
        const amtVal = cleanNumber(row[mDef.amountCol], 0);
        let dateVal = '';
        if (mDef.dateCol !== undefined && row[mDef.dateCol]) {
          dateVal = parseDateValue(row[mDef.dateCol]);
        }

        if (amtVal > 0) {
          const entry = currentMember!.monthlyLedger[mIdx];
          entry.amountPaid += amtVal;
          if (dateVal) {
            entry.paymentDate = dateVal;
          }
          if (!entry.splits) entry.splits = [];
          entry.splits.push({ amount: amtVal, date: dateVal });

          if (entry.amountPaid >= entry.amountDue) {
            entry.status = 'PAID';
          } else if (entry.amountPaid > 0) {
            entry.status = 'PARTIALLY_PAID';
          }
        }
      });
    }
  }

  if (currentMember) {
    parsedMembers.push(currentMember);
  }

  if (parsedMembers.length === 0) {
    return null;
  }

  // Calculate totals and format clients
  const totalMonthsInSheet = monthColDefs.length;

  const rows: ParsedClientRow[] = parsedMembers.map((m, idx) => {
    let totalPaid = 0;
    let monthsPaid = 0;

    m.monthlyLedger.forEach((entry) => {
      totalPaid += entry.amountPaid;
      if (entry.amountPaid > 0) monthsPaid++;
    });

    const balanceAmount = Math.max(0, (m.monthlyInstallment * totalMonthsInSheet) - totalPaid);

    // Generate clean phone or search existing
    const existingMatch = existingClients.find(
      (c) => c.name.toLowerCase().trim() === m.name.toLowerCase().trim() || c.memberNumber === `SB-${m.srNo}`
    );

    const generatedPhone = existingMatch?.phone || `98${String(10000000 + idx).slice(-8)}`;

    return {
      rowIndex: idx + 1,
      raw: m.rawRows[0],
      data: {
        name: m.name,
        phone: generatedPhone,
        email: existingMatch?.email || `${generatedPhone}@saibishi.in`,
        gender: 'MALE',
        dateOfBirth: '1988-01-01',
        address: 'Miraj',
        city: 'Miraj',
        state: 'Maharashtra',
        pinCode: '416410',
        occupation: 'Bhishi Member',
        companyName: '',
        monthlyIncome: m.monthlyInstallment * 3 || 35000,
        bankName: '',
        accountHolderName: m.name,
        accountNumber: '',
        ifscCode: '',
        nomineeName: '',
        nomineeRelationship: 'Spouse',
        nomineePhone: '',
        clientType: 'INVESTOR' as ClientType,
        status: 'ACTIVE' as ClientStatus,
        kycStatus: 'VERIFIED' as KycStatus,
        notes: `Imported from ${title}`,

        srNo: m.srNo,
        memberNumber: `SB-${m.srNo}`,
        bishiGroupName: title,
        monthlyInstallment: m.monthlyInstallment,
        monthsPaid,
        totalMonths: totalMonthsInSheet,
        totalPaid,
        balanceAmount,
        penaltyAmount: 0,
        monthlyLedger: m.monthlyLedger,

        customFields: {
          'Bishi Mandal': title,
          'Total Months': totalMonthsInSheet,
          'Months Completed': `${monthsPaid}/${totalMonthsInSheet}`,
        },

        initialInvestmentAmount: totalPaid,
        investmentPlanDurationMonths: totalMonthsInSheet,
        investmentReturnRate: 14,
      },
      isValid: Boolean(m.name && m.monthlyInstallment > 0),
      isDuplicate: Boolean(existingMatch),
      duplicateClient: existingMatch,
      errors: !m.name ? ['Member name missing'] : [],
      warnings: existingMatch ? [`Existing member match: ${existingMatch.name}`] : [],
    };
  });

  const summary = calculateSummary(rows);

  return {
    sheetNames: ['Bhishi_Ledger'],
    activeSheet: 'Bhishi_Ledger',
    isMatrixFormat: true,
    bishiGroupName: title,
    monthNamesDetected: monthColDefs.map((m) => m.monthName),
    headers: ['SR', 'NAME', 'AMT', ...monthColDefs.map((m) => `${m.monthName} (Hfta)`)],
    rawRowsCount: rows.length,
    columnMapping: {
      name: 'NAME',
      monthlyInstallment: 'AMT',
      srNo: 'SR',
    },
    rows,
    summary,
  };
}

/**
 * Universal file parser: auto-detects matrix sheets OR standard tabular sheets
 */
export async function parseExcelOrCsvFile(
  file: File,
  existingClients: Client[] = []
): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Try parsing as 2D Matrix sheet first
  const rows2D: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const matrixResult = parseMatrixSheet(rows2D, existingClients);

  if (matrixResult && matrixResult.rows.length > 0) {
    matrixResult.sheetNames = workbook.SheetNames;
    matrixResult.activeSheet = firstSheetName;
    return matrixResult;
  }

  // Fallback to standard tabular parser
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  const headers: string[] = [];
  if (rawData.length > 0) {
    Object.keys(rawData[0]).forEach((k) => headers.push(k));
  } else {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
      if (cell && cell.v) headers.push(String(cell.v));
    }
  }

  const columnMapping = autoMapHeaders(headers);
  const rows = processParsedRows(rawData, columnMapping, existingClients);
  const summary = calculateSummary(rows);

  return {
    sheetNames: workbook.SheetNames,
    activeSheet: firstSheetName,
    isMatrixFormat: false,
    headers,
    rawRowsCount: rawData.length,
    columnMapping,
    rows,
    summary,
  };
}

export function processParsedRows(
  rawRows: any[],
  columnMapping: Record<string, string>,
  existingClients: Client[] = []
): ParsedClientRow[] {
  const existingPhoneMap = new Map<string, Client>();
  existingClients.forEach((c) => {
    if (c.phone) existingPhoneMap.set(cleanPhoneNumber(c.phone), c);
  });

  const seenPhonesInBatch = new Set<string>();
  const mappedExcelHeaders = new Set(Object.values(columnMapping).filter(Boolean));

  return rawRows
    .map((raw, idx) => {
      const getVal = (targetKey: string): any => {
        const header = columnMapping[targetKey];
        return header ? raw[header] : undefined;
      };

      const name = String(getVal('name') || '').trim();
      const rawPhone = getVal('phone');
      const phone = cleanPhoneNumber(rawPhone);
      const email = String(getVal('email') || '').trim();
      const dateOfBirth = parseDateValue(getVal('dateOfBirth')) || '1990-01-01';

      let gender: 'MALE' | 'FEMALE' | 'OTHER' = 'MALE';
      const rawGender = String(getVal('gender') || '').toUpperCase().trim();
      if (rawGender.startsWith('F') || rawGender.includes('FEMALE') || rawGender.includes('महिला')) {
        gender = 'FEMALE';
      }

      const address = String(getVal('address') || '').trim();
      const city = String(getVal('city') || 'Miraj').trim() || 'Miraj';
      const state = String(getVal('state') || 'Maharashtra').trim() || 'Maharashtra';
      const pinCode = String(getVal('pinCode') || '416410').trim() || '416410';

      const occupation = String(getVal('occupation') || 'Self-Employed').trim() || 'Self-Employed';
      const companyName = String(getVal('companyName') || '').trim();
      const monthlyIncome = cleanNumber(getVal('monthlyIncome'), 35000);

      const bankName = String(getVal('bankName') || '').trim();
      const accountNumber = String(getVal('accountNumber') || '').trim();
      const accountHolderName = String(getVal('accountHolderName') || name).trim() || name;
      const ifscCode = String(getVal('ifscCode') || '').trim().toUpperCase();

      const nomineeName = String(getVal('nomineeName') || '').trim();
      const nomineeRelationship = String(getVal('nomineeRelationship') || 'Spouse').trim() || 'Spouse';
      const nomineePhone = cleanPhoneNumber(getVal('nomineePhone'));

      const srNo = getVal('srNo') !== undefined && getVal('srNo') !== '' ? getVal('srNo') : idx + 1;
      const memberNumber = String(getVal('memberNumber') || (srNo ? `SB-${srNo}` : '')).trim();
      const aadhaarNumber = String(getVal('aadhaarNumber') || '').replace(/[^0-9]/g, '');
      const panNumber = String(getVal('panNumber') || '').toUpperCase().trim();
      const bishiGroupName = String(getVal('bishiGroupName') || 'साई बीशी मंडळ').trim();
      const monthlyInstallment = cleanNumber(getVal('monthlyInstallment'), 0);
      const monthsPaid = cleanNumber(getVal('monthsPaid'), 0);
      const totalMonths = cleanNumber(getVal('totalMonths'), 12);
      const penaltyAmount = cleanNumber(getVal('penaltyAmount'), 0);
      const totalPaid = cleanNumber(getVal('totalPaid'), monthlyInstallment > 0 && monthsPaid > 0 ? monthlyInstallment * monthsPaid : 0);
      const balanceAmount = cleanNumber(getVal('balanceAmount'), monthlyInstallment > 0 && totalMonths > 0 ? Math.max(0, (monthlyInstallment * totalMonths) - totalPaid) : 0);

      let clientType: ClientType = 'INVESTOR';
      const rawType = String(getVal('clientType') || '').toUpperCase();
      if (rawType.includes('BOTH') || (rawType.includes('INVEST') && rawType.includes('BORROW'))) {
        clientType = 'INVESTOR_BORROWER';
      } else if (rawType.includes('BORROW') || rawType.includes('LOAN') || rawType.includes('कर्जदार')) {
        clientType = 'BORROWER';
      }

      let status: ClientStatus = 'ACTIVE';
      const rawStatus = String(getVal('status') || '').toUpperCase();
      if (rawStatus.includes('INACTIVE')) status = 'INACTIVE';
      else if (rawStatus.includes('PENDING')) status = 'PENDING_VERIFICATION';

      let kycStatus: KycStatus = 'VERIFIED';
      const rawKyc = String(getVal('kycStatus') || '').toUpperCase();
      if (rawKyc.includes('PENDING')) kycStatus = 'PENDING';
      else if (rawKyc.includes('NOT') || rawKyc.includes('UNVERIFIED')) kycStatus = 'NOT_SUBMITTED';
      else if (rawKyc.includes('REJECT')) kycStatus = 'REJECTED';

      const notes = String(getVal('notes') || 'Imported via Excel').trim();
      const initialInvestmentAmount = cleanNumber(getVal('initialInvestmentAmount'), monthlyInstallment > 0 ? totalPaid : 0);
      const investmentPlanDurationMonths = cleanNumber(getVal('investmentPlanDurationMonths'), totalMonths || 12);
      const investmentReturnRate = cleanNumber(getVal('investmentReturnRate'), 14);

      const initialLoanAmount = cleanNumber(getVal('initialLoanAmount'), 0);
      const loanInterestRate = cleanNumber(getVal('loanInterestRate'), 14);
      const loanTenureMonths = cleanNumber(getVal('loanTenureMonths'), 12);

      const customFields: Record<string, any> = {};
      Object.keys(raw).forEach((headerKey) => {
        if (!mappedExcelHeaders.has(headerKey) && raw[headerKey] !== undefined && raw[headerKey] !== '') {
          customFields[headerKey] = raw[headerKey];
        }
      });

      const errors: string[] = [];
      const warnings: string[] = [];

      if (!name) errors.push('Full Name is required');

      let isDuplicate = false;
      let duplicateClient: Client | undefined;

      if (phone && existingPhoneMap.has(phone)) {
        isDuplicate = true;
        duplicateClient = existingPhoneMap.get(phone);
        warnings.push(`Existing client found: ${duplicateClient?.name} (${duplicateClient?.id})`);
      }

      const isValid = errors.length === 0;

      return {
        rowIndex: idx + 1,
        raw,
        data: {
          name,
          phone: phone || `98${String(10000000 + idx).slice(-8)}`,
          email: email || `${phone || idx}@saibishi.in`,
          gender,
          dateOfBirth,
          address,
          city,
          state,
          pinCode,
          occupation,
          companyName,
          monthlyIncome,
          bankName,
          accountHolderName,
          accountNumber,
          ifscCode,
          nomineeName,
          nomineeRelationship,
          nomineePhone,
          clientType,
          status,
          kycStatus,
          notes,
          srNo,
          memberNumber,
          aadhaarNumber,
          panNumber,
          bishiGroupName,
          monthlyInstallment,
          monthsPaid,
          totalMonths,
          penaltyAmount,
          totalPaid,
          balanceAmount,
          customFields,
          initialInvestmentAmount,
          investmentPlanDurationMonths,
          investmentReturnRate,
          initialLoanAmount,
          loanInterestRate,
          loanTenureMonths,
        },
        isValid,
        isDuplicate,
        duplicateClient,
        errors,
        warnings,
      };
    })
    .filter((row) => row.data.name);
}

export function calculateSummary(rows: ParsedClientRow[]) {
  let total = rows.length;
  let valid = 0;
  let duplicates = 0;
  let errors = 0;
  let totalInvestments = 0;
  let totalLoans = 0;
  let totalMonthlyInstallments = 0;

  for (const r of rows) {
    if (r.isValid) valid++;
    else errors++;
    if (r.isDuplicate) duplicates++;
    if (r.data.initialInvestmentAmount && r.data.initialInvestmentAmount > 0) {
      totalInvestments += r.data.initialInvestmentAmount;
    }
    if (r.data.initialLoanAmount && r.data.initialLoanAmount > 0) {
      totalLoans += r.data.initialLoanAmount;
    }
    if (r.data.monthlyInstallment && r.data.monthlyInstallment > 0) {
      totalMonthlyInstallments += r.data.monthlyInstallment;
    }
  }

  return {
    total,
    valid,
    duplicates,
    errors,
    totalInvestments,
    totalLoans,
    totalMonthlyInstallments,
  };
}

/**
 * Generate and download Sample Excel Template matching the exact Sai Bhishi Mandale Month Matrix format!
 */
export function downloadSampleClientTemplate(format: 'xlsx' | 'csv' = 'xlsx') {
  // Title row + 2-level header matrix matching the user's Excel sheet
  const rows = [
    ['SAI BHISHI MANDALE -3  OCT 25 TO SEP 26', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['SR', 'NAME', 'AMT', '1', '', '2', '', '3', '', '4', '', '5', '', '6', ''],
    ['', '', '', 'OCT', 'DATE', 'NOV', 'DATE', 'DEC', 'DATE', 'JAN', 'DATE', 'FEB', 'DATE', 'MAR', 'DATE'],
    [1, 'RESHAMA JAMADAR', 26000, 26000, '13/11/25', 26000, '10/12/2025', 26000, '10/01/2026', 26000, '', 26000, '', 26000, ''],
    [2, 'RAVASHAEB SHINGE', 20000, 20000, '24/11/25', 5000, '01/12/2025', 5000, '29/12/2025', 5000, '', 5000, '', 10000, ''],
    ['', 'RAVASHAEB SHINGE', '', '', '', 5000, '15/12/2025', 10000, '01/01/2026', 5000, '', 5000, '', 5000, ''],
    ['', 'RAVASHAEB SHINGE', '', '', '', 10000, '', 5000, '12/01/2026', 5000, '', 5000, '', 5000, ''],
    [3, 'DHIRASHIL PAWAR', 20000, 20000, '13/11/25', 20000, '', 20000, '', 20000, '', 20000, '', 20000, ''],
    [4, 'ATUL GHATAGE', 10000, 10000, '15/11/25', 10000, '', 10000, '01/01/2026', 10000, '', 10000, '', 10000, ''],
    [5, 'ANURADHA KANGANKAR', 8000, 8000, '15/11/25', 8000, '', 8000, '01/01/2026', 8000, '', 8000, '', 8000, ''],
    [6, 'KAPIL SAWANT', 8000, 8000, '15/11/25', 8000, '', 8000, '', 8000, '', 0, '', '', ''],
    [7, 'SUSHIL SATPUTE', 6000, 6000, '15/11/25', 6000, '', 6000, '', 6000, '', 6000, '', '', ''],
    [8, 'MALAN AJETRAO', 5000, 5000, '15/11/25', 5000, '', 5000, '01/01/2026', 5000, '', 5000, '', 5000, ''],
    [9, 'DHONDIRAM AJETRAO', 5000, 5000, '15/11/25', 5000, '', 5000, '01/01/2026', 5000, '', 5000, '', 5000, ''],
    [10, 'BASSAPA SALGARE', 5000, 5000, '15/11/25', 5000, '', 5000, '12/01/2026', 5000, '', 5000, '', 5000, ''],
    [11, 'INDARNIL MANE', 5000, 5000, '13/11/25', 5000, '', 5000, '', 5000, '', 5000, '', '', ''],
    [12, 'RAVINDR KAMBALE', 5000, 5000, '13/11/25', 5000, '', 5000, '', 5000, '', 5000, '', '', ''],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  const colWidths = [
    { wch: 6 }, // SR
    { wch: 25 }, // NAME
    { wch: 10 }, // AMT
    { wch: 10 }, // M1
    { wch: 12 }, // DATE
    { wch: 10 }, // M2
    { wch: 12 }, // DATE
    { wch: 10 }, // M3
    { wch: 12 }, // DATE
    { wch: 10 }, // M4
    { wch: 12 }, // DATE
    { wch: 10 }, // M5
    { wch: 12 }, // DATE
    { wch: 10 }, // M6
    { wch: 12 }, // DATE
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SAI_BHISHI_MANDALE');

  const fileExt = format === 'xlsx' ? 'xlsx' : 'csv';
  const fileName = `Sai_Bhishi_Mandale_Format_Template.${fileExt}`;

  XLSX.writeFile(workbook, fileName, { bookType: format });
}
