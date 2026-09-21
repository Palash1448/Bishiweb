import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { ReceiptModal } from '../../components/payments/ReceiptModal';
import { Payment } from '../../types';
import {
  TrendingUp,
  Landmark,
  CreditCard,
  Calendar,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Clock,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const ClientPortalDashboard: React.FC = () => {
  const { currentClient, user } = useAuth();
  const { clients, investments, loans, payments, transactions } = useData();
  const navigate = useNavigate();

  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Active client
  const client = useMemo(() => {
    if (currentClient) return currentClient;
    if (user?.clientId) return clients.find((c) => c.id === user.clientId) || null;
    return clients[0] || null;
  }, [currentClient, user, clients]);

  const clientId = client?.id || '';

  const clientInvestments = useMemo(
    () => investments.filter((i) => i.clientId === clientId),
    [investments, clientId]
  );
  const clientLoans = useMemo(
    () => loans.filter((l) => l.clientId === clientId),
    [loans, clientId]
  );
  const clientPayments = useMemo(
    () => payments.filter((p) => p.clientId === clientId),
    [payments, clientId]
  );
  const clientTransactions = useMemo(
    () => transactions.filter((t) => t.clientId === clientId),
    [transactions, clientId]
  );

  if (!client) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-fintech space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No Client Account Loaded</h2>
        <p className="text-xs text-slate-500">Please log in to access your My Bishi portal.</p>
        <Button onClick={() => navigate('/login')}>Go to Sign In</Button>
      </div>
    );
  }

  // Financial aggregates
  const totalInvested = clientInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpectedReturns = clientInvestments.reduce((sum, i) => sum + (i.expectedReturn || 0), 0);
  const totalReturnsPaid = clientInvestments.reduce((sum, i) => sum + (i.returnsPaid || 0), 0);
  const totalOutstanding = clientLoans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
  const totalLoanAmount = clientLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount || 0), 0);

  const activeLoans = clientLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'DISBURSED');
  const nextLoanDue = activeLoans.find((l) => l.nextEmiDate && (l.nextEmiAmount || 0) > 0);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white shadow-fintech-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Client Financial Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {client.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track your Bishi pool returns, upcoming loan EMI payments, and download certified receipts anytime.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                ID: {client.id}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> KYC: {client.kycStatus}
              </span>
              <span>•</span>
              <span>Member Since: {formatDate(client.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col items-stretch gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-950"
              leftIcon={<TrendingUp className="w-4 h-4" />}
              onClick={() => navigate('/portal/investments')}
            >
              View Investments
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700"
              leftIcon={<Landmark className="w-4 h-4 text-amber-400" />}
              onClick={() => navigate('/portal/loans')}
            >
              Loan Schedule & EMIs
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invested */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Total Invested</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {formatCurrency(totalInvested)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{clientInvestments.length} Active Plans</span>
            <span className="text-emerald-700 font-semibold">+{formatCurrency(totalExpectedReturns)} Est. Return</span>
          </div>
        </div>

        {/* Returns Accrued / Paid */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Dividends Received</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">
            {formatCurrency(totalReturnsPaid)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Payout Status</span>
            <span className="text-blue-700 font-semibold">Credited to Bank</span>
          </div>
        </div>

        {/* Outstanding Loan Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Outstanding Balance</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">
            {formatCurrency(totalOutstanding)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{activeLoans.length} Active Loans</span>
            <span className="text-slate-600 font-medium">Principal: {formatCurrency(totalLoanAmount)}</span>
          </div>
        </div>

        {/* Next EMI Due */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Next EMI Due</span>
            <div className={`p-2 rounded-xl ${nextLoanDue ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {nextLoanDue?.nextEmiAmount ? formatCurrency(nextLoanDue.nextEmiAmount) : '—'}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Due Date:</span>
            <span className="font-bold text-slate-900">
              {nextLoanDue?.nextEmiDate ? formatDate(nextLoanDue.nextEmiDate) : 'No pending EMI'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Investments & Loans Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Investments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> My Investment Pools
              </h2>
              <p className="text-xs text-slate-500">Your subscribed high-yield Bishi plans</p>
            </div>
            <button
              onClick={() => navigate('/portal/investments')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              View All ({clientInvestments.length}) →
            </button>
          </div>

          {clientInvestments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No active investments found under your account.
            </div>
          ) : (
            <div className="space-y-3">
              {clientInvestments.slice(0, 3).map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:border-emerald-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{inv.planName}</h4>
                      <StatusBadge status={inv.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Started: {formatDate(inv.startDate)} • Maturity: {formatDate(inv.maturityDate)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 block">Principal</span>
                    <strong className="text-sm font-black text-emerald-700">
                      {formatCurrency(inv.amount)}
                    </strong>
                    <span className="text-[11px] text-emerald-600 font-bold block">
                      @{inv.returnRate}% Return
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Loans & EMI Schedule */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-600" /> Active Loans & Repayments
              </h2>
              <p className="text-xs text-slate-500">Track monthly installments and balances</p>
            </div>
            <button
              onClick={() => navigate('/portal/loans')}
              className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
            >
              View Loans ({clientLoans.length}) →
            </button>
          </div>

          {clientLoans.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No active loans or credit accounts found.
            </div>
          ) : (
            <div className="space-y-3">
              {clientLoans.slice(0, 3).map((loan) => {
                const paidPercent = loan.approvedAmount > 0
                  ? Math.min(100, Math.round((loan.amountPaid / (loan.totalPayable || loan.approvedAmount)) * 100))
                  : 0;
                return (
                  <div
                    key={loan.id}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:border-amber-300 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{loan.id} - {loan.loanPurpose}</h4>
                          <StatusBadge status={loan.status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500">
                          Tenure: {loan.tenureMonths} Months • Interest: {loan.interestRate}% p.a.
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">EMI Amount</span>
                        <strong className="text-sm font-bold text-slate-900">
                          {formatCurrency(loan.emiAmount)}/mo
                        </strong>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Paid: {formatCurrency(loan.amountPaid)}</span>
                        <span>Outstanding: {formatCurrency(loan.outstandingAmount)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all rounded-full"
                          style={{ width: `${paidPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Passbook Activity */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-600" /> Recent Passbook & Receipts
            </h2>
            <p className="text-xs text-slate-500">Payment receipts and ledger entries for your account</p>
          </div>
          <button
            onClick={() => navigate('/portal/payments')}
            className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
          >
            View Full Passbook →
          </button>
        </div>

        {clientPayments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No payments recorded yet. Receipts will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment Type</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientPayments.slice(0, 5).map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{pay.receiptNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(pay.paymentDate)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {pay.paymentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{pay.paymentMethod}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(pay)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt View Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
      />
    </div>
  );
};
