import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
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
import {
  initialAuditLogs,
  initialBusinessSettings,
  initialClients,
  initialDocuments,
  initialInvestmentPlans,
  initialInvestments,
  initialLoans,
  initialNotifications,
  initialPayments,
  initialTransactions,
  initialUsers,
} from './seedData';

const STORAGE_KEYS = {
  USERS: 'mybishi_users',
  CLIENTS: 'mybishi_clients',
  PLANS: 'mybishi_investment_plans',
  INVESTMENTS: 'mybishi_investments',
  LOANS: 'mybishi_loans',
  PAYMENTS: 'mybishi_payments',
  TRANSACTIONS: 'mybishi_transactions',
  DOCUMENTS: 'mybishi_documents',
  NOTIFICATIONS: 'mybishi_notifications',
  AUDIT_LOGS: 'mybishi_audit_logs',
  SETTINGS: 'mybishi_business_settings',
};

// Helper for local storage
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// Helper to parse Firestore Timestamp / Date / string / number into ISO YYYY-MM-DD string
function normalizeDate(raw: any, fallback = new Date().toISOString().split('T')[0]): string {
  if (!raw) return fallback;
  if (typeof raw === 'string') {
    if (raw.includes('T')) return raw.split('T')[0];
    if (raw.includes(' ')) return raw.split(' ')[0];
    return raw;
  }
  if (typeof raw === 'number') {
    const ms = raw > 100000000000 ? raw : raw * 1000;
    return new Date(ms).toISOString().split('T')[0];
  }
  if (typeof raw === 'object') {
    if (typeof raw.toDate === 'function') {
      return raw.toDate().toISOString().split('T')[0];
    }
    if (typeof raw.seconds === 'number') {
      return new Date(raw.seconds * 1000).toISOString().split('T')[0];
    }
    if (raw instanceof Date) {
      return raw.toISOString().split('T')[0];
    }
  }
  return fallback;
}

// Helper to extract a number safely from various fields (handles string amounts with commas, etc.)
function extractNumber(val: any, fallback = 0): number {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ''));
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

// Helper to normalize an investment document from Firestore / Android app
export function normalizeInvestment(
  docData: any,
  docId?: string,
  plans: InvestmentPlan[] = [],
  clients: Client[] = []
): Investment {
  if (!docData) {
    return {
      id: docId || `INV-${Date.now().toString().slice(-6)}`,
      clientId: '',
      clientName: 'Unknown Client',
      clientPhone: '',
      planId: '',
      planName: 'Bishi Investment',
      amount: 0,
      returnRate: 12,
      durationMonths: 12,
      startDate: new Date().toISOString().split('T')[0],
      maturityDate: new Date().toISOString().split('T')[0],
      expectedReturn: 0,
      totalPayout: 0,
      returnsPaid: 0,
      status: 'ACTIVE',
      paymentMethod: 'UPI',
      transactionReference: '',
      notes: '',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'App',
    };
  }

  const id = docData.id || docId || `INV-${Date.now().toString().slice(-6)}`;

  // Extract amount from any common naming convention in mobile apps, including totalInvested
  const rawAmount =
    docData.totalInvested ??
    docData.total_invested ??
    docData.amount ??
    docData.investedAmount ??
    docData.invested_amount ??
    docData.investmentAmount ??
    docData.investment_amount ??
    docData.investAmount ??
    docData.invest_amount ??
    docData.principal ??
    docData.depositAmount ??
    docData.deposit_amount ??
    docData.totalAmount ??
    docData.total_amount ??
    docData.planAmount ??
    docData.plan_amount ??
    docData.paidAmount ??
    docData.paid_amount ??
    docData.investment ??
    0;
  const amount = extractNumber(rawAmount, 0);

  const clientId =
    docData.clientId ||
    docData.client_id ||
    docData.userId ||
    docData.user_id ||
    docData.memberId ||
    docData.member_id ||
    docData.customerId ||
    docData.customer_id ||
    '';
  const mobile = docData.mobile || docData.phone || '';
  const matchingClient = clients.find(
    (c) =>
      (clientId && c.id === clientId) ||
      (mobile && (c.phone === mobile || (c as any).mobile === mobile || (c as any).loginId === mobile))
  );

  const resolvedClientId = matchingClient ? matchingClient.id : (clientId || (mobile ? `MB-${mobile.slice(-7)}` : 'MB-CLIENT'));
  const clientName =
    docData.clientName ||
    docData.client_name ||
    docData.userName ||
    docData.user_name ||
    docData.memberName ||
    docData.member_name ||
    docData.customerName ||
    matchingClient?.name ||
    'Palash Borgave';

  const clientPhone =
    docData.clientPhone ||
    docData.client_phone ||
    docData.phone ||
    docData.mobile ||
    docData.contactNumber ||
    matchingClient?.phone ||
    (mobile ? mobile : '');

  const rawTenure =
    docData.durationMonths ??
    docData.duration_months ??
    docData.tenureMonths ??
    docData.tenure_months ??
    docData.tenure ??
    docData.duration ??
    docData.months ??
    12;
  const durationMonths = extractNumber(rawTenure, 12);

  const planId = docData.planId || docData.plan_id || docData.planCode || docData.schemeId || '';
  const matchingPlan = plans.find(
    (p) => p.id === planId || (p as any).code === planId || p.durationMonths === durationMonths
  );

  const planName =
    docData.planName ||
    docData.plan_name ||
    docData.planTitle ||
    docData.schemeName ||
    docData.scheme ||
    matchingPlan?.name ||
    (durationMonths === 12 ? 'Bishi Gold Pool (12 Months)' : durationMonths === 24 ? 'Bishi Elite Growth (24 Months)' : 'Bishi Investment Pool');

  const rawExpectedReturn =
    docData.expectedReturn ??
    docData.expected_return ??
    docData.expectedReturns ??
    docData.profit ??
    docData.expectedProfit ??
    docData.estimatedReturns;

  let returnRate = 12.0;
  const rawRate =
    docData.returnRate ??
    docData.return_rate ??
    docData.rate ??
    docData.roi ??
    docData.interestRate ??
    docData.interest_rate ??
    docData.annualReturn;

  if (rawRate !== undefined && rawRate !== null) {
    returnRate = extractNumber(rawRate, 12.0);
  } else if (rawExpectedReturn !== undefined && rawExpectedReturn !== null && amount > 0 && durationMonths > 0) {
    const exp = extractNumber(rawExpectedReturn, 0);
    returnRate = Math.round(((exp * 1200) / (amount * durationMonths)) * 10) / 10;
  } else if (matchingPlan?.returnRate) {
    returnRate = matchingPlan.returnRate;
  }

  const startDate = normalizeDate(
    docData.startDate ||
      docData.start_date ||
      docData.investmentDate ||
      docData.date ||
      docData.createdAt ||
      docData.created_at ||
      docData.timestamp
  );

  let maturityDate = normalizeDate(
    docData.maturityDate ||
      docData.maturity_date ||
      docData.endDate ||
      docData.end_date ||
      docData.dueDate ||
      docData.due_date,
    ''
  );
  if (!maturityDate) {
    const s = new Date(startDate);
    s.setMonth(s.getMonth() + (durationMonths || 12));
    maturityDate = s.toISOString().split('T')[0];
  }

  // Calculate returns if missing
  const expectedReturn =
    rawExpectedReturn !== undefined && rawExpectedReturn !== null
      ? extractNumber(rawExpectedReturn, 0)
      : Math.round((amount * returnRate * durationMonths) / 1200);

  const rawTotalPayout =
    docData.totalPayout ??
    docData.total_payout ??
    docData.maturityAmount ??
    docData.maturity_amount ??
    docData.payoutAmount;

  const totalPayout =
    rawTotalPayout !== undefined && rawTotalPayout !== null
      ? extractNumber(rawTotalPayout, amount + expectedReturn)
      : amount + expectedReturn;

  const rawReturnsPaid =
    docData.returnsPaid ?? docData.returns_paid ?? docData.paidReturns ?? docData.dividendPaid ?? 0;
  const returnsPaid = extractNumber(rawReturnsPaid, 0);

  let status: Investment['status'] = 'ACTIVE';
  const rawStatus = (docData.status || docData.status_name || 'ACTIVE').toString().toUpperCase();
  if (['ACTIVE', 'MATURED', 'CLOSED', 'CANCELLED', 'PENDING'].includes(rawStatus)) {
    status = rawStatus as Investment['status'];
  } else if (rawStatus === 'APPROVED' || rawStatus === 'RUNNING') {
    status = 'ACTIVE';
  } else if (rawStatus === 'COMPLETED') {
    status = 'MATURED';
  }

  return {
    id,
    clientId: resolvedClientId,
    clientName,
    clientPhone,
    planId: planId || matchingPlan?.id || 'PLAN-GOLD-12M',
    planName,
    amount,
    returnRate,
    durationMonths,
    startDate,
    maturityDate,
    expectedReturn,
    totalPayout,
    returnsPaid,
    status,
    paymentMethod:
      docData.paymentMethod || docData.payment_method || docData.paymentMode || docData.mode || 'UPI',
    transactionReference:
      docData.transactionReference ||
      docData.transaction_reference ||
      docData.reference ||
      docData.ref ||
      docData.utr ||
      docData.txnId ||
      docData.transactionId ||
      '',
    notes: docData.notes || docData.remarks || docData.comment || docData.description || '',
    createdAt: normalizeDate(docData.createdAt || docData.created_at, startDate),
    createdBy: docData.createdBy || docData.created_by || 'App',
  };
}

export const dataService = {
  // Clear all local cache
  clearLocalData() {
    setLocalItem(STORAGE_KEYS.CLIENTS, []);
    setLocalItem(STORAGE_KEYS.INVESTMENTS, []);
    setLocalItem(STORAGE_KEYS.LOANS, []);
    setLocalItem(STORAGE_KEYS.PAYMENTS, []);
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, []);
    setLocalItem(STORAGE_KEYS.DOCUMENTS, []);
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, []);
    setLocalItem(STORAGE_KEYS.AUDIT_LOGS, []);
    setLocalItem(STORAGE_KEYS.PLANS, initialInvestmentPlans);
    setLocalItem(STORAGE_KEYS.SETTINGS, initialBusinessSettings);
  },

  // Load all data from Firestore (with local fallback)
  async loadAllData() {
    if (isFirebaseConfigured && db) {
      try {
        const [
          clientsSnap,
          plansSnap,
          investmentsSnap,
          loansSnap,
          paymentsSnap,
          transactionsSnap,
          documentsSnap,
          notificationsSnap,
          auditLogsSnap,
          settingsSnap,
        ] = await Promise.all([
          getDocs(collection(db, 'clients')),
          getDocs(collection(db, 'investmentPlans')),
          getDocs(collection(db, 'investments')),
          getDocs(collection(db, 'loans')),
          getDocs(collection(db, 'payments')),
          getDocs(collection(db, 'transactions')),
          getDocs(collection(db, 'documents')),
          getDocs(collection(db, 'notifications')),
          getDocs(collection(db, 'auditLogs')),
          getDocs(collection(db, 'settings')),
        ]);

        const clients = clientsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Client));
        let plans = plansSnap.docs.map((d) => ({ id: d.id, ...d.data() } as InvestmentPlan));

        // If plans in Firestore are empty, initialize default investment plans and settings
        if (plans.length === 0) {
          plans = initialInvestmentPlans;
          try {
            const batch = writeBatch(db);
            initialInvestmentPlans.forEach((p) => batch.set(doc(db!, 'investmentPlans', p.id), p));
            batch.set(doc(db!, 'settings', 'business_config'), initialBusinessSettings);
            await batch.commit();
          } catch (e) {
            console.warn('Could not seed default plans to Firestore:', e);
          }
        }

        const investments = investmentsSnap.docs.map((d) => normalizeInvestment(d.data(), d.id, plans, clients));
        const loans = loansSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Loan));
        const payments = paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
        const transactions = transactionsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
        const documents = documentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as DocumentItem));
        const notifications = notificationsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
        const auditLogs = auditLogsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
        let settings = (settingsSnap.docs.find((d) => d.id === 'business_config')?.data() as BusinessSettings) || initialBusinessSettings;

        // Cache in localStorage for offline availability
        setLocalItem(STORAGE_KEYS.CLIENTS, clients);
        setLocalItem(STORAGE_KEYS.PLANS, plans);
        setLocalItem(STORAGE_KEYS.INVESTMENTS, investments);
        setLocalItem(STORAGE_KEYS.LOANS, loans);
        setLocalItem(STORAGE_KEYS.PAYMENTS, payments);
        setLocalItem(STORAGE_KEYS.TRANSACTIONS, transactions);
        setLocalItem(STORAGE_KEYS.DOCUMENTS, documents);
        setLocalItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
        setLocalItem(STORAGE_KEYS.AUDIT_LOGS, auditLogs);
        setLocalItem(STORAGE_KEYS.SETTINGS, settings);

        return {
          users: initialUsers,
          clients,
          plans,
          investments,
          loans,
          payments,
          transactions,
          documents,
          notifications,
          auditLogs,
          settings,
        };
      } catch (err) {
        console.warn('Could not read from Firestore, using local fallback:', err);
      }
    }

    // LocalStorage fallback
    const cachedPlans = getLocalItem<InvestmentPlan[]>(STORAGE_KEYS.PLANS, initialInvestmentPlans);
    const cachedClients = getLocalItem<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
    const rawInvestments = getLocalItem<Investment[]>(STORAGE_KEYS.INVESTMENTS, initialInvestments);
    const normalizedCachedInvestments = rawInvestments.map((i) => normalizeInvestment(i, i.id, cachedPlans, cachedClients));

    return {
      users: initialUsers,
      clients: cachedClients,
      plans: cachedPlans,
      investments: normalizedCachedInvestments,
      loans: getLocalItem<Loan[]>(STORAGE_KEYS.LOANS, initialLoans),
      payments: getLocalItem<Payment[]>(STORAGE_KEYS.PAYMENTS, initialPayments),
      transactions: getLocalItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions),
      documents: getLocalItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, initialDocuments),
      notifications: getLocalItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications),
      auditLogs: getLocalItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs),
      settings: getLocalItem<BusinessSettings>(STORAGE_KEYS.SETTINGS, initialBusinessSettings),
    };
  },

  // Granular Firestore write methods
  async saveClient(client: Client) {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'clients', client.id), client);
      } catch (err) {
        console.error('Firestore saveClient error:', err);
      }
    }
  },

  async saveClientsBatch(clientsToSave: Client[]) {
    if (isFirebaseConfigured && db && clientsToSave.length > 0) {
      try {
        const chunkSize = 400;
        for (let i = 0; i < clientsToSave.length; i += chunkSize) {
          const batch = writeBatch(db);
          const chunk = clientsToSave.slice(i, i + chunkSize);
          chunk.forEach((c) => batch.set(doc(db!, 'clients', c.id), c));
          await batch.commit();
        }
      } catch (err) {
        console.error('Firestore saveClientsBatch error:', err);
      }
    }
  },

  async saveInvestmentsBatch(investmentsToSave: Investment[]) {
    if (isFirebaseConfigured && db && investmentsToSave.length > 0) {
      try {
        const chunkSize = 400;
        for (let i = 0; i < investmentsToSave.length; i += chunkSize) {
          const batch = writeBatch(db);
          const chunk = investmentsToSave.slice(i, i + chunkSize);
          chunk.forEach((inv) => batch.set(doc(db!, 'investments', inv.id), inv));
          await batch.commit();
        }
      } catch (err) {
        console.error('Firestore saveInvestmentsBatch error:', err);
      }
    }
  },

  async saveLoansBatch(loansToSave: Loan[]) {
    if (isFirebaseConfigured && db && loansToSave.length > 0) {
      try {
        const chunkSize = 400;
        for (let i = 0; i < loansToSave.length; i += chunkSize) {
          const batch = writeBatch(db);
          const chunk = loansToSave.slice(i, i + chunkSize);
          chunk.forEach((l) => batch.set(doc(db!, 'loans', l.id), l));
          await batch.commit();
        }
      } catch (err) {
        console.error('Firestore saveLoansBatch error:', err);
      }
    }
  },

  async deleteClient(clientId: string) {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'clients', clientId));
      } catch (err) {
        console.error('Firestore deleteClient error:', err);
      }
    }
  },

  async deleteClientsBatch(clientIds: string[]) {
    if (isFirebaseConfigured && db && clientIds.length > 0) {
      try {
        const chunkSize = 400;
        for (let i = 0; i < clientIds.length; i += chunkSize) {
          const batch = writeBatch(db);
          const chunk = clientIds.slice(i, i + chunkSize);
          chunk.forEach((id) => batch.delete(doc(db!, 'clients', id)));
          await batch.commit();
        }
      } catch (err) {
        console.error('Firestore deleteClientsBatch error:', err);
      }
    }
  },

  async deletePaymentsBatch(paymentIds: string[]) {
    if (isFirebaseConfigured && db && paymentIds.length > 0) {
      try {
        const chunkSize = 400;
        for (let i = 0; i < paymentIds.length; i += chunkSize) {
          const batch = writeBatch(db);
          const chunk = paymentIds.slice(i, i + chunkSize);
          chunk.forEach((id) => batch.delete(doc(db!, 'payments', id)));
          await batch.commit();
        }
      } catch (err) {
        console.error('Firestore deletePaymentsBatch error:', err);
      }
    }
  },

  async deleteTransactionsBatch(txnIds: string[]) {
    if (isFirebaseConfigured && db && txnIds.length > 0) {
      try {
        const chunkSize = 400;
        for (let i = 0; i < txnIds.length; i += chunkSize) {
          const batch = writeBatch(db);
          const chunk = txnIds.slice(i, i + chunkSize);
          chunk.forEach((id) => batch.delete(doc(db!, 'transactions', id)));
          await batch.commit();
        }
      } catch (err) {
        console.error('Firestore deleteTransactionsBatch error:', err);
      }
    }
  },

  async deleteInvestmentsBatch(investmentIds: string[]) {
    if (isFirebaseConfigured && db && investmentIds.length > 0) {
      try {
        const chunkSize = 400;
        for (let i = 0; i < investmentIds.length; i += chunkSize) {
          const batch = writeBatch(db);
          const chunk = investmentIds.slice(i, i + chunkSize);
          chunk.forEach((id) => batch.delete(doc(db!, 'investments', id)));
          await batch.commit();
        }
      } catch (err) {
        console.error('Firestore deleteInvestmentsBatch error:', err);
      }
    }
  },

  async deleteLoansBatch(loanIds: string[]) {
    if (isFirebaseConfigured && db && loanIds.length > 0) {
      try {
        const chunkSize = 400;
        for (let i = 0; i < loanIds.length; i += chunkSize) {
          const batch = writeBatch(db);
          const chunk = loanIds.slice(i, i + chunkSize);
          chunk.forEach((id) => batch.delete(doc(db!, 'loans', id)));
          await batch.commit();
        }
      } catch (err) {
        console.error('Firestore deleteLoansBatch error:', err);
      }
    }
  },

  async savePlan(plan: InvestmentPlan) {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'investmentPlans', plan.id), plan);
      } catch (err) {
        console.error('Firestore savePlan error:', err);
      }
    }
  },

  async saveInvestment(investment: Investment) {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'investments', investment.id), investment);
      } catch (err) {
        console.error('Firestore saveInvestment error:', err);
      }
    }
  },

  async saveLoan(loan: Loan) {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'loans', loan.id), loan);
      } catch (err) {
        console.error('Firestore saveLoan error:', err);
      }
    }
  },

  async savePayment(payment: Payment) {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'payments', payment.id), payment);
      } catch (err) {
        console.error('Firestore savePayment error:', err);
      }
    }
  },

  async saveTransaction(transaction: Transaction) {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'transactions', transaction.id), transaction);
      } catch (err) {
        console.error('Firestore saveTransaction error:', err);
      }
    }
  },

  async saveDocument(documentItem: DocumentItem) {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'documents', documentItem.id), documentItem);
      } catch (err) {
        console.error('Firestore saveDocument error:', err);
      }
    }
  },

  async deleteDocument(documentId: string) {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'documents', documentId));
      } catch (err) {
        console.error('Firestore deleteDocument error:', err);
      }
    }
  },

  async saveNotification(notification: Notification) {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'notifications', notification.id), notification);
      } catch (err) {
        console.error('Firestore saveNotification error:', err);
      }
    }
  },

  async saveAuditLog(log: AuditLog) {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        console.error('Firestore saveAuditLog error:', err);
      }
    }
  },

  async saveSettings(settings: BusinessSettings) {
    setLocalItem(STORAGE_KEYS.SETTINGS, settings);
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'settings', 'business_config'), settings);
      } catch (err) {
        console.error('Firestore saveSettings error:', err);
      }
    }
  },

  // Save changes locally in batch
  saveClientsLocally(clients: Client[]) {
    setLocalItem(STORAGE_KEYS.CLIENTS, clients);
  },
  savePlansLocally(plans: InvestmentPlan[]) {
    setLocalItem(STORAGE_KEYS.PLANS, plans);
  },
  saveInvestmentsLocally(investments: Investment[]) {
    setLocalItem(STORAGE_KEYS.INVESTMENTS, investments);
  },
  saveLoansLocally(loans: Loan[]) {
    setLocalItem(STORAGE_KEYS.LOANS, loans);
  },
  savePaymentsLocally(payments: Payment[]) {
    setLocalItem(STORAGE_KEYS.PAYMENTS, payments);
  },
  saveTransactionsLocally(transactions: Transaction[]) {
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  },
  saveDocumentsLocally(documents: DocumentItem[]) {
    setLocalItem(STORAGE_KEYS.DOCUMENTS, documents);
  },
  saveNotificationsLocally(notifications: Notification[]) {
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },
  saveAuditLogsLocally(logs: AuditLog[]) {
    setLocalItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // Real-time Firestore listeners for Android / Web sync
  subscribeToLoans(callback: (loans: Loan[]) => void): Unsubscribe | null {
    if (isFirebaseConfigured && db) {
      try {
        return onSnapshot(collection(db, 'loans'), (snapshot) => {
          const loans = snapshot.docs.map((d) => d.data() as Loan);
          callback(loans);
          setLocalItem(STORAGE_KEYS.LOANS, loans);
        }, (err) => {
          console.warn('Realtime loans subscription error:', err);
        });
      } catch (e) {
        console.warn('Failed to subscribe to loans in Firestore:', e);
      }
    }
    return null;
  },

  subscribeToClients(callback: (clients: Client[]) => void): Unsubscribe | null {
    if (isFirebaseConfigured && db) {
      try {
        return onSnapshot(collection(db, 'clients'), (snapshot) => {
          const clients = snapshot.docs.map((d) => d.data() as Client);
          callback(clients);
          setLocalItem(STORAGE_KEYS.CLIENTS, clients);
        }, (err) => {
          console.warn('Realtime clients subscription error:', err);
        });
      } catch (e) {
        console.warn('Failed to subscribe to clients in Firestore:', e);
      }
    }
    return null;
  },

  subscribeToNotifications(callback: (notifications: Notification[]) => void): Unsubscribe | null {
    if (isFirebaseConfigured && db) {
      try {
        return onSnapshot(collection(db, 'notifications'), (snapshot) => {
          const notifications = snapshot.docs.map((d) => d.data() as Notification);
          callback(notifications);
          setLocalItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
        }, (err) => {
          console.warn('Realtime notifications subscription error:', err);
        });
      } catch (e) {
        console.warn('Failed to subscribe to notifications in Firestore:', e);
      }
    }
    return null;
  },

  subscribeToPayments(callback: (payments: Payment[]) => void): Unsubscribe | null {
    if (isFirebaseConfigured && db) {
      try {
        return onSnapshot(collection(db, 'payments'), (snapshot) => {
          const payments = snapshot.docs.map((d) => d.data() as Payment);
          callback(payments);
          setLocalItem(STORAGE_KEYS.PAYMENTS, payments);
        }, (err) => {
          console.warn('Realtime payments subscription error:', err);
        });
      } catch (e) {
        console.warn('Failed to subscribe to payments in Firestore:', e);
      }
    }
    return null;
  },

  subscribeToInvestments(callback: (investments: Investment[]) => void): Unsubscribe | null {
    if (isFirebaseConfigured && db) {
      try {
        return onSnapshot(
          collection(db, 'investments'),
          (snapshot) => {
            const cachedPlans = getLocalItem<InvestmentPlan[]>(STORAGE_KEYS.PLANS, initialInvestmentPlans);
            const cachedClients = getLocalItem<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
            const investments = snapshot.docs.map((d) =>
              normalizeInvestment(d.data(), d.id, cachedPlans, cachedClients)
            );
            callback(investments);
            setLocalItem(STORAGE_KEYS.INVESTMENTS, investments);
          },
          (err) => {
            console.warn('Realtime investments subscription error:', err);
          }
        );
      } catch (e) {
        console.warn('Failed to subscribe to investments in Firestore:', e);
      }
    }
    return null;
  },
};
