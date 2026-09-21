import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Loan } from '../../types';
import { calculateEmi } from '../../services/financialCalculations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoanApprovalModal } from '../loans/LoanApprovalModal';
import { LoanRejectionModal } from '../loans/LoanDisbursementModal';
import { LoanApplicationModal } from '../loans/LoanApplicationModal';
import { Button } from '../ui/Button';
import {
  Smartphone,
  Landmark,
  Percent,
  Calendar,
  Calculator,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  Plus,
  Clock,
} from 'lucide-react';

const INTEREST_PRESETS = [10.0, 12.0, 14.0, 15.0, 16.0, 18.0];
const TENURE_PRESETS = [6, 12, 18, 24, 36, 48];

interface LoanRowConfig {
  approvedAmount: number;
  interestRate: number;
  tenureMonths: number;
}

export const PendingLoanApplicationsWidget: React.FC = () => {
  const { loans, approveLoan } = useData();
  const navigate = useNavigate();

  // Pending / Under Review loans
  const pendingLoans = useMemo(
    () => loans.filter((l) => l.status === 'PENDING' || l.status === 'UNDER_REVIEW'),
    [loans]
  );

  // Local state for inline rate, tenure & amount adjustments per loan
  const [loanConfigs, setLoanConfigs] = useState<Record<string, LoanRowConfig>>({});
  const [submittingLoanId, setSubmittingLoanId] = useState<string | null>(null);

  // Modals
  const [selectedLoanForApprovalModal, setSelectedLoanForApprovalModal] = useState<Loan | null>(null);
  const [selectedLoanForRejection, setSelectedLoanForRejection] = useState<Loan | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Helper to get or initialize config for a loan
  const getConfig = (loan: Loan): LoanRowConfig => {
    if (loanConfigs[loan.id]) {
      return loanConfigs[loan.id];
    }
    return {
      approvedAmount: loan.approvedAmount > 0 ? loan.approvedAmount : loan.requestedAmount,
      interestRate: loan.interestRate || 14.0,
      tenureMonths: loan.tenureMonths || 24,
    };
  };

  const updateConfig = (loanId: string, updates: Partial<LoanRowConfig>, loan: Loan) => {
    const current = getConfig(loan);
    setLoanConfigs((prev) => ({
      ...prev,
      [loanId]: { ...current, ...updates },
    }));
  };

  const handleQuickApprove = async (loan: Loan) => {
    const config = getConfig(loan);
    setSubmittingLoanId(loan.id);
    try {
      await approveLoan(
        loan.id,
        config.approvedAmount,
        config.interestRate,
        config.tenureMonths,
        'Approved directly via Admin Underwriting Dashboard.'
      );
    } finally {
      setSubmittingLoanId(null);
    }
  };

  return (
    <div id="pending-loan-applications-section" className="bg-white rounded-3xl border border-slate-200/80 shadow-fintech p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-500/20">
            <Smartphone className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Mobile & Online Loan Underwriting
              </h2>
              {pendingLoans.length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black animate-pulse border border-amber-300">
                  {pendingLoans.length} Action Required
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  All Caught Up
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review credit requests from Android app, configure interest rates & EMI tenure, and approve or reject
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4 text-amber-600" />}
            onClick={() => setIsApplyModalOpen(true)}
          >
            New / Test Application
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 font-bold"
            onClick={() => navigate('/loans')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            All Loans ({loans.length})
          </Button>
        </div>
      </div>

      {/* Content */}
      {pendingLoans.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/70 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Pending Applications</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When users submit loan applications from the Android mobile app or client portal, they will instantly appear here with live underwriting controls.
          </p>
          <Button
            size="sm"
            variant="primary"
            className="bg-amber-600 hover:bg-amber-700"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Simulate New Loan Application
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingLoans.map((loan) => {
            const config = getConfig(loan);
            const emi = calculateEmi(config.approvedAmount, config.interestRate, config.tenureMonths);
            const totalPayable = emi * config.tenureMonths;
            const totalInterest = Math.max(0, totalPayable - config.approvedAmount);
            const isSubmitting = submittingLoanId === loan.id;

            return (
              <div
                key={loan.id}
                className="rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-400/80 transition-all p-5 space-y-4 relative overflow-hidden"
              >
                {/* Top Strip: Applicant Info */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center shrink-0 border border-amber-200">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-base text-slate-900 font-extrabold">{loan.clientName}</strong>
                        <span className="font-mono text-xs font-bold text-slate-500">({loan.id})</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                          <Smartphone className="w-3 h-3" /> Android App Submission
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Purpose: <strong className="text-slate-800">{loan.loanPurpose}</strong></span>
                        <span>•</span>
                        <span>Applied on: <strong className="text-slate-800">{formatDate(loan.applicationDate)}</strong></span>
                        <span>•</span>
                        <span>Phone: <strong className="text-slate-800">{loan.clientPhone || '—'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Figures */}
                  <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Requested</span>
                      <strong className="text-sm font-black text-slate-900">{formatCurrency(loan.requestedAmount)}</strong>
                    </div>
                    <div className="w-px h-7 bg-slate-200" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Requested Tenure</span>
                      <strong className="text-sm font-bold text-slate-800">{loan.tenureMonths} Mo</strong>
                    </div>
                    <div className="w-px h-7 bg-slate-200" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Income</span>
                      <strong className="text-sm font-bold text-emerald-700">{formatCurrency(loan.monthlyIncome || 0)}/mo</strong>
                    </div>
                  </div>
                </div>

                {/* Main Underwriting Term Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Controls Column (8 cols) */}
                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Sanctioned Amount */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700">Sanction Amount (₹)</label>
                        <button
                          type="button"
                          onClick={() => updateConfig(loan.id, { approvedAmount: loan.requestedAmount }, loan)}
                          className="text-[10px] font-bold text-amber-700 hover:underline"
                        >
                          100%
                        </button>
                      </div>
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        value={config.approvedAmount}
                        onChange={(e) => updateConfig(loan.id, { approvedAmount: Number(e.target.value) }, loan)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                      />
                      <div className="flex items-center gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() => updateConfig(loan.id, { approvedAmount: Math.round(loan.requestedAmount * 0.8) }, loan)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          80%
                        </button>
                        <button
                          type="button"
                          onClick={() => updateConfig(loan.id, { approvedAmount: Math.round(loan.requestedAmount * 0.75) }, loan)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          75%
                        </button>
                        <button
                          type="button"
                          onClick={() => updateConfig(loan.id, { approvedAmount: Math.round(loan.requestedAmount * 0.5) }, loan)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          50%
                        </button>
                      </div>
                    </div>

                    {/* 2. Set Interest Rate */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Percent className="w-3 h-3 text-amber-600" /> Interest Rate (% p.a.)
                        </label>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        min={0.1}
                        value={config.interestRate}
                        onChange={(e) => updateConfig(loan.id, { interestRate: Number(e.target.value) }, loan)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                      />
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        {INTEREST_PRESETS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => updateConfig(loan.id, { interestRate: r }, loan)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              config.interestRate === r
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {r}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Set EMI Tenure */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-600" /> EMI Tenure (Months)
                        </label>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={config.tenureMonths}
                        onChange={(e) => updateConfig(loan.id, { tenureMonths: Number(e.target.value) }, loan)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        {TENURE_PRESETS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateConfig(loan.id, { tenureMonths: t }, loan)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              config.tenureMonths === t
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {t}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Calculated Live EMI Card (4 cols) */}
                  <div className="lg:col-span-4 p-3.5 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border border-slate-800 flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Monthly EMI</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-semibold border border-emerald-700/50">
                        Reducing Balance
                      </span>
                    </div>
                    <div>
                      <p className="text-xl font-black text-emerald-300">{formatCurrency(emi)} <span className="text-xs font-normal text-slate-300">/ mo</span></p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1.5 border-t border-slate-800">
                      <span>Total: <strong className="text-white">{formatCurrency(totalPayable)}</strong></span>
                      <span className="text-amber-400 font-semibold">Interest: +{formatCurrency(totalInterest)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/loans/${loan.id}`)}
                    className="text-xs font-bold text-slate-600 hover:text-amber-700 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Borrower KYC & Bank Details
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<XCircle className="w-4 h-4" />}
                      onClick={() => setSelectedLoanForRejection(loan)}
                      disabled={isSubmitting}
                    >
                      Reject Application
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300 hover:bg-slate-50"
                      onClick={() => setSelectedLoanForApprovalModal(loan)}
                      disabled={isSubmitting}
                    >
                      Advanced Terms...
                    </Button>

                    <Button
                      size="sm"
                      variant="success"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => handleQuickApprove(loan)}
                      isLoading={isSubmitting}
                    >
                      Approve Loan ({config.interestRate}%, {config.tenureMonths}m)
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <LoanApprovalModal
        isOpen={Boolean(selectedLoanForApprovalModal)}
        onClose={() => setSelectedLoanForApprovalModal(null)}
        loan={selectedLoanForApprovalModal}
      />
      <LoanRejectionModal
        isOpen={Boolean(selectedLoanForRejection)}
        onClose={() => setSelectedLoanForRejection(null)}
        loan={selectedLoanForRejection}
      />
      <LoanApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};
