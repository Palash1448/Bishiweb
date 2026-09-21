import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoanApplicationModal } from '../../components/loans/LoanApplicationModal';
import { Loan } from '../../types';
import {
  Landmark,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';

export const ClientPortalLoans: React.FC = () => {
  const { currentClient, user } = useAuth();
  const { clients, loans } = useData();
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const client = useMemo(() => {
    if (currentClient) return currentClient;
    if (user?.clientId) return clients.find((c) => c.id === user.clientId) || null;
    return clients[0] || null;
  }, [currentClient, user, clients]);

  const clientId = client?.id || '';

  const clientLoans = useMemo(
    () => loans.filter((l) => l.clientId === clientId),
    [loans, clientId]
  );

  const activeLoan = selectedLoanId
    ? clientLoans.find((l) => l.id === selectedLoanId) || clientLoans[0]
    : clientLoans[0];

  const totalOutstanding = clientLoans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
  const totalPaid = clientLoans.reduce((sum, l) => sum + (l.amountPaid || 0), 0);
  const totalLoansAmount = clientLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Landmark className="w-7 h-7 text-amber-600" /> Loans & EMI Repayment Schedules
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review approved loans, outstanding balances, and monthly EMI installment timelines
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 shadow-md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsApplyModalOpen(true)}
        >
          Apply for New Loan
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Loan Sanctioned</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalLoansAmount)}</p>
          <span className="text-xs text-slate-400 mt-1 block">{clientLoans.length} Loans Total</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Outstanding Balance</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{formatCurrency(totalOutstanding)}</p>
          <span className="text-xs text-slate-400 mt-1 block">Principal + Interest remaining</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Repaid to Date</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(totalPaid)}</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">EMIs Cleared</span>
        </div>
      </div>

      {clientLoans.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-fintech text-xs text-slate-400">
          No loan accounts or active credit lines found for your profile.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Loan Selector Tabs */}
          {clientLoans.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {clientLoans.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLoanId(l.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeLoan?.id === l.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {l.id} - {l.loanPurpose}
                </button>
              ))}
            </div>
          )}

          {activeLoan && (
            <div className="space-y-6">
              {/* Selected Loan Dossier Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-slate-900">{activeLoan.id}: {activeLoan.loanPurpose}</h3>
                      <StatusBadge status={activeLoan.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Applied: {formatDate(activeLoan.applicationDate)} {activeLoan.disbursementDate && `• Disbursed: ${formatDate(activeLoan.disbursementDate)}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Monthly EMI</span>
                    <strong className="text-xl font-black text-slate-900">{formatCurrency(activeLoan.emiAmount)}/mo</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 block">Sanctioned Amount:</span>
                    <strong className="text-sm font-bold text-slate-900">{formatCurrency(activeLoan.approvedAmount || activeLoan.requestedAmount)}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 block">Interest Rate:</span>
                    <strong className="text-sm font-bold text-slate-900">{activeLoan.interestRate}% p.a.</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 block">Tenure:</span>
                    <strong className="text-sm font-bold text-slate-900">{activeLoan.tenureMonths} Months</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 block">Outstanding:</span>
                    <strong className="text-sm font-black text-amber-700">{formatCurrency(activeLoan.outstandingAmount)}</strong>
                  </div>
                </div>
              </div>

              {/* EMI Schedule Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Complete EMI Repayment Schedule ({activeLoan.emiSchedule?.length || 0} Installments)
                    </h4>
                    <p className="text-[11px] text-slate-500">Includes reducing balance principal and interest breakdown</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold border-b border-slate-200/80">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4 text-right">Principal</th>
                        <th className="py-3 px-4 text-right">Interest</th>
                        <th className="py-3 px-4 text-right">Total EMI</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {(activeLoan.emiSchedule || []).map((item) => (
                        <tr
                          key={item.emiNumber}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            item.status === 'PAID'
                              ? 'bg-emerald-50/20'
                              : item.status === 'DUE' || item.status === 'OVERDUE'
                              ? 'bg-amber-50/30'
                              : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-900">EMI {item.emiNumber}</td>
                          <td className="py-3 px-4 text-slate-700">{formatDate(item.dueDate)}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(item.principal)}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(item.interest)}</td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">{formatCurrency(item.emiAmount)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              item.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'OVERDUE'
                                ? 'bg-rose-100 text-rose-800'
                                : item.status === 'DUE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500">
                            {item.paidDate ? formatDate(item.paidDate) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Apply Loan Modal */}
      <LoanApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        preSelectedClientId={clientId}
      />
    </div>
  );
};
