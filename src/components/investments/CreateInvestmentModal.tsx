import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select, Textarea } from '../ui/Select';
import { Button } from '../ui/Button';
import { useData } from '../../context/DataContext';
import { calculateInvestmentReturn } from '../../services/financialCalculations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PaymentMethod } from '../../types';
import { TrendingUp, Calculator, CheckCircle2, ArrowRight } from 'lucide-react';

interface CreateInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedClientId?: string;
}

export const CreateInvestmentModal: React.FC<CreateInvestmentModalProps> = ({
  isOpen,
  onClose,
  preSelectedClientId,
}) => {
  const { clients, plans, createInvestment } = useData();

  const [step, setStep] = useState<1 | 2>(1);
  const [clientId, setClientId] = useState(preSelectedClientId || clients[0]?.id || '');
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [amount, setAmount] = useState<number>(50000);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionReference, setTransactionReference] = useState('UPI-' + Math.floor(100000 + Math.random() * 900000));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected entities
  const selectedClient = useMemo(() => clients.find((c) => c.id === clientId), [clients, clientId]);
  const selectedPlan = useMemo(() => plans.find((p) => p.id === planId), [plans, planId]);

  // Calculations
  const calc = useMemo(() => {
    if (!selectedPlan) return { expectedReturn: 0, totalPayout: 0, payoutPerCycle: 0, maturityDate: '' };
    const { expectedReturn, totalPayout, payoutPerCycle } = calculateInvestmentReturn(
      amount,
      selectedPlan.returnRate,
      selectedPlan.durationMonths,
      selectedPlan.paymentFrequency
    );
    const start = new Date(startDate || new Date());
    start.setMonth(start.getMonth() + selectedPlan.durationMonths);
    const maturityDate = start.toISOString().split('T')[0];

    return { expectedReturn, totalPayout, payoutPerCycle, maturityDate };
  }, [amount, selectedPlan, startDate]);

  const handleCreate = async () => {
    if (!clientId || !planId || !amount || amount <= 0) {
      alert('Please fill all required fields with valid amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createInvestment({
        clientId,
        planId,
        amount,
        startDate,
        paymentMethod,
        transactionReference: transactionReference || 'REF-' + Date.now().toString().slice(-6),
        notes,
      });
      setIsSubmitting(false);
      onClose();
      setStep(1);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Bishi Investment"
      subtitle="Subscribe a client to a high-yield Bishi financial pool plan"
      maxWidth="2xl"
    >
      {step === 1 ? (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Step 1: Selection & Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) — {c.phone}
                </option>
              ))}
            </Select>

            <Select
              label="Investment Plan"
              value={planId}
              onChange={(e) => {
                setPlanId(e.target.value);
                const p = plans.find((pl) => pl.id === e.target.value);
                if (p && amount < p.minAmount) {
                  setAmount(p.minAmount);
                }
              }}
              required
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.returnRate}% p.a. • {p.durationMonths}m)
                </option>
              ))}
            </Select>
          </div>

          {/* Plan Info Tag */}
          {selectedPlan && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{selectedPlan.name}: </span>
                <span>{selectedPlan.description} </span>
                <span className="font-semibold block mt-1">
                  Limits: {formatCurrency(selectedPlan.minAmount)} – {formatCurrency(selectedPlan.maxAmount)} | Tenure: {selectedPlan.durationMonths} Months | Payout: {selectedPlan.paymentFrequency}
                </span>
              </div>
            </div>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Investment Amount (₹)"
              type="number"
              required
              min={selectedPlan?.minAmount || 1000}
              max={selectedPlan?.maxAmount || 10000000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              prefixText="₹"
            />
            <Input
              label="Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Payment Method & Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              options={[
                { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
                { value: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT / RTGS / IMPS)' },
                { value: 'CHEQUE', label: 'Cheque Deposit' },
                { value: 'CASH', label: 'Cash Receipt' },
              ]}
            />
            <Input
              label="Transaction / Reference Number"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              placeholder="e.g. UPI-98451234 or CHQ-001245"
            />
          </div>

          {/* Real-time Calculation Preview Card */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-fintech space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" /> Live ROI Projections
              </span>
              <span className="text-xs text-slate-400">
                Maturity Date: <strong className="text-white">{formatDate(calc.maturityDate)}</strong>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div>
                <p className="text-[11px] text-slate-400">Principal</p>
                <p className="text-base font-bold text-white">{formatCurrency(amount)}</p>
              </div>
              <div>
                <p className="text-[11px] text-emerald-400">Expected Profit</p>
                <p className="text-base font-bold text-emerald-400">+{formatCurrency(calc.expectedReturn)}</p>
              </div>
              <div>
                <p className="text-[11px] text-blue-400">Total Payout</p>
                <p className="text-base font-bold text-blue-400">{formatCurrency(calc.totalPayout)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => setStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Review Investment
            </Button>
          </div>
        </div>
      ) : (
        /* Step 2: Confirmation Summary */
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Confirm Investment Details</span>
            </div>
            <div className="grid grid-cols-2 gap-y-2.5 text-xs">
              <div>
                <span className="text-slate-500 block">Client:</span>
                <strong className="text-slate-900 text-sm">{selectedClient?.name} ({selectedClient?.id})</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Plan:</span>
                <strong className="text-slate-900 text-sm">{selectedPlan?.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Invested Amount:</span>
                <strong className="text-emerald-700 text-sm">{formatCurrency(amount)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Return Rate:</span>
                <strong className="text-slate-900">{selectedPlan?.returnRate}% Annual</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Start Date:</span>
                <strong className="text-slate-900">{formatDate(startDate)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Maturity Date:</span>
                <strong className="text-slate-900">{formatDate(calc.maturityDate)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Method & Ref:</span>
                <strong className="text-slate-900">{paymentMethod} ({transactionReference})</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Expected Total Payout:</span>
                <strong className="text-blue-700 text-sm">{formatCurrency(calc.totalPayout)}</strong>
              </div>
            </div>
          </div>

          <Textarea
            label="Internal Notes / Remarks (Optional)"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Direct transfer received in Axis Bank account."
          />

          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
              ← Edit Details
            </Button>
            <Button
              variant="success"
              size="md"
              onClick={handleCreate}
              isLoading={isSubmitting}
            >
              Confirm & Activate Investment
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
