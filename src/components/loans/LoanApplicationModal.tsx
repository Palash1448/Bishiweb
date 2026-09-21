import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select, Textarea } from '../ui/Select';
import { Button } from '../ui/Button';
import { useData } from '../../context/DataContext';
import { calculateEmi } from '../../services/financialCalculations';
import { formatCurrency } from '../../utils/formatters';
import { Landmark, Calculator, UserCheck } from 'lucide-react';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedClientId?: string;
}

export const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({
  isOpen,
  onClose,
  preSelectedClientId,
}) => {
  const { clients, createLoanApplication, settings } = useData();

  const [clientId, setClientId] = useState(preSelectedClientId || clients[0]?.id || '');
  const [requestedAmount, setRequestedAmount] = useState<number>(200000);
  const [loanPurpose, setLoanPurpose] = useState('Business Expansion & Working Capital');
  const [tenureMonths, setTenureMonths] = useState<number>(24);
  const [interestRate, setInterestRate] = useState<number>(settings.defaultInterestRate || 14.0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(120000);
  const [existingLiabilities, setExistingLiabilities] = useState<number>(10000);
  
  // Bank details
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('50100458921478');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');

  // Guarantor
  const [guarantorName, setGuarantorName] = useState('Santosh Kadam');
  const [guarantorPhone, setGuarantorPhone] = useState('+91 98220 99881');
  const [guarantorRelationship, setGuarantorRelationship] = useState('Colleague / Friend');
  const [guarantorAddress, setGuarantorAddress] = useState('Pune, Maharashtra');
  const [guarantorOccupation, setGuarantorOccupation] = useState('Business Manager');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync client bank details if selected
  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    const client = clients.find((c) => c.id === newClientId);
    if (client) {
      if (client.bankName) setBankName(client.bankName);
      if (client.accountNumber) setAccountNumber(client.accountNumber);
      if (client.ifscCode) setIfscCode(client.ifscCode);
      if (client.monthlyIncome) setMonthlyIncome(client.monthlyIncome);
    }
  };

  // Live EMI projection
  const estimatedEmi = useMemo(() => {
    return calculateEmi(requestedAmount, interestRate, tenureMonths);
  }, [requestedAmount, interestRate, tenureMonths]);

  const totalPayableEstimate = estimatedEmi * tenureMonths;
  const totalInterestEstimate = totalPayableEstimate - requestedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !requestedAmount || requestedAmount <= 0) {
      alert('Please fill all required fields with a valid loan amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createLoanApplication({
        clientId,
        requestedAmount,
        loanPurpose,
        tenureMonths,
        interestRate,
        monthlyIncome,
        existingLiabilities,
        bankName,
        accountNumber,
        ifscCode,
        guarantor: {
          name: guarantorName,
          phone: guarantorPhone,
          relationship: guarantorRelationship,
          address: guarantorAddress,
          occupation: guarantorOccupation,
        },
      });
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
      title="New Loan Application"
      subtitle="Submit a borrower loan application for verification and admin approval"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Borrower & Loan Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-amber-500" /> Borrower & Loan Terms
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Client"
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              required
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) — {c.phone}
                </option>
              ))}
            </Select>

            <Input
              label="Loan Purpose"
              required
              placeholder="e.g. Home Renovation, Inventory, Medical"
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
            />

            <Input
              label="Requested Principal Amount (₹)"
              type="number"
              required
              min={5000}
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(Number(e.target.value))}
              prefixText="₹"
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Tenure (Months)"
                type="number"
                required
                min={1}
                max={120}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
              />
              <Input
                label="Interest Rate (% p.a.)"
                type="number"
                step="0.1"
                required
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Live EMI Estimate Banner */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Estimated Monthly EMI</p>
              <p className="text-xl font-extrabold text-amber-400">{formatCurrency(estimatedEmi)}/mo</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block">Total Interest:</span>
              <strong className="text-white font-semibold">+{formatCurrency(totalInterestEstimate)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Total Payable:</span>
              <strong className="text-white font-semibold">{formatCurrency(totalPayableEstimate)}</strong>
            </div>
          </div>
        </div>

        {/* Financials & Bank Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financials & Disbursement Bank</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Monthly Income (₹)"
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            />
            <Input
              label="Existing Monthly Liabilities (₹)"
              type="number"
              value={existingLiabilities}
              onChange={(e) => setExistingLiabilities(Number(e.target.value))}
            />
            <Input
              label="Disbursement Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
              <Input
                label="IFSC Code"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              />
            </div>
          </div>
        </div>

        {/* Guarantor Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Guarantor / Co-Signer Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Guarantor Name"
              required
              placeholder="e.g. Santosh Kadam"
              value={guarantorName}
              onChange={(e) => setGuarantorName(e.target.value)}
            />
            <Input
              label="Guarantor Mobile"
              required
              placeholder="e.g. +91 98220 99881"
              value={guarantorPhone}
              onChange={(e) => setGuarantorPhone(e.target.value)}
            />
            <Input
              label="Relationship"
              placeholder="e.g. Colleague / Brother"
              value={guarantorRelationship}
              onChange={(e) => setGuarantorRelationship(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            Submit Loan Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};
