import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Select';
import { Button } from '../ui/Button';
import { Loan } from '../../types';
import { useData } from '../../context/DataContext';
import { calculateEmi } from '../../services/financialCalculations';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, Percent, Calendar, Calculator, Sparkles, Building2, UserCheck, ShieldCheck } from 'lucide-react';

interface LoanApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}

const INTEREST_PRESETS = [10.0, 12.0, 14.0, 15.0, 16.0, 18.0, 24.0];
const TENURE_PRESETS = [6, 12, 18, 24, 36, 48, 60];

export const LoanApprovalModal: React.FC<LoanApprovalModalProps> = ({
  isOpen,
  onClose,
  loan,
}) => {
  const { approveLoan } = useData();

  const [approvedAmount, setApprovedAmount] = useState<number>(loan?.requestedAmount || 200000);
  const [interestRate, setInterestRate] = useState<number>(loan?.interestRate || 14.0);
  const [tenureMonths, setTenureMonths] = useState<number>(loan?.tenureMonths || 24);
  const [approvalNotes, setApprovalNotes] = useState('Credit score and KYC documents verified. Approved as per committee policy.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync when loan prop changes
  React.useEffect(() => {
    if (loan) {
      setApprovedAmount(loan.approvedAmount > 0 ? loan.approvedAmount : loan.requestedAmount);
      setInterestRate(loan.interestRate || 14.0);
      setTenureMonths(loan.tenureMonths || 24);
      setApprovalNotes('Credit score and KYC documents verified. Approved as per committee policy.');
    }
  }, [loan]);

  const emi = useMemo(() => {
    return calculateEmi(approvedAmount, interestRate, tenureMonths);
  }, [approvedAmount, interestRate, tenureMonths]);

  const totalPayable = emi * tenureMonths;
  const totalInterest = Math.max(0, totalPayable - approvedAmount);

  if (!loan) return null;

  const handleApprove = async () => {
    if (approvedAmount <= 0 || interestRate <= 0 || tenureMonths <= 0) {
      alert('Please provide valid amount, interest rate, and tenure values.');
      return;
    }

    setIsSubmitting(true);
    try {
      await approveLoan(loan.id, approvedAmount, interestRate, tenureMonths, approvalNotes);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handlePercentPreset = (percent: number) => {
    const calculated = Math.round((loan.requestedAmount * percent) / 100);
    setApprovedAmount(calculated);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sanction & Approve Loan"
      subtitle={`Configure underwriting terms, interest rate & EMI tenure for ${loan.clientName}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Borrower Overview Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-amber-50/50 border border-slate-200/80 rounded-2xl text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-slate-500 block text-[11px]">Applicant</span>
              <strong className="text-sm font-bold text-slate-900">{loan.clientName} ({loan.clientId})</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">Requested Amount & Tenure</span>
              <strong className="text-sm font-extrabold text-amber-700">
                {formatCurrency(loan.requestedAmount)} for {loan.tenureMonths} Months
              </strong>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
            <div>
              <span className="text-slate-400">Purpose:</span> <strong>{loan.loanPurpose}</strong>
            </div>
            <div>
              <span className="text-slate-400">Monthly Income:</span> <strong>{formatCurrency(loan.monthlyIncome || 0)}</strong>
            </div>
            <div>
              <span className="text-slate-400">Existing Debts:</span> <strong>{formatCurrency(loan.existingLiabilities || 0)}</strong>
            </div>
          </div>
        </div>

        {/* 1. Set Approved Principal Amount */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Approved Principal Amount (₹)</label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Quick:</span>
              <button
                type="button"
                onClick={() => handlePercentPreset(100)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                  approvedAmount === loan.requestedAmount
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                100% (Full)
              </button>
              <button
                type="button"
                onClick={() => handlePercentPreset(80)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                80%
              </button>
              <button
                type="button"
                onClick={() => handlePercentPreset(75)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => handlePercentPreset(50)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                50%
              </button>
            </div>
          </div>
          <Input
            type="number"
            required
            min={1000}
            step={1000}
            value={approvedAmount}
            onChange={(e) => setApprovedAmount(Number(e.target.value))}
            prefixText="₹"
          />
        </div>

        {/* 2. Set Interest Rate (% p.a.) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-amber-600" /> Approved Interest Rate (% p.a.)
            </label>
            <span className="text-[11px] font-semibold text-amber-700">{interestRate}% Annual</span>
          </div>
          <Input
            type="number"
            step="0.1"
            required
            min={0.1}
            max={100}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
          />
          {/* Quick Rate Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-medium">Standard Rates:</span>
            {INTEREST_PRESETS.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setInterestRate(rate)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  interestRate === rate
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* 3. Set EMI Tenure (Months) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Approved EMI Tenure (Months)
            </label>
            <span className="text-[11px] font-semibold text-emerald-700">{tenureMonths} Months ({Math.floor(tenureMonths / 12)}y {tenureMonths % 12}m)</span>
          </div>
          <Input
            type="number"
            required
            min={1}
            max={120}
            value={tenureMonths}
            onChange={(e) => setTenureMonths(Number(e.target.value))}
          />
          {/* Quick Tenure Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-medium">Tenure Presets:</span>
            {TENURE_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTenureMonths(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  tenureMonths === t
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t} Months
              </button>
            ))}
          </div>
        </div>

        {/* Live Monthly EMI Amortization Preview */}
        <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Calculated Monthly EMI</p>
                <p className="text-2xl font-black text-emerald-300">{formatCurrency(emi)} <span className="text-xs font-normal text-slate-300">/ month</span></p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 font-semibold">
              Reducing Balance
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Principal Sanctioned</span>
              <strong className="text-white font-bold">{formatCurrency(approvedAmount)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Interest</span>
              <strong className="text-amber-400 font-bold">+{formatCurrency(totalInterest)}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Total Repayable</span>
              <strong className="text-emerald-300 font-bold">{formatCurrency(totalPayable)}</strong>
            </div>
          </div>
        </div>

        {/* Notes & Conditions */}
        <Textarea
          label="Approval Notes & Underwriting Conditions"
          rows={2}
          value={approvalNotes}
          onChange={(e) => setApprovalNotes(e.target.value)}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleApprove}
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm & Approve Loan
          </Button>
        </div>
      </div>
    </Modal>
  );
};

