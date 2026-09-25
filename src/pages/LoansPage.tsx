import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Loan, LoanStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCsv } from '../services/exportService';
import { LoanApplicationModal } from '../components/loans/LoanApplicationModal';
import { LoanApprovalModal } from '../components/loans/LoanApprovalModal';
import { LoanDisbursementModal, LoanRejectionModal } from '../components/loans/LoanDisbursementModal';
import { RecordPaymentModal } from '../components/payments/RecordPaymentModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/common/EmptyState';
import {
  Landmark,
  Search,
  Plus,
  Download,
  Eye,
  CheckCircle2,
  Send,
  CreditCard,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const LoansPage: React.FC = () => {
  const { loans } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedLoanForApproval, setSelectedLoanForApproval] = useState<Loan | null>(null);
  const [selectedLoanForRejection, setSelectedLoanForRejection] = useState<Loan | null>(null);
  const [selectedLoanForDisbursement, setSelectedLoanForDisbursement] = useState<Loan | null>(null);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<string | null>(null);

  // Filter & Search
  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        l.id.toLowerCase().includes(query) ||
        l.clientName.toLowerCase().includes(query) ||
        l.clientId.toLowerCase().includes(query) ||
        l.loanPurpose.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [loans, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLoans.length / pageSize));
  const paginatedLoans = filteredLoans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalSanctioned = loans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount || 0), 0);
  const totalOutstanding = loans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
  const pendingCount = loans.filter((l) => l.status === 'PENDING' || l.status === 'UNDER_REVIEW').length;
  const overdueCount = loans.filter((l) => l.status === 'OVERDUE').length;

  const handleExportCsv = () => {
    exportToCsv('MyBishi_Loans_Export', filteredLoans, [
      { key: 'id', label: 'Loan ID' },
      { key: 'clientName', label: 'Borrower Name' },
      { key: 'clientId', label: 'Client ID' },
      { key: 'requestedAmount', label: 'Requested Amount (INR)' },
      { key: 'approvedAmount', label: 'Approved Amount (INR)' },
      { key: 'interestRate', label: 'Interest Rate (%)' },
      { key: 'tenureMonths', label: 'Tenure (Months)' },
      { key: 'emiAmount', label: 'Monthly EMI (INR)' },
      { key: 'outstandingAmount', label: 'Outstanding Balance (INR)' },
      { key: 'status', label: 'Loan Status' },
      { key: 'applicationDate', label: 'Application Date' },
      { key: 'disbursementDate', label: 'Disbursement Date' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Landmark className="w-7 h-7 text-amber-600" /> Lending & Loan Lifecycle
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage credit applications, underwriting approvals, fund disbursements, and reducing-balance EMI schedules
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-amber-600 hover:bg-amber-700"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setApplyModalOpen(true)}
          >
            New Loan Application
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Sanctioned Loan Book</span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalSanctioned)}</h3>
          <span className="text-[11px] text-slate-400">{loans.length} Total Facilities</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase">Outstanding Balance</span>
          <h3 className="text-xl font-extrabold text-amber-700 mt-1">{formatCurrency(totalOutstanding)}</h3>
          <span className="text-[11px] text-slate-400">Principal + Interest</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase">Pending Applications</span>
          <h3 className="text-xl font-extrabold text-purple-700 mt-1">{pendingCount} Applications</h3>
          <span className="text-[11px] text-slate-400">Requires Admin Action</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase">Overdue Accounts</span>
          <h3 className={`text-xl font-extrabold mt-1 ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {overdueCount} Accounts
          </h3>
          <span className="text-[11px] text-slate-400">{overdueCount > 0 ? 'Late Penalties' : 'Zero Default'}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-fintech grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search borrower name, loan ID (LN-10001), or purpose..."
          leftIcon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />

        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Loan Statuses' },
            { value: 'PENDING', label: 'Pending Application' },
            { value: 'APPROVED', label: 'Approved (Ready to Disburse)' },
            { value: 'ACTIVE', label: 'Active & Servicing' },
            { value: 'OVERDUE', label: 'Overdue Installments' },
            { value: 'CLOSED', label: 'Fully Paid & Closed' },
            { value: 'REJECTED', label: 'Rejected' },
          ]}
        />
      </div>

      {/* Loan Pipeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
        {filteredLoans.length === 0 ? (
          <EmptyState
            icon={<Landmark className="w-8 h-8" />}
            title="No Loans Found"
            description="Create a loan application or adjust your search filter criteria."
            actionLabel="Apply For Loan"
            onAction={() => setApplyModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Loan ID & Borrower</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4 text-right">Sanctioned</th>
                  <th className="py-3.5 px-4 text-right">Rate & Tenure</th>
                  <th className="py-3.5 px-4 text-right">Monthly EMI</th>
                  <th className="py-3.5 px-4 text-right">Outstanding</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/loans/${loan.id}`)}
                  >
                    {/* Loan ID & Borrower */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/clients/${loan.clientId}`);
                        }}
                        className="font-bold text-slate-900 text-sm block hover:text-emerald-700 transition-colors text-left group-hover:underline cursor-pointer"
                        title="Click to view full client details"
                      >
                        {loan.clientName}
                      </button>
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">{loan.id}</span>
                    </td>

                    {/* Purpose */}
                    <td className="py-3.5 px-4 text-slate-700 max-w-[180px] truncate">
                      {loan.loanPurpose}
                    </td>

                    {/* Sanctioned Amount */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                      {formatCurrency(loan.approvedAmount || loan.requestedAmount)}
                    </td>

                    {/* Rate & Tenure */}
                    <td className="py-3.5 px-4 text-right text-slate-700">
                      <strong>{loan.interestRate}%</strong> p.a.
                      <span className="block text-[10px] text-slate-400">{loan.tenureMonths} Months</span>
                    </td>

                    {/* Monthly EMI */}
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                      {loan.emiAmount ? formatCurrency(loan.emiAmount) : '—'}
                    </td>

                    {/* Outstanding */}
                    <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                      {formatCurrency(loan.outstandingAmount)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={loan.status} size="sm" />
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/loans/${loan.id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          title="View Details & Amortization"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Pending -> Approve / Reject */}
                        {loan.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => setSelectedLoanForApproval(loan)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Approve Loan"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedLoanForRejection(loan)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Reject Loan"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Approved -> Disburse */}
                        {loan.status === 'APPROVED' && (
                          <button
                            onClick={() => setSelectedLoanForDisbursement(loan)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Disburse Funds"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {/* Active -> Collect EMI */}
                        {(loan.status === 'ACTIVE' || loan.status === 'OVERDUE') && (
                          <button
                            onClick={() => setSelectedLoanForPayment(loan.id)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Record EMI Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredLoans.length > 0 && (
          <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, filteredLoans.length)}</strong> of{' '}
              <strong>{filteredLoans.length}</strong> loans
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button
                size="xs"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LoanApplicationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />
      <LoanApprovalModal
        isOpen={Boolean(selectedLoanForApproval)}
        onClose={() => setSelectedLoanForApproval(null)}
        loan={selectedLoanForApproval}
      />
      <LoanRejectionModal
        isOpen={Boolean(selectedLoanForRejection)}
        onClose={() => setSelectedLoanForRejection(null)}
        loan={selectedLoanForRejection}
      />
      <LoanDisbursementModal
        isOpen={Boolean(selectedLoanForDisbursement)}
        onClose={() => setSelectedLoanForDisbursement(null)}
        loan={selectedLoanForDisbursement}
      />
      {selectedLoanForPayment && (
        <RecordPaymentModal
          isOpen={Boolean(selectedLoanForPayment)}
          onClose={() => setSelectedLoanForPayment(null)}
          preSelectedLoanId={selectedLoanForPayment}
        />
      )}
    </div>
  );
};
