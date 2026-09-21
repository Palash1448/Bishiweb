import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { LoanApprovalModal } from '../components/loans/LoanApprovalModal';
import { LoanDisbursementModal, LoanRejectionModal } from '../components/loans/LoanDisbursementModal';
import { RecordPaymentModal } from '../components/payments/RecordPaymentModal';
import {
  Landmark,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  CreditCard,
  UserCheck,
  Building2,
  Calendar,
  AlertCircle,
  Download,
  Receipt,
  FileCheck,
} from 'lucide-react';

export const LoanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loans } = useData();

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [disbursementModalOpen, setDisbursementModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedEmiNumber, setSelectedEmiNumber] = useState<number | undefined>(undefined);

  const loan = useMemo(() => loans.find((l) => l.id === id), [loans, id]);

  if (!loan) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Loan Record Not Found</h2>
        <p className="text-xs text-slate-500">The loan account {id} could not be located.</p>
        <Button onClick={() => navigate('/loans')}>Back to Loans</Button>
      </div>
    );
  }

  const principal = loan.approvedAmount || loan.requestedAmount;
  const emiList = loan.emiSchedule || [];
  const paidEmis = emiList.filter((e) => e.status === 'PAID').length;

  const handlePayEmi = (emiNum: number) => {
    setSelectedEmiNumber(emiNum);
    setPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          onClick={() => navigate('/loans')}
        >
          Back to Loans
        </Button>
      </div>

      {/* Header Summary Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 text-xl font-extrabold flex items-center justify-center shadow-sm border border-amber-200 shrink-0">
              <Landmark className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  Loan Account {loan.id}
                </h1>
                <StatusBadge status={loan.status} size="sm" />
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Borrower:{' '}
                <Link
                  to={`/clients/${loan.clientId}`}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  {loan.clientName} ({loan.clientId})
                </Link>{' '}
                • Purpose: <span className="text-slate-800">{loan.loanPurpose}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Applied on: {formatDate(loan.applicationDate)}
                {loan.disbursementDate && ` • Disbursed on: ${formatDate(loan.disbursementDate)}`}
              </p>
            </div>
          </div>

          {/* Workflow Action Triggers */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {loan.status === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  variant="success"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => setApprovalModalOpen(true)}
                >
                  Approve Loan
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<XCircle className="w-4 h-4" />}
                  onClick={() => setRejectionModalOpen(true)}
                >
                  Reject Application
                </Button>
              </>
            )}

            {loan.status === 'APPROVED' && (
              <Button
                size="sm"
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => setDisbursementModalOpen(true)}
              >
                Disburse Funds Now
              </Button>
            )}

            {(loan.status === 'ACTIVE' || loan.status === 'OVERDUE') && (
              <Button
                size="sm"
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700"
                leftIcon={<CreditCard className="w-4 h-4" />}
                onClick={() => {
                  setSelectedEmiNumber(undefined);
                  setPaymentModalOpen(true);
                }}
              >
                Record EMI Payment
              </Button>
            )}
          </div>
        </div>

        {/* Workflow Lifecycle Step Tracker */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs overflow-x-auto pb-2 no-scrollbar">
            <div className="flex items-center gap-2 text-emerald-700 font-bold shrink-0">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">1</div>
              <span>1. Application Submitted</span>
            </div>
            <div className="w-12 h-0.5 bg-emerald-300 shrink-0 mx-2" />
            <div className={`flex items-center gap-2 shrink-0 ${loan.status !== 'PENDING' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${loan.status !== 'PENDING' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>2</div>
              <span>2. Underwriting Review</span>
            </div>
            <div className={`w-12 h-0.5 shrink-0 mx-2 ${loan.status !== 'PENDING' ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-2 shrink-0 ${loan.status === 'APPROVED' || loan.status === 'ACTIVE' || loan.status === 'OVERDUE' || loan.status === 'CLOSED' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${loan.status === 'APPROVED' || loan.status === 'ACTIVE' || loan.status === 'OVERDUE' || loan.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>3</div>
              <span>3. Sanction & Approved</span>
            </div>
            <div className={`w-12 h-0.5 shrink-0 mx-2 ${loan.status === 'ACTIVE' || loan.status === 'OVERDUE' || loan.status === 'CLOSED' ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-2 shrink-0 ${loan.status === 'ACTIVE' || loan.status === 'OVERDUE' || loan.status === 'CLOSED' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${loan.status === 'ACTIVE' || loan.status === 'OVERDUE' || loan.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>4</div>
              <span>4. Disbursed & Active</span>
            </div>
            <div className={`w-12 h-0.5 shrink-0 mx-2 ${loan.status === 'CLOSED' ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-2 shrink-0 ${loan.status === 'CLOSED' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${loan.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>5</div>
              <span>5. Loan Closed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Principal Amount</span>
          <strong className="text-lg font-extrabold text-slate-900 mt-1 block">
            {formatCurrency(principal)}
          </strong>
          <span className="text-[10px] text-slate-400">{loan.tenureMonths} Months @ {loan.interestRate}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Monthly EMI</span>
          <strong className="text-lg font-extrabold text-emerald-700 mt-1 block">
            {loan.emiAmount ? formatCurrency(loan.emiAmount) : '—'}
          </strong>
          <span className="text-[10px] text-slate-400">Reducing Balance</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Payable</span>
          <strong className="text-lg font-extrabold text-slate-900 mt-1 block">
            {formatCurrency(loan.totalPayable || principal)}
          </strong>
          <span className="text-[10px] text-slate-400">Principal + Total Interest</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Paid So Far</span>
          <strong className="text-lg font-extrabold text-emerald-700 mt-1 block">
            {formatCurrency(loan.amountPaid)}
          </strong>
          <span className="text-[10px] text-slate-400">{paidEmis} of {emiList.length || loan.tenureMonths} EMIs Paid</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Balance</span>
          <strong className="text-lg font-extrabold text-amber-700 mt-1 block">
            {formatCurrency(loan.outstandingAmount)}
          </strong>
          <span className="text-[10px] text-slate-400">Remaining to be recovered</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Overdue Amount</span>
          <strong className={`text-lg font-extrabold mt-1 block ${loan.overdueAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {formatCurrency(loan.overdueAmount)}
          </strong>
          <span className="text-[10px] text-slate-400">{loan.overdueAmount > 0 ? 'Action Required' : 'On Track'}</span>
        </div>
      </div>

      {/* Guarantor & Disbursement Banking Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-500" /> Guarantor / Co-Signer Details
          </h3>
          <div className="grid grid-cols-2 gap-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block">Guarantor Name:</span>
              <strong className="text-slate-900">{loan.guarantor?.name || '—'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Relationship:</span>
              <strong className="text-slate-900">{loan.guarantor?.relationship || '—'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Mobile Phone:</span>
              <strong className="text-slate-900">{loan.guarantor?.phone || '—'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Occupation / Address:</span>
              <strong className="text-slate-900">{loan.guarantor?.address || '—'}</strong>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-500" /> Disbursement Bank Account
          </h3>
          <div className="grid grid-cols-2 gap-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block">Bank Name:</span>
              <strong className="text-slate-900">{loan.bankName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">IFSC Code:</span>
              <strong className="font-mono text-slate-900">{loan.ifscCode}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Account Number:</span>
              <strong className="font-mono text-slate-900">{loan.accountNumber}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Disbursement UTR / Ref:</span>
              <strong className="font-mono text-emerald-700">{loan.disbursementRef || 'Pending'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Reducing-Balance EMI Amortization Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Reducing-Balance EMI Amortization Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Monthly breakdown calculated via standard reducing balance formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
            </p>
          </div>
          {emiList.length > 0 && (
            <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200">
              {paidEmis} / {emiList.length} Installments Paid
            </span>
          )}
        </div>

        {emiList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
            <p className="text-sm font-bold text-slate-700">EMI Schedule Not Generated Yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Once the loan is approved and disbursed by an administrator, the complete reducing-balance amortization schedule will be automatically created.
            </p>
            {loan.status === 'APPROVED' && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setDisbursementModalOpen(true)}
              >
                Disburse Loan to Generate Schedule
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">#</th>
                  <th className="py-3 px-3.5">Due Date</th>
                  <th className="py-3 px-3.5 text-right">Principal</th>
                  <th className="py-3 px-3.5 text-right">Interest</th>
                  <th className="py-3 px-3.5 text-right">Total EMI</th>
                  <th className="py-3 px-3.5 text-right">Paid Amount</th>
                  <th className="py-3 px-3.5 text-right">Balance</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emiList.map((item) => (
                  <tr
                    key={item.emiNumber}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.status === 'OVERDUE'
                        ? 'bg-rose-50/40'
                        : item.status === 'DUE'
                        ? 'bg-amber-50/40'
                        : item.status === 'PAID'
                        ? 'bg-emerald-50/20'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-3.5 font-bold text-slate-700">#{item.emiNumber}</td>
                    <td className="py-3 px-3.5 font-medium text-slate-900">{formatDate(item.dueDate)}</td>
                    <td className="py-3 px-3.5 text-right font-medium text-slate-800">
                      {formatCurrency(item.principal)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-medium text-slate-500">
                      {formatCurrency(item.interest)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-extrabold text-slate-900 text-sm">
                      {formatCurrency(item.emiAmount)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-semibold text-emerald-700">
                      {formatCurrency(item.paidAmount)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-medium text-slate-600">
                      {formatCurrency(item.remainingAmount)}
                    </td>
                    <td className="py-3 px-3.5">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      {item.status !== 'PAID' ? (
                        <Button
                          size="xs"
                          variant="outline"
                          className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                          onClick={() => handlePayEmi(item.emiNumber)}
                        >
                          Collect EMI
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <LoanApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        loan={loan}
      />
      <LoanRejectionModal
        isOpen={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        loan={loan}
      />
      <LoanDisbursementModal
        isOpen={disbursementModalOpen}
        onClose={() => setDisbursementModalOpen(false)}
        loan={loan}
      />
      <RecordPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        preSelectedLoanId={loan.id}
        preSelectedEmiNumber={selectedEmiNumber}
        preSelectedClientId={loan.clientId}
      />
    </div>
  );
};
