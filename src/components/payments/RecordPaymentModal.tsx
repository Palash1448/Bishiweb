import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select, Textarea } from '../ui/Select';
import { Button } from '../ui/Button';
import { useData } from '../../context/DataContext';
import { PaymentMethod, PaymentType, Payment } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import { CreditCard } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedLoanId?: string;
  preSelectedEmiNumber?: number;
  preSelectedClientId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  preSelectedLoanId,
  preSelectedEmiNumber,
  preSelectedClientId,
}) => {
  const { clients, loans, investments, recordEmiPayment, recordGenericPayment } = useData();

  const [paymentType, setPaymentType] = useState<PaymentType>(preSelectedLoanId ? 'LOAN_EMI' : 'LOAN_EMI');
  const [clientId, setClientId] = useState(preSelectedClientId || clients[0]?.id || '');
  const [loanId, setLoanId] = useState(preSelectedLoanId || loans[0]?.id || '');
  const [emiNumber, setEmiNumber] = useState<number>(preSelectedEmiNumber || 1);
  const [investmentId, setInvestmentId] = useState(investments[0]?.id || '');
  const [amount, setAmount] = useState<number>(14400);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionReference, setTransactionReference] = useState('UPI-' + Math.floor(100000 + Math.random() * 900000));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPayment, setGeneratedPayment] = useState<Payment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Sync props when modal opens or preselected values change
  React.useEffect(() => {
    if (preSelectedLoanId) {
      setLoanId(preSelectedLoanId);
      setPaymentType('LOAN_EMI');
    }
    if (preSelectedClientId) {
      setClientId(preSelectedClientId);
    }
    if (preSelectedEmiNumber) {
      setEmiNumber(preSelectedEmiNumber);
    }
  }, [preSelectedLoanId, preSelectedClientId, preSelectedEmiNumber, isOpen]);

  // Selected loan & schedule
  const selectedLoan = useMemo(() => loans.find((l) => l.id === loanId), [loans, loanId]);
  const activeClient = useMemo(() => clients.find((c) => c.id === clientId), [clients, clientId]);

  const emiScheduleList = useMemo(() => selectedLoan?.emiSchedule || [], [selectedLoan]);

  // When loan changes, update client & EMI list
  const handleLoanChange = (newLoanId: string) => {
    setLoanId(newLoanId);
    const l = loans.find((item) => item.id === newLoanId);
    if (l) {
      setClientId(l.clientId);
      const schedule = l.emiSchedule || [];
      const firstDue = schedule.find((e) => e.status !== 'PAID') || schedule[0];
      if (firstDue) {
        setEmiNumber(firstDue.emiNumber);
        setAmount(firstDue.remainingAmount || firstDue.emiAmount);
      } else if (l.emiAmount > 0) {
        setAmount(l.emiAmount);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      let paymentRecord: Payment;

      if (paymentType === 'LOAN_EMI' && loanId && emiScheduleList.length > 0) {
        paymentRecord = await recordEmiPayment({
          loanId,
          emiNumber,
          amount,
          paymentMethod,
          transactionReference: transactionReference || 'REF-' + Date.now().toString().slice(-6),
          paymentDate,
          notes,
        });
      } else {
        paymentRecord = await recordGenericPayment({
          clientId: clientId || selectedLoan?.clientId || '',
          clientName: activeClient?.name || selectedLoan?.clientName || 'Customer',
          loanId: paymentType.startsWith('LOAN') ? loanId : undefined,
          investmentId: paymentType.startsWith('INVESTMENT') ? investmentId : undefined,
          emiNumber: paymentType === 'LOAN_EMI' ? emiNumber : undefined,
          paymentType,
          amount,
          paymentMethod,
          transactionReference: transactionReference || 'REF-' + Date.now().toString().slice(-6),
          paymentDate,
          status: 'COMPLETED',
          notes,
        });
      }

      setIsSubmitting(false);
      setGeneratedPayment(paymentRecord);
      setShowReceipt(true);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showReceipt}
        onClose={onClose}
        title="Record Financial Payment"
        subtitle="Collect EMI installment or record investment/penalty transactions"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Payment Category"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
              options={[
                { value: 'LOAN_EMI', label: 'Loan EMI Collection' },
                { value: 'INVESTMENT_PAYMENT', label: 'Investment Pool Deposit' },
                { value: 'INVESTMENT_RETURN', label: 'Investment Return / Dividend Payout' },
                { value: 'LOAN_DISBURSEMENT', label: 'Loan Disbursement' },
                { value: 'PENALTY', label: 'Late EMI Penalty Collection' },
                { value: 'OTHER', label: 'Other Misc Adjustment' },
              ]}
            />

            {paymentType === 'LOAN_EMI' ? (
              <Select
                label="Select Loan"
                value={loanId}
                onChange={(e) => handleLoanChange(e.target.value)}
                required
              >
                {loans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} — {l.clientName} ({l.status})
                  </option>
                ))}
              </Select>
            ) : (
              <Select
                label="Select Client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </Select>
            )}
          </div>

          {/* If Loan EMI is selected, show EMI selector */}
          {paymentType === 'LOAN_EMI' && selectedLoan && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {emiScheduleList.length > 0 ? (
                <Select
                  label="EMI Installment #"
                  value={emiNumber}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setEmiNumber(num);
                    const item = emiScheduleList.find((s) => s.emiNumber === num);
                    if (item) {
                      setAmount(item.remainingAmount || item.emiAmount);
                    }
                  }}
                >
                  {emiScheduleList.map((s) => (
                    <option key={s.emiNumber} value={s.emiNumber}>
                      EMI #{s.emiNumber} — Due: {s.dueDate} ({s.status})
                    </option>
                  ))}
                </Select>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <span>Loan schedule not generated yet (Status: <strong>{selectedLoan.status}</strong>). Recording payment as generic advance / recovery.</span>
                </div>
              )}

              <Input
                label="Payment Amount (₹)"
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                prefixText="₹"
              />
            </div>
          )}

          {paymentType !== 'LOAN_EMI' && (
            <Input
              label="Payment Amount (₹)"
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              prefixText="₹"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Payment Mode"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              options={[
                { value: 'UPI', label: 'UPI (GPay/PhonePe)' },
                { value: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/RTGS)' },
                { value: 'CHEQUE', label: 'Cheque' },
                { value: 'CASH', label: 'Cash' },
              ]}
            />
            <Input
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
            <Input
              label="Transaction Ref / UTR #"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              placeholder="e.g. UPI-984411"
            />
          </div>

          <Textarea
            label="Notes / Description"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Regular monthly EMI received via GooglePay"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              isLoading={isSubmitting}
              leftIcon={<CreditCard className="w-4 h-4" />}
            >
              Record Payment & Print Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Show Printable Receipt Modal upon saving */}
      {showReceipt && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            onClose();
          }}
          payment={generatedPayment}
        />
      )}
    </>
  );
};
