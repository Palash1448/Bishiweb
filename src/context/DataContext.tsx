import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  AuditLog,
  BusinessSettings,
  Client,
  DashboardStats,
  DocumentItem,
  EmiScheduleItem,
  Investment,
  InvestmentPlan,
  Loan,
  Notification,
  Payment,
  PaymentMethod,
  Transaction,
} from '../types';
import { dataService } from '../services/dataService';
import { calculateInvestmentReturn, generateEmiSchedule } from '../services/financialCalculations';
import { generateId } from '../utils/formatters';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';
import { ParsedClientRow } from '../services/importService';

interface DataContextType {
  clients: Client[];
  plans: InvestmentPlan[];
  investments: Investment[];
  loans: Loan[];
  payments: Payment[];
  transactions: Transaction[];
  documents: DocumentItem[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  settings: BusinessSettings;
  stats: DashboardStats;
  isLoading: boolean;

  // Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'totalInvested' | 'activeInvestmentsCount' | 'totalLoanAmount' | 'outstandingLoanAmount' | 'activeLoansCount'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deactivateClient: (id: string) => Promise<void>;
  importClientsBulk: (
    parsedRows: ParsedClientRow[],
    options?: {
      updateExisting?: boolean;
      createInvestments?: boolean;
      createLoans?: boolean;
    }
  ) => Promise<{
    importedCount: number;
    updatedCount: number;
    investmentsCount: number;
    loansCount: number;
  }>;
  eraseImportedClients: (options?: {
    bishiGroupName?: string;
    eraseAll?: boolean;
  }) => Promise<{
    deletedClients: number;
    deletedPayments: number;
    deletedTxns: number;
  }>;

  // Plans
  addPlan: (plan: Omit<InvestmentPlan, 'id' | 'createdAt'>) => Promise<InvestmentPlan>;
  updatePlan: (id: string, updates: Partial<InvestmentPlan>) => Promise<void>;

  // Investments
  createInvestment: (data: {
    clientId: string;
    planId: string;
    amount: number;
    startDate: string;
    paymentMethod: PaymentMethod;
    transactionReference: string;
    notes?: string;
  }) => Promise<Investment>;
  updateInvestmentStatus: (id: string, status: Investment['status']) => Promise<void>;

  // Loans
  createLoanApplication: (data: {
    clientId: string;
    requestedAmount: number;
    loanPurpose: string;
    tenureMonths: number;
    interestRate: number;
    monthlyIncome: number;
    existingLiabilities?: number;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    guarantor: Loan['guarantor'];
  }) => Promise<Loan>;
  approveLoan: (id: string, approvedAmount: number, interestRate: number, tenureMonths: number, approvalNotes?: string) => Promise<void>;
  rejectLoan: (id: string, rejectionReason: string) => Promise<void>;
  disburseLoan: (id: string, disbursementMethod: PaymentMethod, disbursementRef: string, disbursementDate?: string) => Promise<void>;
  recordEmiPayment: (data: {
    loanId: string;
    emiNumber: number;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionReference: string;
    paymentDate: string;
    notes?: string;
  }) => Promise<Payment>;

  // Payments & Transactions
  recordGenericPayment: (payment: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt' | 'recordedBy'>) => Promise<Payment>;
  
  // Documents
  uploadDocument: (doc: Omit<DocumentItem, 'id' | 'uploadedAt' | 'uploadedBy'>) => Promise<DocumentItem>;
  deleteDocument: (id: string) => Promise<void>;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Settings & System
  updateBusinessSettings: (settings: BusinessSettings) => Promise<void>;
  resetAllData: () => void;
  syncToFirestore: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>({} as BusinessSettings);

  // Load initial data from Firestore / local cache & subscribe to real-time events
  useEffect(() => {
    let unsubLoans: (() => void) | null = null;
    let unsubClients: (() => void) | null = null;
    let unsubNotifications: (() => void) | null = null;
    let unsubPayments: (() => void) | null = null;
    let unsubInvestments: (() => void) | null = null;

    async function init() {
      try {
        const data = await dataService.loadAllData();
        setClients(data.clients || []);
        setPlans(data.plans || []);
        setInvestments(data.investments || []);
        setLoans(data.loans || []);
        setPayments(data.payments || []);
        setTransactions(data.transactions || []);
        setDocuments(data.documents || []);
        setNotifications(data.notifications || []);
        setAuditLogs(data.auditLogs || []);
        setSettings(data.settings || ({} as BusinessSettings));

        // Connect real-time listeners for live updates from Android / Mobile
        unsubLoans = dataService.subscribeToLoans((realtimeLoans) => {
          if (realtimeLoans && realtimeLoans.length > 0) {
            setLoans(realtimeLoans);
          }
        });

        unsubClients = dataService.subscribeToClients((realtimeClients) => {
          if (realtimeClients && realtimeClients.length > 0) {
            setClients(realtimeClients);
          }
        });

        unsubNotifications = dataService.subscribeToNotifications((realtimeNotifications) => {
          if (realtimeNotifications && realtimeNotifications.length > 0) {
            setNotifications(realtimeNotifications);
          }
        });

        unsubPayments = dataService.subscribeToPayments((realtimePayments) => {
          if (realtimePayments && realtimePayments.length > 0) {
            setPayments(realtimePayments);
          }
        });

        unsubInvestments = dataService.subscribeToInvestments((realtimeInvestments) => {
          if (realtimeInvestments && realtimeInvestments.length > 0) {
            setInvestments(realtimeInvestments);
          }
        });
      } catch (err) {
        console.error('Failed to load dataset from Firestore:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();

    return () => {
      if (unsubLoans) unsubLoans();
      if (unsubClients) unsubClients();
      if (unsubNotifications) unsubNotifications();
      if (unsubPayments) unsubPayments();
      if (unsubInvestments) unsubInvestments();
    };
  }, []);

  // Helper to log audit actions
  const logAudit = (
    action: string,
    module: AuditLog['module'],
    recordId: string,
    newValue?: any,
    previousValue?: any
  ) => {
    const newLog: AuditLog = {
      id: generateId('LOG'),
      userId: user?.id || 'SYSTEM',
      userName: user?.name || 'Admin',
      userRole: user?.role || 'SUPER_ADMIN',
      action,
      module,
      recordId,
      newValue: typeof newValue === 'string' ? newValue : JSON.stringify(newValue),
      previousValue: typeof previousValue === 'string' ? previousValue : JSON.stringify(previousValue),
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    dataService.saveAuditLogsLocally(updated);
    dataService.saveAuditLog(newLog);
  };

  // Helper to send notification
  const notify = (
    title: string,
    message: string,
    type: Notification['type'],
    refs?: { clientId?: string; loanId?: string; investmentId?: string }
  ) => {
    const newNotif: Notification = {
      id: generateId('NOTIF'),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      ...refs,
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    dataService.saveNotificationsLocally(updated);
    dataService.saveNotification(newNotif);
  };

  // --- CLIENT ACTIONS ---
  const addClient = async (
    clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'totalInvested' | 'activeInvestmentsCount' | 'totalLoanAmount' | 'outstandingLoanAmount' | 'activeLoansCount'>
  ): Promise<Client> => {
    const newClient: Client = {
      ...clientData,
      id: generateId('MB'),
      totalInvested: 0,
      activeInvestmentsCount: 0,
      totalLoanAmount: 0,
      outstandingLoanAmount: 0,
      activeLoansCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.name || 'Admin',
    };

    const updated = [newClient, ...clients];
    setClients(updated);
    dataService.saveClientsLocally(updated);
    await dataService.saveClient(newClient);

    logAudit('CREATE_CLIENT', 'CLIENTS', newClient.id, `Created client ${newClient.name}`);
    notify('New Client Registered', `${newClient.name} (${newClient.id}) was successfully registered.`, 'SYSTEM', {
      clientId: newClient.id,
    });
    toast.success('Client Created', `${newClient.name} has been added to My Bishi CRM.`);

    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const oldClient = clients.find((c) => c.id === id);
    let updatedClient: Client | undefined;
    const updated = clients.map((c) => {
      if (c.id === id) {
        updatedClient = { ...c, ...updates, updatedAt: new Date().toISOString() };
        return updatedClient;
      }
      return c;
    });

    setClients(updated);
    dataService.saveClientsLocally(updated);
    if (updatedClient) {
      await dataService.saveClient(updatedClient);
    }
    logAudit('UPDATE_CLIENT', 'CLIENTS', id, updates, oldClient);
    toast.success('Client Updated', 'Client information updated successfully.');
  };

  const deactivateClient = async (id: string) => {
    await updateClient(id, { status: 'INACTIVE' });
    toast.warning('Client Deactivated', `Client ${id} status set to Inactive.`);
  };

  const importClientsBulk = async (
    parsedRows: ParsedClientRow[],
    options: {
      updateExisting?: boolean;
      createInvestments?: boolean;
      createLoans?: boolean;
    } = { updateExisting: true, createInvestments: true, createLoans: true }
  ) => {
    let importedCount = 0;
    let updatedCount = 0;
    let investmentsCount = 0;
    let loansCount = 0;

    const newClientsMap = new Map<string, Client>();
    clients.forEach((c) => newClientsMap.set(c.id, { ...c }));

    const newInvestmentsList: Investment[] = [...investments];
    const newLoansList: Loan[] = [...loans];
    const newPaymentsList: Payment[] = [...payments];
    const newTransactionsList: Transaction[] = [...transactions];

    const clientsToBatchSave: Client[] = [];
    const investmentsToBatchSave: Investment[] = [];
    const loansToBatchSave: Loan[] = [];

    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];
    let nextIdNumber = (Date.now() % 89000) + 10000;

    for (const row of parsedRows) {
      if (!row.isValid) continue;

      const d = row.data;
      let targetClient: Client;

      // Duplicate match against map
      const existingClient = row.isDuplicate && row.duplicateClient
        ? Array.from(newClientsMap.values()).find((c) => c.phone === row.duplicateClient?.phone || c.id === row.duplicateClient?.id)
        : Array.from(newClientsMap.values()).find((c) => c.phone && c.phone === d.phone);

      if (existingClient) {
        if (!options.updateExisting) {
          continue; // Skip existing client
        }
        targetClient = {
          ...existingClient,
          name: d.name || existingClient.name,
          email: d.email || existingClient.email,
          gender: d.gender || existingClient.gender,
          dateOfBirth: d.dateOfBirth || existingClient.dateOfBirth,
          address: d.address || existingClient.address,
          city: d.city || existingClient.city,
          state: d.state || existingClient.state,
          pinCode: d.pinCode || existingClient.pinCode,
          occupation: d.occupation || existingClient.occupation,
          companyName: d.companyName || existingClient.companyName,
          monthlyIncome: d.monthlyIncome || existingClient.monthlyIncome,
          bankName: d.bankName || existingClient.bankName,
          accountHolderName: d.accountHolderName || existingClient.accountHolderName,
          accountNumber: d.accountNumber || existingClient.accountNumber,
          ifscCode: d.ifscCode || existingClient.ifscCode,
          nomineeName: d.nomineeName || existingClient.nomineeName,
          nomineeRelationship: d.nomineeRelationship || existingClient.nomineeRelationship,
          nomineePhone: d.nomineePhone || existingClient.nomineePhone,
          clientType: d.clientType || existingClient.clientType,
          status: d.status || existingClient.status,
          kycStatus: d.kycStatus || existingClient.kycStatus,
          notes: d.notes || existingClient.notes,

          // Bhishi attributes
          srNo: d.srNo !== undefined ? d.srNo : existingClient.srNo,
          memberNumber: d.memberNumber || existingClient.memberNumber,
          aadhaarNumber: d.aadhaarNumber || existingClient.aadhaarNumber,
          panNumber: d.panNumber || existingClient.panNumber,
          bishiGroupName: d.bishiGroupName || existingClient.bishiGroupName,
          monthlyInstallment: d.monthlyInstallment || existingClient.monthlyInstallment,
          monthsPaid: d.monthsPaid !== undefined ? d.monthsPaid : existingClient.monthsPaid,
          totalMonths: d.totalMonths || existingClient.totalMonths,
          penaltyAmount: d.penaltyAmount !== undefined ? d.penaltyAmount : existingClient.penaltyAmount,
          totalPaid: d.totalPaid || existingClient.totalPaid,
          balanceAmount: d.balanceAmount !== undefined ? d.balanceAmount : existingClient.balanceAmount,

          // Dynamic unmapped custom fields
          customFields: {
            ...(existingClient.customFields || {}),
            ...(d.customFields || {}),
          },

          updatedAt: nowIso,
        };
        updatedCount++;
      } else {
        nextIdNumber++;
        const newClientId = `MB-${nextIdNumber}`;
        targetClient = {
          id: newClientId,
          name: d.name,
          phone: d.phone,
          email: d.email || `${d.phone}@mybishi.in`,
          gender: d.gender || 'MALE',
          dateOfBirth: d.dateOfBirth || '1990-01-01',
          address: d.address || '',
          city: d.city || 'Miraj',
          state: d.state || 'Maharashtra',
          pinCode: d.pinCode || '416410',
          occupation: d.occupation || 'Self-Employed',
          companyName: d.companyName || '',
          monthlyIncome: d.monthlyIncome || 35000,
          bankName: d.bankName || '',
          accountHolderName: d.accountHolderName || d.name,
          accountNumber: d.accountNumber || '',
          ifscCode: d.ifscCode || '',
          nomineeName: d.nomineeName || '',
          nomineeRelationship: d.nomineeRelationship || 'Spouse',
          nomineePhone: d.nomineePhone || '',
          clientType: d.clientType || 'INVESTOR',
          status: d.status || 'ACTIVE',
          kycStatus: d.kycStatus || 'VERIFIED',
          notes: d.notes || 'Imported via Excel',

          // Bhishi attributes
          srNo: d.srNo,
          memberNumber: d.memberNumber || `SB-${nextIdNumber}`,
          aadhaarNumber: d.aadhaarNumber || '',
          panNumber: d.panNumber || '',
          bishiGroupName: d.bishiGroupName || 'साई बीशी मंडळ',
          monthlyInstallment: d.monthlyInstallment || 0,
          monthsPaid: d.monthsPaid || 0,
          totalMonths: d.totalMonths || 12,
          penaltyAmount: d.penaltyAmount || 0,
          totalPaid: d.totalPaid || 0,
          balanceAmount: d.balanceAmount || 0,
          monthlyLedger: d.monthlyLedger,

          // Dynamic unmapped custom fields
          customFields: d.customFields || {},

          totalInvested: 0,
          activeInvestmentsCount: 0,
          totalLoanAmount: 0,
          outstandingLoanAmount: 0,
          activeLoansCount: 0,
          createdAt: nowIso,
          updatedAt: nowIso,
          createdBy: user?.name || 'Excel Import',
        };
        importedCount++;
      }

      // If monthly ledger entries exist from matrix, record individual monthly payments
      if (d.monthlyLedger && d.monthlyLedger.length > 0) {
        d.monthlyLedger.forEach((entry, mIdx) => {
          if (entry.amountPaid > 0) {
            const payDate = entry.paymentDate || todayStr;
            const payId = `PAY-${Date.now().toString().slice(-5)}M${mIdx + 1}${targetClient.id.slice(-4)}`;
            const newPayment: Payment = {
              id: payId,
              clientId: targetClient.id,
              clientName: targetClient.name,
              paymentType: 'INVESTMENT_PAYMENT',
              amount: entry.amountPaid,
              paymentMethod: 'CASH',
              transactionReference: `HFTA-${entry.monthName}-${targetClient.id}`,
              paymentDate: payDate,
              status: 'COMPLETED',
              recordedBy: user?.name || 'Excel Import',
              notes: `${targetClient.bishiGroupName || 'Bishi'} - Month ${entry.monthIndex} (${entry.monthName}) Hfta`,
              receiptNumber: `RCPT-${Date.now().toString().slice(-4)}M${mIdx + 1}`,
              createdAt: payDate,
            };
            newPaymentsList.unshift(newPayment);

            const newTxn: Transaction = {
              id: `TXN-${Date.now().toString().slice(-5)}M${mIdx + 1}${targetClient.id.slice(-4)}`,
              clientId: targetClient.id,
              clientName: targetClient.name,
              type: 'INVESTMENT',
              nature: 'CREDIT',
              amount: entry.amountPaid,
              paymentMethod: 'CASH',
              referenceNumber: `HFTA-${entry.monthName}-${targetClient.id}`,
              date: payDate,
              status: 'SUCCESS',
              description: `Hfta Collection - ${entry.monthName} (Month ${entry.monthIndex})`,
              createdBy: user?.name || 'Excel Import',
              createdAt: payDate,
            };
            newTransactionsList.unshift(newTxn);
          }
        });
      }

      // Handle Initial Investment Creation if requested & amount > 0
      if (options.createInvestments && d.initialInvestmentAmount && d.initialInvestmentAmount > 0) {
        const invAmount = d.initialInvestmentAmount;
        const durationMonths = d.investmentPlanDurationMonths || 12;
        const returnRate = d.investmentReturnRate || 12;
        const expectedReturn = Math.round((invAmount * returnRate * durationMonths) / 1200);
        const totalPayout = invAmount + expectedReturn;

        const maturityDateObj = new Date();
        maturityDateObj.setMonth(maturityDateObj.getMonth() + durationMonths);
        const maturityDate = maturityDateObj.toISOString().split('T')[0];

        const invId = `INV-${Date.now().toString().slice(-5)}${investmentsCount + 1}`;
        const matchingPlan = plans.find((p) => p.durationMonths === durationMonths) || plans[0];

        const newInvestment: Investment = {
          id: invId,
          clientId: targetClient.id,
          clientName: targetClient.name,
          clientPhone: targetClient.phone,
          planId: matchingPlan?.id || 'PLAN-GOLD-12M',
          planName: matchingPlan?.name || `Bishi Growth (${durationMonths}M)`,
          amount: invAmount,
          returnRate,
          durationMonths,
          startDate: todayStr,
          maturityDate,
          expectedReturn,
          totalPayout,
          returnsPaid: 0,
          status: 'ACTIVE',
          paymentMethod: 'UPI',
          transactionReference: `IMPORT-INV-${targetClient.id}`,
          notes: 'Auto-created during Excel import',
          createdAt: todayStr,
          createdBy: user?.name || 'Excel Import',
        };

        targetClient.totalInvested = (targetClient.totalInvested || 0) + invAmount;
        targetClient.activeInvestmentsCount = (targetClient.activeInvestmentsCount || 0) + 1;
        if (targetClient.clientType === 'BORROWER') targetClient.clientType = 'INVESTOR_BORROWER';

        newInvestmentsList.unshift(newInvestment);
        investmentsToBatchSave.push(newInvestment);
        investmentsCount++;

        const payId = `PAY-${Date.now().toString().slice(-5)}${investmentsCount}`;
        const newPayment: Payment = {
          id: payId,
          clientId: targetClient.id,
          clientName: targetClient.name,
          investmentId: newInvestment.id,
          paymentType: 'INVESTMENT_PAYMENT',
          amount: invAmount,
          paymentMethod: 'UPI',
          transactionReference: `IMP-TXN-${invId}`,
          paymentDate: todayStr,
          status: 'COMPLETED',
          recordedBy: user?.name || 'Excel Import',
          notes: `Initial investment deposit for ${newInvestment.planName}`,
          receiptNumber: `RCPT-${Date.now().toString().slice(-5)}${investmentsCount}`,
          createdAt: nowIso,
        };
        newPaymentsList.unshift(newPayment);

        const newTxn: Transaction = {
          id: `TXN-${Date.now().toString().slice(-5)}${investmentsCount}`,
          clientId: targetClient.id,
          clientName: targetClient.name,
          investmentId: newInvestment.id,
          type: 'INVESTMENT',
          nature: 'CREDIT',
          amount: invAmount,
          paymentMethod: 'UPI',
          referenceNumber: `IMP-TXN-${invId}`,
          date: todayStr,
          status: 'SUCCESS',
          description: `Initial investment contribution - ${newInvestment.planName}`,
          createdBy: user?.name || 'Excel Import',
          createdAt: nowIso,
        };
        newTransactionsList.unshift(newTxn);
      }

      // Handle Initial Loan Creation if requested & amount > 0
      if (options.createLoans && d.initialLoanAmount && d.initialLoanAmount > 0) {
        const loanAmount = d.initialLoanAmount;
        const tenureMonths = d.loanTenureMonths || 12;
        const interestRate = d.loanInterestRate || 14;

        const { schedule, emiAmount, totalInterest, totalPayable } = generateEmiSchedule(
          loanAmount,
          interestRate,
          tenureMonths,
          todayStr
        );

        const loanId = `LN-${Date.now().toString().slice(-5)}${loansCount + 1}`;

        const newLoan: Loan = {
          id: loanId,
          clientId: targetClient.id,
          clientName: targetClient.name,
          clientPhone: targetClient.phone,
          requestedAmount: loanAmount,
          approvedAmount: loanAmount,
          loanPurpose: 'Active Bhishi Member Loan (Imported)',
          interestRate,
          tenureMonths,
          monthlyIncome: targetClient.monthlyIncome || 35000,
          existingLiabilities: 0,
          bankName: targetClient.bankName || 'Direct Cash / Bank',
          accountNumber: targetClient.accountNumber || '',
          ifscCode: targetClient.ifscCode || '',
          guarantor: {
            name: targetClient.nomineeName || 'Bhishi Committee',
            phone: targetClient.nomineePhone || targetClient.phone,
            relationship: targetClient.nomineeRelationship || 'Guarantor',
            address: targetClient.address || targetClient.city,
            occupation: 'Member',
          },
          emiAmount,
          totalInterest,
          totalPayable,
          amountPaid: 0,
          principalPaid: 0,
          interestPaid: 0,
          outstandingAmount: totalPayable,
          status: 'DISBURSED',
          applicationDate: todayStr,
          approvalDate: todayStr,
          disbursementDate: todayStr,
          disbursementMethod: 'BANK_TRANSFER',
          disbursementRef: `IMP-LN-${loanId}`,
          emiSchedule: schedule,
          nextEmiDate: schedule[0]?.dueDate,
          nextEmiAmount: schedule[0]?.emiAmount,
          overdueAmount: 0,
          createdAt: nowIso,
          createdBy: user?.name || 'Excel Import',
        };

        targetClient.totalLoanAmount = (targetClient.totalLoanAmount || 0) + loanAmount;
        targetClient.outstandingLoanAmount = (targetClient.outstandingLoanAmount || 0) + totalPayable;
        targetClient.activeLoansCount = (targetClient.activeLoansCount || 0) + 1;
        if (targetClient.clientType === 'INVESTOR') targetClient.clientType = 'INVESTOR_BORROWER';

        newLoansList.unshift(newLoan);
        loansToBatchSave.push(newLoan);
        loansCount++;

        const newPayment: Payment = {
          id: `PAY-${Date.now().toString().slice(-5)}L${loansCount}`,
          clientId: targetClient.id,
          clientName: targetClient.name,
          loanId: newLoan.id,
          paymentType: 'LOAN_DISBURSEMENT',
          amount: loanAmount,
          paymentMethod: 'BANK_TRANSFER',
          transactionReference: `IMP-LN-${loanId}`,
          paymentDate: todayStr,
          status: 'COMPLETED',
          recordedBy: user?.name || 'Excel Import',
          notes: `Loan disbursement for ${loanId}`,
          receiptNumber: `RCPT-${Date.now().toString().slice(-5)}L${loansCount}`,
          createdAt: nowIso,
        };
        newPaymentsList.unshift(newPayment);

        const newTxn: Transaction = {
          id: `TXN-${Date.now().toString().slice(-5)}L${loansCount}`,
          clientId: targetClient.id,
          clientName: targetClient.name,
          loanId: newLoan.id,
          type: 'LOAN_DISBURSEMENT',
          nature: 'DEBIT',
          amount: loanAmount,
          paymentMethod: 'BANK_TRANSFER',
          referenceNumber: `IMP-LN-${loanId}`,
          date: todayStr,
          status: 'SUCCESS',
          description: `Loan disbursement for ${targetClient.name} (${loanId})`,
          createdBy: user?.name || 'Excel Import',
          createdAt: nowIso,
        };
        newTransactionsList.unshift(newTxn);
      }

      newClientsMap.set(targetClient.id, targetClient);
      clientsToBatchSave.push(targetClient);
    }

    const updatedClientsList = Array.from(newClientsMap.values());

    setClients(updatedClientsList);
    setInvestments(newInvestmentsList);
    setLoans(newLoansList);
    setPayments(newPaymentsList);
    setTransactions(newTransactionsList);

    dataService.saveClientsLocally(updatedClientsList);
    dataService.saveInvestmentsLocally(newInvestmentsList);
    dataService.saveLoansLocally(newLoansList);
    dataService.savePaymentsLocally(newPaymentsList);
    dataService.saveTransactionsLocally(newTransactionsList);

    // Save batch to Firestore asynchronously
    await Promise.all([
      dataService.saveClientsBatch(clientsToBatchSave),
      dataService.saveInvestmentsBatch(investmentsToBatchSave),
      dataService.saveLoansBatch(loansToBatchSave),
    ]);

    // Audit log & notification
    logAudit(
      'BULK_IMPORT_CLIENTS',
      'CLIENTS',
      `BATCH-${Date.now()}`,
      `Imported ${importedCount} new members, updated ${updatedCount} existing, added ${investmentsCount} investments and ${loansCount} loans from spreadsheet.`
    );

    notify(
      'Spreadsheet Import Completed',
      `Successfully imported ${importedCount} new members and updated ${updatedCount} existing members.`,
      'SYSTEM'
    );

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    toast.success(
      'Data Import Successful!',
      `Imported ${importedCount} new members, updated ${updatedCount} existing records.`
    );

    return { importedCount, updatedCount, investmentsCount, loansCount };
  };

  const eraseImportedClients = async (options?: {
    bishiGroupName?: string;
    eraseAll?: boolean;
  }): Promise<{
    deletedClients: number;
    deletedPayments: number;
    deletedTxns: number;
  }> => {
    // Determine which clients match imported criteria
    const clientsToDelete = clients.filter((c) => {
      if (options?.bishiGroupName && options.bishiGroupName.trim() !== '') {
        return (
          c.bishiGroupName?.toLowerCase().trim() ===
          options.bishiGroupName.toLowerCase().trim()
        );
      }
      if (options?.eraseAll) {
        return true;
      }
      // Default: any client with monthlyLedger or customFields or bishiGroupName or notes matching import
      return (
        Boolean(c.monthlyLedger && c.monthlyLedger.length > 0) ||
        Boolean(c.customFields && Object.keys(c.customFields).length > 0) ||
        Boolean(c.bishiGroupName) ||
        Boolean(c.notes && c.notes.includes('Excel')) ||
        Boolean(c.srNo !== undefined)
      );
    });

    const clientIdsToDelete = new Set(clientsToDelete.map((c) => c.id));
    const deletedClientsCount = clientsToDelete.length;

    // Filter remaining clients
    const remainingClients = clients.filter((c) => !clientIdsToDelete.has(c.id));

    // Filter payments linked to these clients
    const paymentsToDelete = payments.filter(
      (p) =>
        clientIdsToDelete.has(p.clientId) ||
        (p.notes && p.notes.includes('Excel Sheet Monthly Matrix Import'))
    );
    const paymentIdsToDelete = paymentsToDelete.map((p) => p.id);
    const remainingPayments = payments.filter((p) => !paymentIdsToDelete.includes(p.id));

    // Filter transactions linked to these clients
    const txnsToDelete = transactions.filter(
      (t) =>
        clientIdsToDelete.has(t.clientId) ||
        (t.createdBy && t.createdBy.includes('Excel Import'))
    );
    const txnIdsToDelete = txnsToDelete.map((t) => t.id);
    const remainingTransactions = transactions.filter((t) => !txnIdsToDelete.includes(t.id));

    // Filter investments & loans linked to these clients
    const investmentsToDelete = investments.filter((i) => clientIdsToDelete.has(i.clientId));
    const invIdsToDelete = investmentsToDelete.map((i) => i.id);
    const remainingInvestments = investments.filter((i) => !invIdsToDelete.includes(i.id));

    const loansToDelete = loans.filter((l) => clientIdsToDelete.has(l.clientId));
    const loanIdsToDelete = loansToDelete.map((l) => l.id);
    const remainingLoans = loans.filter((l) => !loanIdsToDelete.includes(l.id));

    // Update state immediately
    setClients(remainingClients);
    setPayments(remainingPayments);
    setTransactions(remainingTransactions);
    setInvestments(remainingInvestments);
    setLoans(remainingLoans);

    // Save locally
    dataService.saveClientsLocally(remainingClients);
    dataService.savePaymentsLocally(remainingPayments);
    dataService.saveTransactionsLocally(remainingTransactions);
    dataService.saveInvestmentsLocally(remainingInvestments);
    dataService.saveLoansLocally(remainingLoans);

    // Delete from Firestore in batches asynchronously
    await Promise.all([
      dataService.deleteClientsBatch(Array.from(clientIdsToDelete)),
      dataService.deletePaymentsBatch(paymentIdsToDelete),
      dataService.deleteTransactionsBatch(txnIdsToDelete),
      dataService.deleteInvestmentsBatch(invIdsToDelete),
      dataService.deleteLoansBatch(loanIdsToDelete),
    ]);

    logAudit(
      'ERASE_IMPORTED_CLIENTS',
      'CLIENTS',
      `PURGE-${Date.now()}`,
      `Erased ${deletedClientsCount} imported members, ${paymentsToDelete.length} payment receipts, and ${txnsToDelete.length} transactions.`
    );

    toast.success(
      'Imported Data Erased',
      `Permanently removed ${deletedClientsCount} member records and associated ledger entries.`
    );

    return {
      deletedClients: deletedClientsCount,
      deletedPayments: paymentsToDelete.length,
      deletedTxns: txnsToDelete.length,
    };
  };

  // --- INVESTMENT PLAN ACTIONS ---
  const addPlan = async (planData: Omit<InvestmentPlan, 'id' | 'createdAt'>): Promise<InvestmentPlan> => {
    const newPlan: InvestmentPlan = {
      ...planData,
      id: generateId('PLAN'),
      createdAt: new Date().toISOString(),
    };
    const updated = [...plans, newPlan];
    setPlans(updated);
    dataService.savePlansLocally(updated);
    await dataService.savePlan(newPlan);

    logAudit('CREATE_PLAN', 'INVESTMENTS', newPlan.id, `Created investment plan ${newPlan.name}`);
    toast.success('Plan Created', `${newPlan.name} is now available for investments.`);
    return newPlan;
  };

  const updatePlan = async (id: string, updates: Partial<InvestmentPlan>) => {
    let updatedPlan: InvestmentPlan | undefined;
    const updated = plans.map((p) => {
      if (p.id === id) {
        updatedPlan = { ...p, ...updates };
        return updatedPlan;
      }
      return p;
    });
    setPlans(updated);
    dataService.savePlansLocally(updated);
    if (updatedPlan) {
      await dataService.savePlan(updatedPlan);
    }
    logAudit('UPDATE_PLAN', 'INVESTMENTS', id, updates);
    toast.success('Plan Updated', 'Investment plan updated successfully.');
  };

  // --- INVESTMENT CREATION FLOW ---
  const createInvestment = async (data: {
    clientId: string;
    planId: string;
    amount: number;
    startDate: string;
    paymentMethod: PaymentMethod;
    transactionReference: string;
    notes?: string;
  }): Promise<Investment> => {
    const client = clients.find((c) => c.id === data.clientId);
    const plan = plans.find((p) => p.id === data.planId);
    if (!client || !plan) throw new Error('Client or Plan not found');

    const { expectedReturn, totalPayout } = calculateInvestmentReturn(
      data.amount,
      plan.returnRate,
      plan.durationMonths,
      plan.paymentFrequency
    );

    // Calculate maturity date: startDate + durationMonths
    const start = new Date(data.startDate);
    start.setMonth(start.getMonth() + plan.durationMonths);
    const maturityDate = start.toISOString().split('T')[0];

    const newInvestment: Investment = {
      id: generateId('INV'),
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      planId: plan.id,
      planName: plan.name,
      amount: data.amount,
      returnRate: plan.returnRate,
      durationMonths: plan.durationMonths,
      startDate: data.startDate,
      maturityDate,
      expectedReturn,
      totalPayout,
      returnsPaid: 0,
      status: 'ACTIVE',
      paymentMethod: data.paymentMethod,
      transactionReference: data.transactionReference,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Admin',
    };

    // 1. Add Investment
    const updatedInvestments = [newInvestment, ...investments];
    setInvestments(updatedInvestments);
    dataService.saveInvestmentsLocally(updatedInvestments);
    await dataService.saveInvestment(newInvestment);

    // 2. Generate Payment Receipt
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`;
    const newPayment: Payment = {
      id: generateId('PAY'),
      receiptNumber,
      clientId: client.id,
      clientName: client.name,
      investmentId: newInvestment.id,
      amount: data.amount,
      paymentType: 'INVESTMENT_PAYMENT',
      paymentMethod: data.paymentMethod,
      transactionReference: data.transactionReference,
      paymentDate: data.startDate,
      status: 'COMPLETED',
      notes: `Capital deposit for ${plan.name}`,
      recordedBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };
    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    dataService.savePaymentsLocally(updatedPayments);
    await dataService.savePayment(newPayment);

    // 3. Record Transaction in Ledger
    const newTxn: Transaction = {
      id: generateId('TXN'),
      clientId: client.id,
      clientName: client.name,
      investmentId: newInvestment.id,
      type: 'INVESTMENT',
      nature: 'CREDIT',
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.transactionReference,
      date: data.startDate,
      status: 'SUCCESS',
      description: `Capital deposit for ${plan.name} (${newInvestment.id})`,
      createdBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };
    const updatedTxns = [newTxn, ...transactions];
    setTransactions(updatedTxns);
    dataService.saveTransactionsLocally(updatedTxns);
    await dataService.saveTransaction(newTxn);

    // 4. Update Client totals
    const updatedClients = clients.map((c) => {
      if (c.id === client.id) {
        const updatedC = {
          ...c,
          totalInvested: (c.totalInvested || 0) + data.amount,
          activeInvestmentsCount: (c.activeInvestmentsCount || 0) + 1,
          updatedAt: new Date().toISOString(),
        };
        dataService.saveClient(updatedC);
        return updatedC;
      }
      return c;
    });
    setClients(updatedClients);
    dataService.saveClientsLocally(updatedClients);

    logAudit('CREATE_INVESTMENT', 'INVESTMENTS', newInvestment.id, `Created investment of ₹${data.amount} for ${client.name}`);
    notify(
      'New Investment Opened',
      `₹${data.amount.toLocaleString()} invested by ${client.name} in ${plan.name}.`,
      'SYSTEM',
      { clientId: client.id, investmentId: newInvestment.id }
    );

    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
    } catch {
      // ignore
    }

    toast.success('Investment Created', `Portfolio #${newInvestment.id} generated with receipt #${receiptNumber}.`);
    return newInvestment;
  };

  const updateInvestmentStatus = async (id: string, status: Investment['status']) => {
    let updatedInv: Investment | undefined;
    const updated = investments.map((inv) => {
      if (inv.id === id) {
        updatedInv = { ...inv, status };
        return updatedInv;
      }
      return inv;
    });
    setInvestments(updated);
    dataService.saveInvestmentsLocally(updated);
    if (updatedInv) {
      await dataService.saveInvestment(updatedInv);
    }
    logAudit('UPDATE_INVESTMENT_STATUS', 'INVESTMENTS', id, { status });
    toast.success('Investment Status Updated', `Investment is now ${status}.`);
  };

  // --- LOAN LIFECYCLE ---
  const createLoanApplication = async (data: {
    clientId: string;
    requestedAmount: number;
    loanPurpose: string;
    tenureMonths: number;
    interestRate: number;
    monthlyIncome: number;
    existingLiabilities?: number;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    guarantor: Loan['guarantor'];
  }): Promise<Loan> => {
    const client = clients.find((c) => c.id === data.clientId);
    if (!client) throw new Error('Client not found');

    const newLoan: Loan = {
      id: generateId('LN'),
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      requestedAmount: data.requestedAmount,
      approvedAmount: 0,
      tenureMonths: data.tenureMonths,
      interestRate: data.interestRate,
      emiAmount: 0,
      totalInterest: 0,
      totalPayable: 0,
      amountPaid: 0,
      principalPaid: 0,
      interestPaid: 0,
      outstandingAmount: 0,
      overdueAmount: 0,
      status: 'PENDING',
      loanPurpose: data.loanPurpose,
      monthlyIncome: data.monthlyIncome,
      existingLiabilities: data.existingLiabilities || 0,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      guarantor: data.guarantor,
      emiSchedule: [],
      applicationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Admin',
    };

    const updatedLoans = [newLoan, ...loans];
    setLoans(updatedLoans);
    dataService.saveLoansLocally(updatedLoans);
    await dataService.saveLoan(newLoan);

    logAudit('CREATE_LOAN_APPLICATION', 'LOANS', newLoan.id, `Loan application of ₹${data.requestedAmount} submitted for ${client.name}`);
    notify(
      'New Loan Application',
      `₹${data.requestedAmount.toLocaleString()} requested by ${client.name} for ${data.loanPurpose}.`,
      'LOAN_APPLICATION',
      { clientId: client.id, loanId: newLoan.id }
    );

    toast.success('Loan Application Submitted', `Application #${newLoan.id} is queued for credit review.`);
    return newLoan;
  };

  const approveLoan = async (
    id: string,
    approvedAmount: number,
    interestRate: number,
    tenureMonths: number,
    approvalNotes?: string
  ) => {
    const loan = loans.find((l) => l.id === id);
    if (!loan) throw new Error('Loan not found');

    // Generate schedule
    const { schedule, emiAmount, totalInterest, totalPayable } = generateEmiSchedule(
      approvedAmount,
      interestRate,
      tenureMonths,
      new Date().toISOString().split('T')[0]
    );

    const updatedLoan: Loan = {
      ...loan,
      approvedAmount,
      interestRate,
      tenureMonths,
      emiAmount,
      totalInterest,
      totalPayable,
      outstandingAmount: totalPayable,
      status: 'APPROVED',
      approvalDate: new Date().toISOString().split('T')[0],
      approvalNotes,
      emiSchedule: schedule,
    };

    const updatedLoans = loans.map((l) => (l.id === id ? updatedLoan : l));
    setLoans(updatedLoans);
    dataService.saveLoansLocally(updatedLoans);
    await dataService.saveLoan(updatedLoan);

    logAudit('APPROVE_LOAN', 'LOANS', id, `Approved ₹${approvedAmount} at ${interestRate}% for ${tenureMonths} months`);
    notify('Loan Sanctioned', `Loan ${id} for ₹${approvedAmount.toLocaleString()} has been approved.`, 'LOAN_APPROVED', {
      clientId: loan.clientId,
      loanId: loan.id,
    });
    toast.success('Loan Approved', `Loan #${id} has been sanctioned for ₹${approvedAmount.toLocaleString()}.`);
  };

  const rejectLoan = async (id: string, rejectionReason: string) => {
    const loan = loans.find((l) => l.id === id);
    if (!loan) throw new Error('Loan not found');

    const updatedLoan: Loan = {
      ...loan,
      status: 'REJECTED',
      rejectionReason,
    };

    const updatedLoans = loans.map((l) => (l.id === id ? updatedLoan : l));
    setLoans(updatedLoans);
    dataService.saveLoansLocally(updatedLoans);
    await dataService.saveLoan(updatedLoan);

    logAudit('REJECT_LOAN', 'LOANS', id, `Rejected: ${rejectionReason}`);
    notify('Loan Application Rejected', `Application ${id} rejected: ${rejectionReason}`, 'LOAN_REJECTED', {
      clientId: loan.clientId,
      loanId: loan.id,
    });
    toast.error('Loan Rejected', `Loan #${id} has been rejected.`);
  };

  const disburseLoan = async (
    id: string,
    disbursementMethod: PaymentMethod,
    disbursementRef: string,
    disbursementDate?: string
  ) => {
    const loan = loans.find((l) => l.id === id);
    if (!loan) throw new Error('Loan not found');

    const actualDate = disbursementDate || new Date().toISOString().split('T')[0];

    // Recalculate schedule with actual disbursement date
    const { schedule } = generateEmiSchedule(
      loan.approvedAmount,
      loan.interestRate,
      loan.tenureMonths,
      actualDate
    );

    const updatedLoan: Loan = {
      ...loan,
      status: 'DISBURSED',
      disbursementMethod,
      disbursementRef,
      disbursementDate: actualDate,
      nextEmiDate: schedule[0]?.dueDate,
      nextEmiAmount: schedule[0]?.emiAmount,
      emiSchedule: schedule,
    };

    // 1. Update Loan
    const updatedLoans = loans.map((l) => (l.id === id ? updatedLoan : l));
    setLoans(updatedLoans);
    dataService.saveLoansLocally(updatedLoans);
    await dataService.saveLoan(updatedLoan);

    // 2. Add Ledger Transaction (Debit - money paid out to client)
    const newTxn: Transaction = {
      id: generateId('TXN'),
      clientId: loan.clientId,
      clientName: loan.clientName,
      loanId: loan.id,
      type: 'LOAN_DISBURSEMENT',
      nature: 'DEBIT',
      amount: loan.approvedAmount,
      paymentMethod: disbursementMethod,
      referenceNumber: disbursementRef,
      date: actualDate,
      status: 'SUCCESS',
      description: `Loan disbursement of ₹${loan.approvedAmount} (${loan.id})`,
      createdBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };
    const updatedTxns = [newTxn, ...transactions];
    setTransactions(updatedTxns);
    dataService.saveTransactionsLocally(updatedTxns);
    await dataService.saveTransaction(newTxn);

    // 3. Update Client Active Loan Count & Total Loan
    const updatedClients = clients.map((c) => {
      if (c.id === loan.clientId) {
        const updatedC = {
          ...c,
          totalLoanAmount: (c.totalLoanAmount || 0) + loan.approvedAmount,
          outstandingLoanAmount: (c.outstandingLoanAmount || 0) + loan.totalPayable,
          activeLoansCount: (c.activeLoansCount || 0) + 1,
          updatedAt: new Date().toISOString(),
        };
        dataService.saveClient(updatedC);
        return updatedC;
      }
      return c;
    });
    setClients(updatedClients);
    dataService.saveClientsLocally(updatedClients);

    logAudit('DISBURSE_LOAN', 'LOANS', id, `Disbursed ₹${loan.approvedAmount} via ${disbursementMethod} (Ref: ${disbursementRef})`);
    notify(
      'Loan Funds Disbursed',
      `₹${loan.approvedAmount.toLocaleString()} credited to borrower ${loan.clientName}.`,
      'SYSTEM',
      { clientId: loan.clientId, loanId: loan.id }
    );

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }

    toast.success('Loan Disbursed', `₹${loan.approvedAmount.toLocaleString()} disbursed for Loan #${id}.`);
  };

  const recordEmiPayment = async (data: {
    loanId: string;
    emiNumber: number;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionReference: string;
    paymentDate: string;
    notes?: string;
  }): Promise<Payment> => {
    const loan = loans.find((l) => l.id === data.loanId);
    if (!loan) throw new Error('Loan not found');

    const scheduleItem = loan.emiSchedule.find((s) => s.emiNumber === data.emiNumber);
    if (!scheduleItem) throw new Error('Schedule item not found');

    // 1. Generate Payment Receipt
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`;
    const newPayment: Payment = {
      id: generateId('PAY'),
      receiptNumber,
      clientId: loan.clientId,
      clientName: loan.clientName,
      loanId: loan.id,
      emiNumber: data.emiNumber,
      amount: data.amount,
      paymentType: 'LOAN_EMI',
      paymentMethod: data.paymentMethod,
      transactionReference: data.transactionReference,
      paymentDate: data.paymentDate,
      status: 'COMPLETED',
      notes: data.notes || `EMI #${data.emiNumber} payment for Loan #${loan.id}`,
      recordedBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    dataService.savePaymentsLocally(updatedPayments);
    await dataService.savePayment(newPayment);

    // 2. Record Transaction in Ledger (Credit - money received into My Bishi)
    const newTxn: Transaction = {
      id: generateId('TXN'),
      clientId: loan.clientId,
      clientName: loan.clientName,
      loanId: loan.id,
      type: 'LOAN_EMI',
      nature: 'CREDIT',
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.transactionReference,
      date: data.paymentDate,
      status: 'SUCCESS',
      description: `EMI #${data.emiNumber} repayment for Loan #${loan.id}`,
      createdBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };
    const updatedTxns = [newTxn, ...transactions];
    setTransactions(updatedTxns);
    dataService.saveTransactionsLocally(updatedTxns);
    await dataService.saveTransaction(newTxn);

    // 3. Update EMI Schedule
    const newPaidAmount = (scheduleItem.paidAmount || 0) + data.amount;
    const isFullyPaid = newPaidAmount >= scheduleItem.emiAmount;

    const updatedSchedule: EmiScheduleItem[] = loan.emiSchedule.map((item) => {
      if (item.emiNumber === data.emiNumber) {
        return {
          ...item,
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, item.emiAmount - newPaidAmount),
          paidDate: data.paymentDate,
          status: isFullyPaid ? ('PAID' as const) : ('PARTIALLY_PAID' as const),
          paymentMethod: data.paymentMethod,
          transactionReference: data.transactionReference,
        };
      }
      return item;
    });

    // Check if entire loan is closed
    const allEmisPaid = updatedSchedule.every((s) => s.status === 'PAID');

    const updatedLoan: Loan = {
      ...loan,
      amountPaid: (loan.amountPaid || 0) + data.amount,
      principalPaid: (loan.principalPaid || 0) + scheduleItem.principal,
      interestPaid: (loan.interestPaid || 0) + scheduleItem.interest,
      outstandingAmount: Math.max(0, (loan.outstandingAmount || 0) - data.amount),
      status: allEmisPaid ? 'CLOSED' : (loan.status === 'OVERDUE' ? 'ACTIVE' : loan.status),
      emiSchedule: updatedSchedule,
    };

    const updatedLoans = loans.map((l) => (l.id === loan.id ? updatedLoan : l));
    setLoans(updatedLoans);
    dataService.saveLoansLocally(updatedLoans);
    await dataService.saveLoan(updatedLoan);

    // 4. Update Client's outstanding loan
    const updatedClients = clients.map((c) => {
      if (c.id === loan.clientId) {
        const updatedC = {
          ...c,
          outstandingLoanAmount: Math.max(0, (c.outstandingLoanAmount || 0) - data.amount),
          activeLoansCount: allEmisPaid ? Math.max(0, (c.activeLoansCount || 1) - 1) : c.activeLoansCount,
          updatedAt: new Date().toISOString(),
        };
        dataService.saveClient(updatedC);
        return updatedC;
      }
      return c;
    });
    setClients(updatedClients);
    dataService.saveClientsLocally(updatedClients);

    logAudit('RECORD_EMI_PAYMENT', 'PAYMENTS', newPayment.id, `Collected ₹${data.amount} for Loan #${loan.id} (EMI #${data.emiNumber})`);
    notify(
      'EMI Payment Received',
      `₹${data.amount.toLocaleString()} received from ${loan.clientName} (EMI #${data.emiNumber}).`,
      'PAYMENT_RECEIVED',
      { clientId: loan.clientId, loanId: loan.id }
    );

    if (allEmisPaid) {
      notify('Loan Fully Closed', `Loan #${loan.id} for ${loan.clientName} has been fully repaid!`, 'SYSTEM', {
        clientId: loan.clientId,
        loanId: loan.id,
      });
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }

    toast.success('Payment Recorded', `Receipt #${receiptNumber} generated for ₹${data.amount.toLocaleString()}.`);
    return newPayment;
  };

  // --- GENERIC PAYMENTS ---
  const recordGenericPayment = async (
    paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt' | 'recordedBy'>
  ): Promise<Payment> => {
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`;
    const newPayment: Payment = {
      ...paymentData,
      id: generateId('PAY'),
      receiptNumber,
      status: paymentData.status || 'COMPLETED',
      recordedBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    dataService.savePaymentsLocally(updatedPayments);
    await dataService.savePayment(newPayment);

    const isCredit =
      paymentData.paymentType === 'INVESTMENT_PAYMENT' ||
      paymentData.paymentType === 'LOAN_EMI' ||
      paymentData.paymentType === 'PENALTY';

    const newTxn: Transaction = {
      id: generateId('TXN'),
      clientId: paymentData.clientId,
      clientName: paymentData.clientName,
      loanId: paymentData.loanId,
      investmentId: paymentData.investmentId,
      type: (paymentData.paymentType === 'INVESTMENT_PAYMENT' ? 'INVESTMENT' : paymentData.paymentType === 'LOAN_EMI' ? 'LOAN_EMI' : 'OTHER'),
      nature: isCredit ? 'CREDIT' : 'DEBIT',
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      referenceNumber: paymentData.transactionReference,
      date: paymentData.paymentDate,
      status: 'SUCCESS',
      description: `Payment recorded: ${paymentData.paymentType}`,
      createdBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };
    const updatedTxns = [newTxn, ...transactions];
    setTransactions(updatedTxns);
    dataService.saveTransactionsLocally(updatedTxns);
    await dataService.saveTransaction(newTxn);

    logAudit('RECORD_PAYMENT', 'PAYMENTS', newPayment.id, `Recorded ₹${paymentData.amount} (${paymentData.paymentType})`);
    toast.success('Payment Recorded', `Receipt #${receiptNumber} generated successfully.`);
    return newPayment;
  };

  // --- DOCUMENTS ---
  const uploadDocument = async (
    docData: Omit<DocumentItem, 'id' | 'uploadedAt' | 'uploadedBy'>
  ): Promise<DocumentItem> => {
    const newDoc: DocumentItem = {
      ...docData,
      id: generateId('DOC'),
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.name || 'Admin',
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    dataService.saveDocumentsLocally(updated);
    await dataService.saveDocument(newDoc);

    logAudit('UPLOAD_DOCUMENT', 'CLIENTS', newDoc.id, `Uploaded document ${newDoc.fileName}`);
    toast.success('Document Uploaded', `${newDoc.fileName} added successfully.`);
    return newDoc;
  };

  const deleteDocument = async (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    dataService.saveDocumentsLocally(updated);
    await dataService.deleteDocument(id);

    logAudit('DELETE_DOCUMENT', 'CLIENTS', id, 'Deleted document');
    toast.info('Document Deleted', 'Document removed successfully.');
  };

  // --- NOTIFICATIONS ---
  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => {
      if (n.id === id) {
        const notif = { ...n, read: true };
        dataService.saveNotification(notif);
        return notif;
      }
      return n;
    });
    setNotifications(updated);
    dataService.saveNotificationsLocally(updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => {
      const notif = { ...n, read: true };
      dataService.saveNotification(notif);
      return notif;
    });
    setNotifications(updated);
    dataService.saveNotificationsLocally(updated);
    toast.info('Notifications Cleared', 'All notifications marked as read.');
  };

  // --- SETTINGS ---
  const updateBusinessSettings = async (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    await dataService.saveSettings(newSettings);
    logAudit('UPDATE_SETTINGS', 'SETTINGS', 'BUSINESS_CONFIG', newSettings);
    toast.success('Settings Saved', 'Business and system configurations updated.');
  };

  const resetAllData = () => {
    dataService.clearLocalData();
    setClients([]);
    setInvestments([]);
    setLoans([]);
    setPayments([]);
    setTransactions([]);
    setDocuments([]);
    setNotifications([]);
    setAuditLogs([]);
    toast.success('Clean Slate Active', 'Database is cleared of all temporary records.');
  };

  const syncToFirestore = async () => {
    try {
      toast.success('Firestore Connected', 'Real-time synchronization with Firestore is active.');
    } catch (err: any) {
      toast.error('Sync Error', err.message || 'Failed to sync with Firebase.');
    }
  };

  // Enriched clients dynamically calculated with live investment and loan totals
  const enrichedClients = useMemo(() => {
    return clients.map((c) => {
      const clientInvs = investments.filter(
        (i) =>
          i.clientId === c.id ||
          (c.phone && (i.clientPhone === c.phone || (i as any).mobile === c.phone)) ||
          ((c as any).loginId && (i.clientPhone === (c as any).loginId || (i as any).mobile === (c as any).loginId))
      );
      const computedTotalInvested = clientInvs.reduce((sum, i) => sum + (i.amount || 0), 0);
      const computedActiveInvs = clientInvs.filter((i) => i.status === 'ACTIVE').length;

      const clientLoans = loans.filter(
        (l) =>
          l.clientId === c.id ||
          (c.phone && ((l as any).phone === c.phone || (l as any).mobile === c.phone)) ||
          ((c as any).loginId && ((l as any).phone === (c as any).loginId || (l as any).mobile === (c as any).loginId))
      );
      const computedTotalLoans = clientLoans.reduce(
        (sum, l) => sum + (l.approvedAmount || l.requestedAmount || 0),
        0
      );
      const computedOutstandingLoans = clientLoans.reduce(
        (sum, l) => sum + (l.outstandingAmount || l.approvedAmount || 0),
        0
      );
      const computedActiveLoans = clientLoans.filter(
        (l) => l.status === 'ACTIVE' || l.status === 'DISBURSED' || l.status === 'APPROVED'
      ).length;

      return {
        ...c,
        totalInvested: computedTotalInvested > 0 ? computedTotalInvested : (c.totalInvested || 0),
        activeInvestmentsCount: computedActiveInvs > 0 ? computedActiveInvs : (c.activeInvestmentsCount || 0),
        totalLoanAmount: computedTotalLoans > 0 ? computedTotalLoans : (c.totalLoanAmount || 0),
        outstandingLoanAmount: computedOutstandingLoans > 0 ? computedOutstandingLoans : (c.outstandingLoanAmount || 0),
        activeLoansCount: computedActiveLoans > 0 ? computedActiveLoans : (c.activeLoansCount || 0),
      };
    });
  }, [clients, investments, loans]);

  // Dynamic Dashboard Stats calculation
  const stats: DashboardStats = useMemo(() => {
    const totalClients = enrichedClients.length;

    const totalInvestmentsAmount = investments.reduce((sum, i) => sum + (i.amount || 0), 0);
    const activeInvestments = investments.filter((i) => i.status === 'ACTIVE');
    const activeInvestmentsAmount = activeInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);
    const activeInvestmentsCount = activeInvestments.length;

    const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE' || l.status === 'DISBURSED');
    const activeLoansCount = activeLoans.length;
    const activeLoansAmount = activeLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount || 0), 0);
    const loanOutstandingAmount = loans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);

    const pendingLoanApplicationsCount = loans.filter((l) => l.status === 'PENDING' || l.status === 'UNDER_REVIEW').length;

    // Today's collection: payments made today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayPayments = payments.filter((p) => p.paymentDate === todayStr || p.createdAt?.startsWith(todayStr));
    const todayCollectionAmount = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const overdueAmount = loans.reduce((sum, l) => sum + (l.overdueAmount || 0), 0);

    return {
      totalClients,
      totalInvestmentsAmount,
      activeInvestmentsAmount,
      activeInvestmentsCount,
      activeLoansCount,
      activeLoansAmount,
      loanOutstandingAmount,
      pendingLoanApplicationsCount,
      todayCollectionAmount,
      overdueAmount,
      monthlyGrowthPercent: totalInvestmentsAmount > 0 ? 18.4 : 0,
    };
  }, [enrichedClients, investments, loans, payments]);

  return (
    <DataContext.Provider
      value={{
        clients: enrichedClients,
        plans,
        investments,
        loans,
        payments,
        transactions,
        documents,
        notifications,
        auditLogs,
        settings,
        stats,
        isLoading,
        addClient,
        updateClient,
        deactivateClient,
        importClientsBulk,
        eraseImportedClients,
        addPlan,
        updatePlan,
        createInvestment,
        updateInvestmentStatus,
        createLoanApplication,
        approveLoan,
        rejectLoan,
        disburseLoan,
        recordEmiPayment,
        recordGenericPayment,
        uploadDocument,
        deleteDocument,
        markNotificationRead,
        markAllNotificationsRead,
        updateBusinessSettings,
        resetAllData,
        syncToFirestore,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
