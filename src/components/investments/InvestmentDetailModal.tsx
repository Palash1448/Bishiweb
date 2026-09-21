import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Investment, InvestmentStatus, Payment } from '../../types';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ReceiptModal } from '../payments/ReceiptModal';
import {
  TrendingUp,
  Calendar,
  Layers,
  User,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Copy,
  Check,
  FileText,
} from 'lucide-react';

interface InvestmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment | null;
}

export const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({
  isOpen,
  onClose,
  investment,
}) => {
  const navigate = useNavigate();
  const { updateInvestmentStatus, payments } = useData();
  const [copiedRef, setCopiedRef] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  if (!investment) return null;

  // Amount fallbacks
  const principalAmount = Number(
    investment.amount ?? (investment as any).investedAmount ?? (investment as any).principal ?? 0
  );
  const expectedReturn = Number(
    investment.expectedReturn ?? (investment as any).expectedReturns ?? ((principalAmount * (investment.returnRate || 0) * (investment.durationMonths || 12)) / 1200)
  );
  const totalPayout = Number(
    investment.totalPayout ?? (principalAmount + expectedReturn)
  );
  const returnsPaid = Number(investment.returnsPaid ?? 0);

  // Time progress calculation
  const start = new Date(investment.startDate).getTime();
  const end = new Date(investment.maturityDate).getTime();
  const now = Date.now();
  const totalDuration = Math.max(1, end - start);
  const elapsed = Math.max(0, Math.min(totalDuration, now - start));
  const progressPercent = Math.min(100, Math.round((elapsed / totalDuration) * 100));

  // Find linked receipt if any
  const linkedPayment = payments.find(
    (p) => p.investmentId === investment.id || (p.clientId === investment.clientId && p.amount === principalAmount)
  );

  const handleCopyRef = () => {
    if (investment.transactionReference) {
      navigator.clipboard.writeText(investment.transactionReference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleStatusChange = async (newStatus: InvestmentStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateInvestmentStatus(investment.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !selectedReceipt}
        onClose={onClose}
        title="Investment Portfolio Details"
        subtitle={`Complete financial overview for ${investment.id}`}
        maxWidth="3xl"
      >
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border border-slate-800 shadow-fintech relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-700/50">
                    {investment.id}
                  </span>
                  <StatusBadge status={investment.status} size="sm" />
                </div>
                <h3 className="text-xl font-black text-white pt-1">{investment.planName}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <span>Investor:</span>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/clients/${investment.clientId}`);
                    }}
                    className="font-bold text-emerald-300 hover:underline flex items-center gap-1"
                  >
                    {investment.clientName} ({investment.clientId}) <ExternalLink className="w-3 h-3 inline" />
                  </button>
                </p>
              </div>

              <div className="text-right sm:text-right shrink-0 bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Principal Capital</span>
                <p className="text-2xl font-black text-white">{formatCurrency(principalAmount)}</p>
                <span className="text-xs text-emerald-300 font-bold">@{investment.returnRate}% Annual Return</span>
              </div>
            </div>
          </div>

          {/* 4 Financial Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invested Amount</span>
              <strong className="text-base font-black text-slate-900 mt-0.5 block">{formatCurrency(principalAmount)}</strong>
              <span className="text-[10px] text-slate-400">Fixed Deposit</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Expected Profit</span>
              <strong className="text-base font-black text-emerald-800 mt-0.5 block">+{formatCurrency(expectedReturn)}</strong>
              <span className="text-[10px] text-emerald-600 font-semibold">{investment.returnRate}% Yield</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Total Maturity Payout</span>
              <strong className="text-base font-black text-blue-800 mt-0.5 block">{formatCurrency(totalPayout)}</strong>
              <span className="text-[10px] text-blue-600 font-semibold">Principal + Profit</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Returns Paid</span>
              <strong className="text-base font-black text-purple-800 mt-0.5 block">{formatCurrency(returnsPaid)}</strong>
              <span className="text-[10px] text-purple-600 font-semibold">Credited to Date</span>
            </div>
          </div>

          {/* Timeline & Term Progress */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Investment Timeline ({investment.durationMonths} Months Tenure)</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500">{progressPercent}% Term Elapsed</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className={`h-full transition-all rounded-full ${
                  progressPercent >= 100 ? 'bg-emerald-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Start Date</span>
                <strong className="text-slate-900">{formatDate(investment.startDate)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Maturity Date</span>
                <strong className="text-slate-900">{formatDate(investment.maturityDate)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Current Status</span>
                <strong className="text-slate-900">{investment.status}</strong>
              </div>
            </div>
          </div>

          {/* Transaction & Proof Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] text-slate-400">
                <CreditCard className="w-4 h-4 text-blue-500" /> Deposit & Payment Details
              </h4>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <strong className="text-slate-900">{investment.paymentMethod || 'UPI'}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reference / UTR #:</span>
                  <div className="flex items-center gap-1">
                    <strong className="font-mono text-slate-900">{investment.transactionReference || '—'}</strong>
                    {investment.transactionReference && (
                      <button
                        onClick={handleCopyRef}
                        className="p-1 rounded hover:bg-slate-100 text-slate-500"
                        title="Copy Reference"
                      >
                        {copiedRef ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recorded By:</span>
                  <strong className="text-slate-900">{investment.createdBy || 'Admin'}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] text-slate-400">
                <FileText className="w-4 h-4 text-purple-500" /> Notes & Certified Receipts
              </h4>
              <div className="space-y-1.5 pt-1">
                <div className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 min-h-[42px]">
                  {investment.notes || 'No custom remarks recorded for this investment.'}
                </div>
                {linkedPayment && (
                  <button
                    onClick={() => setSelectedReceipt(linkedPayment)}
                    className="w-full text-center py-1 text-xs font-bold text-emerald-700 hover:underline flex items-center justify-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Certified Deposit Receipt (#{linkedPayment.receiptNumber})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Update Status:</span>
              <select
                value={investment.status}
                onChange={(e) => handleStatusChange(e.target.value as InvestmentStatus)}
                disabled={isUpdatingStatus}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="MATURED">MATURED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>

              {investment.status === 'ACTIVE' && (
                <Button
                  variant="primary"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleStatusChange('MATURED')}
                  isLoading={isUpdatingStatus}
                >
                  Mark as Matured
                </Button>
              )}

              {investment.status === 'MATURED' && (
                <Button
                  variant="success"
                  onClick={() => handleStatusChange('CLOSED')}
                  isLoading={isUpdatingStatus}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Close & Payout
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal if clicked */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          payment={selectedReceipt}
        />
      )}
    </>
  );
};
