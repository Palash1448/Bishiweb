import {
  AuditLog,
  BusinessSettings,
  Client,
  DocumentItem,
  Investment,
  InvestmentPlan,
  Loan,
  Notification,
  Payment,
  Transaction,
  User,
} from '../types';

export const initialUsers: User[] = [
  {
    id: 'USR-001',
    name: 'Palash Borgave',
    email: 'admin@mybishi.in',
    role: 'SUPER_ADMIN',
    phone: '+91 98765 43210',
    status: 'ACTIVE',
    createdAt: '2025-01-15T10:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'USR-002',
    name: 'Suresh Raina',
    email: 'manager@mybishi.in',
    role: 'MANAGER',
    phone: '+91 98230 11223',
    status: 'ACTIVE',
    createdAt: '2025-02-01T11:30:00.000Z',
    lastLoginAt: '2026-09-10T14:20:00.000Z',
  },
  {
    id: 'USR-003',
    name: 'Pooja Sharma',
    email: 'staff@mybishi.in',
    role: 'STAFF',
    phone: '+91 97654 88990',
    status: 'ACTIVE',
    createdAt: '2025-03-10T09:15:00.000Z',
    lastLoginAt: '2026-09-11T16:45:00.000Z',
  },
];

export const initialBusinessSettings: BusinessSettings = {
  businessName: 'साई बीशी मंडळ मिरज',
  logoUrl: '/logo.png',
  tagline: 'विश्वसनीय बीशी बचत व पतपुरवठा संस्था, मिरज',
  contactEmail: 'contact@saibishimiraj.in',
  supportPhone: '+91 98220 12345',
  address: 'मेन रोड, छत्रपती शिवाजी महाराज चौक',
  city: 'मिरज (Miraj)',
  state: 'महाराष्ट्र (Maharashtra)',
  pinCode: '416410',
  gstNumber: '27AABCU9603R1ZM',
  panNumber: 'AABCU9603R',
  defaultInterestRate: 14.0,
  defaultLatePenaltyPercent: 2.0,
  currency: 'INR',
  financialYearStart: '2026-04-01',
};

export const initialInvestmentPlans: InvestmentPlan[] = [
  {
    id: 'PLAN-GOLD-12M',
    name: 'Bishi Gold Pool (12 Months)',
    code: 'BISHI-GOLD',
    description: 'High-yield 12-month fixed term pool with monthly compound dividend disbursement.',
    durationMonths: 12,
    returnRate: 14.5,
    minAmount: 50000,
    maxAmount: 2500000,
    paymentFrequency: 'MONTHLY',
    status: 'ACTIVE',
    color: '#059669',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'PLAN-SILVER-6M',
    name: 'Bishi Silver Pool (6 Months)',
    code: 'BISHI-SILVER',
    description: 'Medium-term steady pool with quarterly dividend distribution and flexible top-ups.',
    durationMonths: 6,
    returnRate: 11.0,
    minAmount: 25000,
    maxAmount: 1000000,
    paymentFrequency: 'QUARTERLY',
    status: 'ACTIVE',
    color: '#3b82f6',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'PLAN-GROWTH-24M',
    name: 'Bishi Elite Growth (24 Months)',
    code: 'BISHI-GROWTH',
    description: 'Long term compounding capital pool with maturity bonus and guaranteed dividend yield.',
    durationMonths: 24,
    returnRate: 16.8,
    minAmount: 100000,
    maxAmount: 5000000,
    paymentFrequency: 'LUMP_SUM',
    status: 'ACTIVE',
    color: '#7c3aed',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

// Clean empty arrays - No dummy demo records
export const initialClients: Client[] = [];
export const initialInvestments: Investment[] = [];
export const initialLoans: Loan[] = [];
export const initialPayments: Payment[] = [];
export const initialTransactions: Transaction[] = [];
export const initialDocuments: DocumentItem[] = [];
export const initialNotifications: Notification[] = [];
export const initialAuditLogs: AuditLog[] = [];
