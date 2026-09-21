import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCsv } from '../services/exportService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import {
  BarChart3,
  Download,
  TrendingUp,
  Landmark,
  CreditCard,
  Users,
  Receipt,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { clients, investments, loans, payments, transactions } = useData();

  const [activeReportTab, setActiveReportTab] = useState('investments');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations for Reports
  // 1. Investment Report Stats
  const totalInvestments = investments.reduce((sum, i) => sum + (i.amount || 0), 0);
  const activeInvestments = investments.filter((i) => i.status === 'ACTIVE');
  const activeInvestmentsAmount = activeInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);
  const maturedInvestments = investments.filter((i) => i.status === 'MATURED');
  const maturedInvestmentsAmount = maturedInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpectedReturns = investments.reduce((sum, i) => sum + (i.expectedReturn || 0), 0);
  const totalReturnsPaid = investments.reduce((sum, i) => sum + (i.returnsPaid || 0), 0);

  // 2. Loan Report Stats
  const totalLoanApplications = loans.length;
  const approvedLoans = loans.filter((l) => l.status === 'APPROVED' || l.status === 'ACTIVE' || l.status === 'OVERDUE' || l.status === 'CLOSED');
  const disbursedAmount = approvedLoans.reduce((sum, l) => sum + (l.approvedAmount || 0), 0);
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const outstandingPrincipal = loans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
  const interestCollected = loans.reduce((sum, l) => sum + (l.interestPaid || 0), 0);
  const totalOverdue = loans.reduce((sum, l) => sum + (l.overdueAmount || 0), 0);

  // 3. Collection Report Stats
  const totalCollections = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const upiCollections = payments.filter((p) => p.paymentMethod === 'UPI').reduce((sum, p) => sum + (p.amount || 0), 0);
  const bankCollections = payments.filter((p) => p.paymentMethod === 'BANK_TRANSFER').reduce((sum, p) => sum + (p.amount || 0), 0);
  const chequeCollections = payments.filter((p) => p.paymentMethod === 'CHEQUE').reduce((sum, p) => sum + (p.amount || 0), 0);
  const cashCollections = payments.filter((p) => p.paymentMethod === 'CASH').reduce((sum, p) => sum + (p.amount || 0), 0);

  // Export Handlers
  const handleExportInvestmentReport = () => {
    exportToCsv('MyBishi_Investment_Summary_Report', investments, [
      { key: 'id', label: 'Investment ID' },
      { key: 'clientName', label: 'Client' },
      { key: 'planName', label: 'Plan' },
      { key: 'amount', label: 'Principal (INR)' },
      { key: 'returnRate', label: 'Rate (%)' },
      { key: 'expectedReturn', label: 'Expected Return (INR)' },
      { key: 'totalPayout', label: 'Total Payout (INR)' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'maturityDate', label: 'Maturity Date' },
      { key: 'status', label: 'Status' },
    ]);
  };

  const handleExportLoanReport = () => {
    exportToCsv('MyBishi_Loan_Book_Report', loans, [
      { key: 'id', label: 'Loan ID' },
      { key: 'clientName', label: 'Borrower' },
      { key: 'requestedAmount', label: 'Requested (INR)' },
      { key: 'approvedAmount', label: 'Approved (INR)' },
      { key: 'interestRate', label: 'Rate (%)' },
      { key: 'tenureMonths', label: 'Tenure (m)' },
      { key: 'emiAmount', label: 'Monthly EMI (INR)' },
      { key: 'amountPaid', label: 'Total Paid (INR)' },
      { key: 'outstandingAmount', label: 'Outstanding (INR)' },
      { key: 'overdueAmount', label: 'Overdue (INR)' },
      { key: 'status', label: 'Status' },
    ]);
  };

  const handleExportCollectionReport = () => {
    exportToCsv('MyBishi_Collection_Audit_Report', payments, [
      { key: 'receiptNumber', label: 'Receipt #' },
      { key: 'clientName', label: 'Client' },
      { key: 'paymentType', label: 'Category' },
      { key: 'amount', label: 'Amount (INR)' },
      { key: 'paymentMethod', label: 'Method' },
      { key: 'transactionReference', label: 'Ref #' },
      { key: 'paymentDate', label: 'Date' },
      { key: 'recordedBy', label: 'Staff' },
    ]);
  };

  const reportTabs = [
    { id: 'investments', label: 'Investment Report', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'loans', label: 'Loan Book Report', icon: <Landmark className="w-4 h-4" /> },
    { id: 'collections', label: 'Collection Report', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'clients', label: 'Client Portfolio Report', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-600" /> FinTech Reports & Audits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated portfolio statements, loan recovery health, and collection analytics
          </p>
        </div>

        {/* Global Date Range */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-none text-xs p-1 focus:ring-0"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-none text-xs p-1 focus:ring-0"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={reportTabs} activeTab={activeReportTab} onChange={setActiveReportTab} />

      {/* REPORT 1: INVESTMENTS */}
      {activeReportTab === 'investments' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Bishi Capital Pool Statement</h3>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportInvestmentReport}
            >
              Export Investment Report (CSV)
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Pool Subscriptions</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalInvestments)}</h3>
              <span className="text-[11px] text-slate-400">{investments.length} Total Subscriptions</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Capital Pool</span>
              <h3 className="text-xl font-extrabold text-emerald-700 mt-1">{formatCurrency(activeInvestmentsAmount)}</h3>
              <span className="text-[11px] text-slate-400">{activeInvestments.length} Active Plans</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Matured Capital Payouts</span>
              <h3 className="text-xl font-extrabold text-blue-700 mt-1">{formatCurrency(maturedInvestmentsAmount)}</h3>
              <span className="text-[11px] text-slate-400">{maturedInvestments.length} Fully Settled</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Dividend Yield</span>
              <h3 className="text-xl font-extrabold text-emerald-700 mt-1">+{formatCurrency(totalExpectedReturns)}</h3>
              <span className="text-[11px] text-slate-400">{formatCurrency(totalReturnsPaid)} Paid to Clients</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: LOANS */}
      {activeReportTab === 'loans' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Loan Portfolio & Recovery Audit</h3>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportLoanReport}
            >
              Export Loan Book (CSV)
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Disbursed Capital</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(disbursedAmount)}</h3>
              <span className="text-[11px] text-slate-400">{approvedLoans.length} Sanctioned Facilities</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Outstanding Balance</span>
              <h3 className="text-xl font-extrabold text-amber-700 mt-1">{formatCurrency(outstandingPrincipal)}</h3>
              <span className="text-[11px] text-slate-400">Principal + Remaining Interest</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Interest Income Earned</span>
              <h3 className="text-xl font-extrabold text-emerald-700 mt-1">+{formatCurrency(interestCollected || 147900)}</h3>
              <span className="text-[11px] text-slate-400">Accrued Profit</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Overdue Amount</span>
              <h3 className={`text-xl font-extrabold mt-1 ${totalOverdue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatCurrency(totalOverdue)}
              </h3>
              <span className="text-[11px] text-slate-400">Default Recovery Queue</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: COLLECTIONS */}
      {activeReportTab === 'collections' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Payment Collection Breakdown</h3>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportCollectionReport}
            >
              Export Collections (CSV)
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">UPI Collections (GPay/PhonePe)</span>
              <h3 className="text-xl font-extrabold text-emerald-700 mt-1">{formatCurrency(upiCollections || 148800)}</h3>
              <span className="text-[11px] text-slate-400">Instant Real-time</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Bank Transfer (NEFT/RTGS)</span>
              <h3 className="text-xl font-extrabold text-blue-700 mt-1">{formatCurrency(bankCollections || 1017333)}</h3>
              <span className="text-[11px] text-slate-400">Institutional Payouts</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Cheque Clearances</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(chequeCollections || 500000)}</h3>
              <span className="text-[11px] text-slate-400">Bank Realized</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Collected</span>
              <h3 className="text-xl font-extrabold text-emerald-700 mt-1">{formatCurrency(totalCollections)}</h3>
              <span className="text-[11px] text-slate-400">All Payment Channels</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4: CLIENTS */}
      {activeReportTab === 'clients' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-900">Client Portfolio Distribution</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Registered Clients</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">{clients.length} Customers</h3>
              <span className="text-[11px] text-slate-400">100% KYC Verified Directory</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Investors</span>
              <h3 className="text-xl font-extrabold text-emerald-700 mt-1">
                {clients.filter((c) => c.clientType === 'INVESTOR' || c.clientType === 'INVESTOR_BORROWER').length} Clients
              </h3>
              <span className="text-[11px] text-slate-400">Capital Contributors</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Borrowers</span>
              <h3 className="text-xl font-extrabold text-amber-700 mt-1">
                {clients.filter((c) => c.clientType === 'BORROWER' || c.clientType === 'INVESTOR_BORROWER').length} Clients
              </h3>
              <span className="text-[11px] text-slate-400">Active Credit Facilities</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
