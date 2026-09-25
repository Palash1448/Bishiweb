export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION';
  createdAt: string;
  lastLoginAt?: string;
  clientId?: string; // If user is a client
}

export type ClientType = 'INVESTOR' | 'BORROWER' | 'INVESTOR_BORROWER';
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION';
export type KycStatus = 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED';

export interface MonthlyPaymentSplit {
  amount: number;
  date?: string;
  notes?: string;
}

export interface MonthlyLedgerEntry {
  monthIndex: number; // 1, 2, 3...
  monthName: string; // OCT, NOV, DEC, JAN, FEB, MAR...
  amountDue: number; // Target installment amount (AMT)
  amountPaid: number; // Total amount paid in this month
  paymentDate?: string; // Date of primary or latest payment
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'ADVANCE';
  splits?: MonthlyPaymentSplit[]; // Individual sub-payments for that month
}

export interface Client {
  id: string; // e.g. MB-10024
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  
  // Address
  address: string;
  city: string;
  state: string;
  pinCode: string;
  
  // Professional
  occupation: string;
  companyName: string;
  monthlyIncome: number;
  
  // Bank Information
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  
  // Nominee
  nomineeName: string;
  nomineeRelationship: string;
  nomineePhone: string;
  
  // Status & Flags
  clientType: ClientType;
  kycStatus: KycStatus;
  status: ClientStatus;
  notes?: string;
  avatarUrl?: string;

  // Bhishi / Chit Fund Specific Fields from Excel
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

  // Dynamic Custom Fields imported from Excel columns
  customFields?: Record<string, any>;
  
  // Month-by-month Bhishi Ledger (from Matrix Sheet)
  monthlyLedger?: MonthlyLedgerEntry[];

  // Portal Login Credentials & Access
  portalAccessEnabled?: boolean;
  loginId?: string; // Custom username or default client ID / email / phone
  password?: string; // Portal access password / PIN
  lastPortalLoginAt?: string;

  // Aggregates
  totalInvested: number;
  activeInvestmentsCount: number;
  totalLoanAmount: number;
  outstandingLoanAmount: number;
  activeLoansCount: number;
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface InvestmentPlan {
  id: string; // e.g. PLAN-101
  name: string;
  code: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  durationMonths: number;
  returnRate: number; // in %
  paymentFrequency: 'MONTHLY' | 'QUARTERLY' | 'LUMP_SUM';
  status: 'ACTIVE' | 'INACTIVE';
  color: string;
  createdAt: string;
}

export type InvestmentStatus = 'PENDING' | 'ACTIVE' | 'MATURED' | 'CLOSED' | 'CANCELLED';

export interface Investment {
  id: string; // e.g. INV-10001
  clientId: string;
  clientName: string;
  clientPhone?: string;
  planId: string;
  planName: string;
  amount: number;
  returnRate: number; // percentage
  durationMonths: number;
  startDate: string;
  maturityDate: string;
  expectedReturn: number;
  totalPayout: number;
  returnsPaid: number;
  status: InvestmentStatus;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export type LoanStatus = 
  | 'PENDING' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'DISBURSED' 
  | 'ACTIVE' 
  | 'OVERDUE' 
  | 'CLOSED';

export type EmiStatus = 'UPCOMING' | 'DUE' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE';

export interface EmiScheduleItem {
  emiNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  emiAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: EmiStatus;
  paidDate?: string;
  paymentId?: string;
  paymentMethod?: PaymentMethod;
  transactionReference?: string;
  penalty?: number;
}

export interface Guarantor {
  name: string;
  phone: string;
  relationship: string;
  address: string;
  occupation?: string;
}

export interface Loan {
  id: string; // e.g. LN-10001
  clientId: string;
  clientName: string;
  clientPhone?: string;
  requestedAmount: number;
  approvedAmount: number;
  loanPurpose: string;
  interestRate: number; // Annual %
  tenureMonths: number;
  monthlyIncome: number;
  existingLiabilities?: number;
  
  // Bank details for disbursement
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  
  guarantor: Guarantor;
  
  // Calculations
  emiAmount: number;
  totalInterest: number;
  totalPayable: number;
  amountPaid: number;
  principalPaid: number;
  interestPaid: number;
  outstandingAmount: number;
  
  status: LoanStatus;
  rejectionReason?: string;
  approvalNotes?: string;
  
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  disbursementMethod?: PaymentMethod;
  disbursementRef?: string;
  
  emiSchedule: EmiScheduleItem[];
  nextEmiDate?: string;
  nextEmiAmount?: number;
  overdueAmount: number;
  
  createdAt: string;
  createdBy: string;
}

export type PaymentType = 
  | 'INVESTMENT_PAYMENT' 
  | 'INVESTMENT_RETURN' 
  | 'LOAN_EMI' 
  | 'LOAN_DISBURSEMENT' 
  | 'PENALTY' 
  | 'OTHER';

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';
export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string; // e.g. PAY-10001
  clientId: string;
  clientName: string;
  loanId?: string;
  investmentId?: string;
  emiNumber?: number;
  paymentType: PaymentType;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  paymentDate: string;
  status: PaymentStatus;
  recordedBy: string;
  notes?: string;
  receiptNumber: string;
  createdAt: string;
}

export type TransactionType = 
  | 'INVESTMENT' 
  | 'INVESTMENT_RETURN' 
  | 'LOAN_DISBURSEMENT' 
  | 'LOAN_EMI' 
  | 'PENALTY' 
  | 'OTHER';

export type TransactionNature = 'CREDIT' | 'DEBIT';

export interface Transaction {
  id: string; // e.g. TXN-10001
  clientId: string;
  clientName: string;
  loanId?: string;
  investmentId?: string;
  type: TransactionType;
  nature: TransactionNature;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  date: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  description: string;
  createdBy: string;
  createdAt: string;
}

export type DocumentType = 
  | 'AADHAAR' 
  | 'PAN' 
  | 'ADDRESS_PROOF' 
  | 'INCOME_PROOF' 
  | 'BANK_PROOF' 
  | 'LOAN_AGREEMENT' 
  | 'OTHER';

export interface DocumentItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  documentType: DocumentType;
  clientId?: string;
  clientName?: string;
  loanId?: string;
  investmentId?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 
    | 'LOAN_APPLICATION' 
    | 'LOAN_APPROVED' 
    | 'LOAN_REJECTED' 
    | 'EMI_DUE' 
    | 'EMI_OVERDUE' 
    | 'INVESTMENT_MATURITY' 
    | 'PAYMENT_RECEIVED' 
    | 'SYSTEM';
  read: boolean;
  createdAt: string;
  clientId?: string;
  loanId?: string;
  investmentId?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: 'CLIENTS' | 'INVESTMENTS' | 'LOANS' | 'PAYMENTS' | 'TRANSACTIONS' | 'SETTINGS' | 'AUTH';
  recordId: string;
  previousValue?: string | Record<string, any>;
  newValue?: string | Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}

export interface BusinessSettings {
  businessName: string;
  logoUrl: string;
  tagline: string;
  contactEmail: string;
  supportPhone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  gstNumber: string;
  panNumber: string;
  defaultInterestRate: number;
  defaultLatePenaltyPercent: number;
  currency: string;
  financialYearStart: string;
}

export interface DashboardStats {
  totalClients: number;
  totalInvestmentsAmount: number;
  activeInvestmentsAmount: number;
  activeInvestmentsCount: number;
  activeLoansCount: number;
  activeLoansAmount: number;
  loanOutstandingAmount: number;
  pendingLoanApplicationsCount: number;
  todayCollectionAmount: number;
  overdueAmount: number;
  monthlyGrowthPercent: number;
}
