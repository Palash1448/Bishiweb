import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select, Textarea } from '../ui/Select';
import { Button } from '../ui/Button';
import { Loan, PaymentMethod } from '../../types';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Send, Landmark, AlertCircle } from 'lucide-react';

interface LoanDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}

export const LoanDisbursementModal: React.FC<LoanDisbursementModalProps> = ({
  isOpen,
  onClose,
  loan,
}) => {
  const { disburseLoan } = useData();

  const [disbursementMethod, setDisbursementMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [disbursementRef, setDisbursementRef] = useState('RTGS-DISB-' + Math.floor(100000 + Math.random() * 900000));
  const [disbursementDate, setDisbursementDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loan) return null;

  const principal = loan.approvedAmount || loan.requestedAmount;

  const handleDisburse = async () => {
    if (!disbursementRef) {
      alert('Please enter a disbursement transaction / UTR reference.');
      return;
    }

    setIsSubmitting(true);
    try {
      await disburseLoan(loan.id, disbursementMethod, disbursementRef, disbursementDate);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Disburse Loan Funds"
      subtitle={`Transfer sanctioned funds for ${loan.clientName} (${loan.id})`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Sanctioned Amount Banner */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Approved Principal</p>
              <p className="text-xl font-extrabold text-emerald-800">{formatCurrency(principal)}</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500 block">Borrower Bank:</span>
            <strong className="text-slate-900">{loan.bankName}</strong>
            <span className="text-slate-600 block">A/C: {loan.accountNumber}</span>
          </div>
        </div>

        {/* Disbursement Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Disbursement Mode"
            value={disbursementMethod}
            onChange={(e) => setDisbursementMethod(e.target.value as PaymentMethod)}
            options={[
              { value: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT / RTGS)' },
              { value: 'UPI', label: 'Direct UPI Transfer' },
              { value: 'CHEQUE', label: 'Account Payee Cheque' },
              { value: 'CASH', label: 'Direct Cash Payout' },
            ]}
          />
          <Input
            label="Disbursement Date"
            type="date"
            required
            value={disbursementDate}
            onChange={(e) => setDisbursementDate(e.target.value)}
          />
        </div>

        <Input
          label="Bank Transaction / UTR / Reference #"
          required
          placeholder="e.g. RTGS-SBI-2026-981245"
          value={disbursementRef}
          onChange={(e) => setDisbursementRef(e.target.value)}
        />

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Upon disbursement, the loan status will automatically switch to <strong>ACTIVE</strong>, a debit transaction will be posted to the ledger, and the complete <strong>Reducing-Balance EMI Amortization Schedule</strong> will be generated.
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleDisburse}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Confirm & Disburse Funds
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface LoanRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}

const REJECTION_REASONS = [
  'High Debt-to-Income / Insufficient monthly disposable income',
  'Incomplete or unverified KYC identification documents',
  'Credit profile / CIBIL history below committee underwriting threshold',
  'Disbursement bank account details or salary records unverified',
  'Guarantor / co-signer unverified or uncontactable',
];

export const LoanRejectionModal: React.FC<LoanRejectionModalProps> = ({
  isOpen,
  onClose,
  loan,
}) => {
  const { rejectLoan } = useData();
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loan) return null;

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason for compliance.');
      return;
    }

    setIsSubmitting(true);
    try {
      await rejectLoan(loan.id, rejectionReason);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Loan Application"
      subtitle={`Specify compliance reason for rejecting ${loan.clientName} (${loan.id})`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
          <p className="font-semibold">Applicant: {loan.clientName} ({loan.id})</p>
          <p className="text-slate-600">Requested: {formatCurrency(loan.requestedAmount)} for {loan.loanPurpose}</p>
        </div>

        {/* Quick Reason Selection Chips */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Quick Compliance Reasons:</label>
          <div className="flex flex-wrap gap-1.5">
            {REJECTION_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setRejectionReason(reason)}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  rejectionReason === reason
                    ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                • {reason}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Mandatory Underwriting Rejection Reason"
          rows={3}
          required
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="State reason (e.g. low CIBIL, unverified business premises, incomplete KYC documents)"
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            isLoading={isSubmitting}
          >
            Confirm Rejection
          </Button>
        </div>
      </div>
    </Modal>
  );
};

