import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { CreateInvestmentModal } from '../components/investments/CreateInvestmentModal';
import { InvestmentDetailModal } from '../components/investments/InvestmentDetailModal';
import { LoanApplicationModal } from '../components/loans/LoanApplicationModal';
import { RecordPaymentModal } from '../components/payments/RecordPaymentModal';
import { ReceiptModal } from '../components/payments/ReceiptModal';
import { ManageClientCredentialsModal } from '../components/clients/ManageClientCredentialsModal';
import { Payment, Investment } from '../types';
import {
  Users,
  ArrowLeft,
  TrendingUp,
  Landmark,
  CreditCard,
  FileText,
  Activity,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  ShieldCheck,
  Plus,
  Printer,
  ExternalLink,
  Trash2,
  FileCheck,
  Key,
  ShieldAlert,
  Eye,
} from 'lucide-react';

const getInvAmount = (inv: Investment | any): number => {
  return Number(inv?.amount ?? inv?.investedAmount ?? inv?.investmentAmount ?? inv?.principal ?? 0);
};

const getInvExpectedReturn = (inv: Investment | any): number => {
  if (inv?.expectedReturn !== undefined && inv?.expectedReturn !== null) {
    return Number(inv.expectedReturn);
  }
  const amt = getInvAmount(inv);
  const rate = Number(inv?.returnRate || 0);
  const months = Number(inv?.durationMonths || 12);
  return Math.round((amt * rate * months) / 1200);
};

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    clients,
    investments,
    loans,
    payments,
    transactions,
    documents,
    uploadDocument,
    deleteDocument,
  } = useData();

  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [createInvestmentOpen, setCreateInvestmentOpen] = useState(false);
  const [applyLoanOpen, setApplyLoanOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);

  // New Doc Form
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<any>('AADHAAR');

  const client = useMemo(() => clients.find((c) => c.id === id), [clients, id]);

  const clientInvestments = useMemo(
    () => investments.filter((i) => i.clientId === id),
    [investments, id]
  );
  const clientLoans = useMemo(
    () => loans.filter((l) => l.clientId === id),
    [loans, id]
  );
  const clientPayments = useMemo(
    () => payments.filter((p) => p.clientId === id),
    [payments, id]
  );
  const clientTransactions = useMemo(
    () => transactions.filter((t) => t.clientId === id),
    [transactions, id]
  );
  const clientDocs = useMemo(
    () => documents.filter((d) => d.clientId === id),
    [documents, id]
  );

  if (!client) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Client Not Found</h2>
        <p className="text-xs text-slate-500">The client record {id} could not be located.</p>
        <Button onClick={() => navigate('/clients')}>Back to Clients</Button>
      </div>
    );
  }

  // Aggregate Metrics
  const totalInvestedAmount = clientInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpectedReturns = clientInvestments.reduce((sum, i) => sum + (i.expectedReturn || 0), 0);
  const totalReturnsPaid = clientInvestments.reduce((sum, i) => sum + (i.returnsPaid || 0), 0);
  
  const totalLoansAmount = clientLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount || 0), 0);
  const totalLoanOutstanding = clientLoans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
  const totalEmiPaid = clientLoans.reduce((sum, l) => sum + (l.amountPaid || 0), 0);
  const totalOverdue = clientLoans.reduce((sum, l) => sum + (l.overdueAmount || 0), 0);

  const nextLoanDue = clientLoans.find((l) => l.nextEmiDate && l.status === 'ACTIVE');

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;
    await uploadDocument({
      fileName: docName,
      fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      fileSize: 1250000,
      fileType: 'application/pdf',
      documentType: docType,
      clientId: client.id,
      clientName: client.name,
    });
    setDocName('');
    setUploadDocOpen(false);
  };

  const tabs = [
    { id: 'overview', label: '360° Overview', icon: <Users className="w-4 h-4" /> },
    { id: 'investments', label: 'Investments', count: clientInvestments.length, icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'loans', label: 'Loans & Credit', count: clientLoans.length, icon: <Landmark className="w-4 h-4" /> },
    { id: 'payments', label: 'Payment Receipts', count: clientPayments.length, icon: <CreditCard className="w-4 h-4" /> },
    { id: 'documents', label: 'KYC & Documents', count: clientDocs.length, icon: <FileText className="w-4 h-4" /> },
    { id: 'activity', label: 'Ledger Activity', count: clientTransactions.length, icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          onClick={() => navigate('/clients')}
        >
          Back to Clients CRM
        </Button>
      </div>

      {/* Header Dossier Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Identifiers */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-xl font-extrabold flex items-center justify-center shadow-md shadow-emerald-900/20 shrink-0">
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{client.name}</h1>
                <StatusBadge status={client.clientType} size="sm" />
                <StatusBadge status={client.kycStatus} size="sm" />
                <StatusBadge status={client.status} size="sm" />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="font-mono font-bold text-slate-700">{client.id}</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {client.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {client.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {client.city}, {client.state}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="primary"
              className="bg-fintech-navy-900 hover:bg-fintech-navy-800 text-white shadow-xs"
              leftIcon={<Key className="w-4 h-4 text-emerald-400" />}
              onClick={() => setCredentialsModalOpen(true)}
            >
              🔑 Portal Credentials
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
              leftIcon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
              onClick={() => setCreateInvestmentOpen(true)}
            >
              + Investment
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
              leftIcon={<Landmark className="w-4 h-4 text-amber-600" />}
              onClick={() => setApplyLoanOpen(true)}
            >
              + Loan
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              leftIcon={<CreditCard className="w-4 h-4 text-purple-600" />}
              onClick={() => setRecordPaymentOpen(true)}
            >
              + Payment
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setUploadDocOpen(true)}
            >
              Upload Doc
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Financial Aggregates Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Invested</span>
              <strong className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1 block">
                {formatCurrency(totalInvestedAmount)}
              </strong>
              <span className="text-[11px] text-slate-400">{clientInvestments.length} Bishi Plans</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Returns Accrued</span>
              <strong className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1 block">
                +{formatCurrency(totalExpectedReturns)}
              </strong>
              <span className="text-[11px] text-slate-400">{formatCurrency(totalReturnsPaid)} Paid</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Loan</span>
              <strong className="text-lg sm:text-xl font-extrabold text-amber-700 mt-1 block">
                {formatCurrency(totalLoanOutstanding)}
              </strong>
              <span className="text-[11px] text-slate-400">{clientLoans.length} Loans Total</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Next EMI Due</span>
              <strong className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
                {nextLoanDue?.nextEmiAmount ? formatCurrency(nextLoanDue.nextEmiAmount) : '—'}
              </strong>
              <span className="text-[11px] text-slate-400">
                {nextLoanDue?.nextEmiDate ? formatDate(nextLoanDue.nextEmiDate) : 'No due EMI'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Overdue Amount</span>
              <strong className={`text-lg sm:text-xl font-extrabold mt-1 block ${totalOverdue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {formatCurrency(totalOverdue)}
              </strong>
              <span className="text-[11px] text-slate-400">{totalOverdue > 0 ? 'Penalty Active' : 'Zero Overdue'}</span>
            </div>
          </div>

          {/* Dossier Profiles Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal & Professional */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" /> Personal & Professional Profile
              </h3>
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Occupation:</span>
                  <strong className="text-slate-900">{client.occupation || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Company / Business:</span>
                  <strong className="text-slate-900">{client.companyName || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Monthly Income:</span>
                  <strong className="text-emerald-700 font-bold">{formatCurrency(client.monthlyIncome)}/mo</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Date of Birth:</span>
                  <strong className="text-slate-900">{formatDate(client.dateOfBirth)} ({client.gender})</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Residential Address:</span>
                  <strong className="text-slate-900">{client.address}, {client.city}, {client.state} - {client.pinCode}</strong>
                </div>
              </div>
            </div>

            {/* Bank & Nominee Details */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-500" /> Banking & Nominee Information
              </h3>
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Bank Name:</span>
                  <strong className="text-slate-900">{client.bankName || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">IFSC Code:</span>
                  <strong className="font-mono text-slate-900">{client.ifscCode || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Account Number:</span>
                  <strong className="font-mono text-slate-900">{client.accountNumber || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Account Holder:</span>
                  <strong className="text-slate-900">{client.accountHolderName || client.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Nominee Name:</span>
                  <strong className="text-slate-900">{client.nomineeName || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Relationship & Phone:</span>
                  <strong className="text-slate-900">{client.nomineeRelationship || '—'} ({client.nomineePhone || '—'})</strong>
                </div>
              </div>
            </div>

            {/* Portal Login Credentials & Security Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech space-y-4 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-600" /> Client Portal Access & Login Credentials
                </h3>
                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<Key className="w-3.5 h-3.5" />}
                  onClick={() => setCredentialsModalOpen(true)}
                >
                  Manage / Reset Credentials
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block mb-1">Login ID / Username:</span>
                  <strong className="font-mono text-sm text-slate-900 font-bold">
                    {client.loginId || client.id}
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">(or phone {client.phone})</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block mb-1">Portal Password:</span>
                  <strong className="font-mono text-sm text-slate-900 font-bold">
                    {client.password ? '••••••••' : 'client123 (Default)'}
                  </strong>
                  <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">Click manage to view/reset</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block mb-1">Portal Status:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${client.portalAccessEnabled !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <strong className={`font-bold ${client.portalAccessEnabled !== false ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {client.portalAccessEnabled !== false ? 'Access Enabled' : 'Access Disabled'}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block mb-1">Last Portal Sign In:</span>
                  <strong className="text-slate-700">
                    {client.lastPortalLoginAt ? formatDateTime(client.lastPortalLoginAt) : 'Never logged in yet'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVESTMENTS */}
      {activeTab === 'investments' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Subscribed Bishi Investment Plans</h3>
            <Button
              size="sm"
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-700"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setCreateInvestmentOpen(true)}
            >
              New Investment
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
            {clientInvestments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No active investments found for this client.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Investment ID</th>
                    <th className="p-3.5">Plan Name</th>
                    <th className="p-3.5 text-right">Principal</th>
                    <th className="p-3.5 text-right">Expected Return</th>
                    <th className="p-3.5">Start / Maturity</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientInvestments.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvestment(inv)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 font-mono font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{inv.id}</td>
                      <td className="p-3.5 font-semibold text-slate-900">
                        {inv.planName} ({inv.returnRate}% p.a.)
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900 text-sm">
                        {formatCurrency(getInvAmount(inv))}
                      </td>
                      <td className="p-3.5 text-right font-bold text-blue-700">
                        +{formatCurrency(getInvExpectedReturn(inv))}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {formatDate(inv.startDate)} → {formatDate(inv.maturityDate)}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={inv.status} size="sm" />
                      </td>
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedInvestment(inv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="View Details & Cards"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LOANS */}
      {activeTab === 'loans' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Borrower Credit Facilities & Loans</h3>
            <Button
              size="sm"
              variant="primary"
              className="bg-amber-600 hover:bg-amber-700"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setApplyLoanOpen(true)}
            >
              Apply New Loan
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
            {clientLoans.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No loans associated with this client.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Loan ID</th>
                    <th className="p-3.5">Purpose</th>
                    <th className="p-3.5 text-right">Sanctioned</th>
                    <th className="p-3.5 text-right">Monthly EMI</th>
                    <th className="p-3.5 text-right">Outstanding</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{loan.id}</td>
                      <td className="p-3.5 text-slate-800">{loan.loanPurpose}</td>
                      <td className="p-3.5 text-right font-bold text-slate-900 text-sm">
                        {formatCurrency(loan.approvedAmount || loan.requestedAmount)}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-emerald-700">
                        {loan.emiAmount ? formatCurrency(loan.emiAmount) : '—'}
                      </td>
                      <td className="p-3.5 text-right font-bold text-amber-700">
                        {formatCurrency(loan.outstandingAmount)}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={loan.status} size="sm" />
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/loans/${loan.id}`}
                          className="text-xs text-emerald-700 hover:underline font-bold flex items-center justify-end gap-1"
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS & RECEIPTS */}
      {activeTab === 'payments' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Payment Transactions & Receipts</h3>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setRecordPaymentOpen(true)}
            >
              Record Payment
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
            {clientPayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No payment receipts recorded yet.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Receipt #</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientPayments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{pmt.receiptNumber}</td>
                      <td className="p-3.5 text-slate-800">{pmt.paymentType.replace(/_/g, ' ')}</td>
                      <td className="p-3.5 text-slate-600">{pmt.paymentMethod} ({pmt.transactionReference})</td>
                      <td className="p-3.5 text-right font-bold text-emerald-700 text-sm">
                        {formatCurrency(pmt.amount)}
                      </td>
                      <td className="p-3.5 text-slate-500">{formatDate(pmt.paymentDate)}</td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          leftIcon={<Printer className="w-3 h-3" />}
                          onClick={() => setSelectedReceiptPayment(pmt)}
                        >
                          Print
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Customer KYC & Agreement Documents</h3>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setUploadDocOpen(true)}
            >
              Upload Document
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientDocs.length === 0 ? (
              <div className="col-span-3 py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No documents uploaded yet for this client.
              </div>
            ) : (
              clientDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-fintech flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{doc.fileName}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {doc.documentType} • {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Uploaded: {formatDate(doc.uploadedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: ACTIVITY / AUDIT */}
      {activeTab === 'activity' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-900">Financial Ledger Events for {client.name}</h3>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
            {clientTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No financial ledger records found.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Txn ID</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Payment Method & Ref</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{txn.id}</td>
                      <td className="p-3.5 text-slate-800">{txn.description}</td>
                      <td className="p-3.5 text-slate-600">{txn.paymentMethod} ({txn.referenceNumber})</td>
                      <td
                        className={`p-3.5 text-right font-extrabold ${
                          txn.nature === 'CREDIT' ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {txn.nature === 'CREDIT' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={txn.nature} size="sm" dot={false} />
                      </td>
                      <td className="p-3.5 text-slate-500">{formatDateTime(txn.date || txn.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateInvestmentModal
        isOpen={createInvestmentOpen}
        onClose={() => setCreateInvestmentOpen(false)}
        preSelectedClientId={client.id}
      />
      <LoanApplicationModal
        isOpen={applyLoanOpen}
        onClose={() => setApplyLoanOpen(false)}
        preSelectedClientId={client.id}
      />
      <RecordPaymentModal
        isOpen={recordPaymentOpen}
        onClose={() => setRecordPaymentOpen(false)}
        preSelectedClientId={client.id}
      />
      <ReceiptModal
        isOpen={Boolean(selectedReceiptPayment)}
        onClose={() => setSelectedReceiptPayment(null)}
        payment={selectedReceiptPayment}
      />

      {/* Upload Doc Modal */}
      {uploadDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleUploadDoc} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-fintech-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Upload KYC / Customer Document</h3>
            <input
              type="text"
              required
              placeholder="e.g. Rahul_Patil_Aadhaar_Front.pdf"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="w-full bg-white text-slate-900 text-sm rounded-xl border border-slate-300 py-2.5 px-3.5"
            />
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-white text-slate-900 text-sm rounded-xl border border-slate-300 py-2.5 px-3.5"
            >
              <option value="AADHAAR">Aadhaar Card</option>
              <option value="PAN">PAN Card</option>
              <option value="INCOME_PROOF">Income Proof (Salary / ITR)</option>
              <option value="BANK_PROOF">Bank Statement</option>
              <option value="LOAN_AGREEMENT">Signed Loan Agreement</option>
              <option value="OTHER">Other Proof</option>
            </select>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setUploadDocOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save & Upload
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Manage Client Portal Credentials Modal */}
      <ManageClientCredentialsModal
        isOpen={credentialsModalOpen}
        onClose={() => setCredentialsModalOpen(false)}
        client={client}
      />

      {/* Investment Popup Cards Modal */}
      <InvestmentDetailModal
        isOpen={Boolean(selectedInvestment)}
        onClose={() => setSelectedInvestment(null)}
        investment={selectedInvestment}
      />
    </div>
  );
};
