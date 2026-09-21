import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Payment } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { exportToCsv } from '../services/exportService';
import { RecordPaymentModal } from '../components/payments/RecordPaymentModal';
import { ReceiptModal } from '../components/payments/ReceiptModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/common/EmptyState';
import {
  CreditCard,
  Search,
  Plus,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { payments } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        p.receiptNumber.toLowerCase().includes(query) ||
        p.clientName.toLowerCase().includes(query) ||
        p.clientId.toLowerCase().includes(query) ||
        p.transactionReference.toLowerCase().includes(query) ||
        (p.loanId && p.loanId.toLowerCase().includes(query)) ||
        (p.investmentId && p.investmentId.toLowerCase().includes(query));

      const matchesType = typeFilter === 'ALL' || p.paymentType === typeFilter;
      const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;

      return matchesQuery && matchesType && matchesMethod;
    });
  }, [payments, searchQuery, typeFilter, methodFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleExportCsv = () => {
    exportToCsv('MyBishi_Payments_Ledger', filteredPayments, [
      { key: 'receiptNumber', label: 'Receipt Number' },
      { key: 'clientName', label: 'Client Name' },
      { key: 'clientId', label: 'Client ID' },
      { key: 'paymentType', label: 'Payment Category' },
      { key: 'amount', label: 'Amount (INR)' },
      { key: 'paymentMethod', label: 'Payment Method' },
      { key: 'transactionReference', label: 'Reference / UTR' },
      { key: 'paymentDate', label: 'Payment Date' },
      { key: 'recordedBy', label: 'Recorded By' },
      { key: 'notes', label: 'Notes' },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-emerald-600" /> Payments & Collection Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized register for loan EMIs, bishi pool investments, dividend payouts, and printable receipts
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
            className="bg-emerald-600 hover:bg-emerald-700"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setRecordModalOpen(true)}
          >
            Record Payment
          </Button>
        </div>
      </div>

      {/* Summary Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Collected Receipts</span>
          <h3 className="text-xl font-extrabold text-emerald-700 mt-1">{formatCurrency(totalCollected)}</h3>
          <span className="text-[11px] text-slate-400">{payments.length} Processed Transactions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase">EMI Installments Collected</span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            {payments.filter((p) => p.paymentType === 'LOAN_EMI').length} Payments
          </h3>
          <span className="text-[11px] text-slate-400">Regular & Part Payments</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase">Instant Receipts Issued</span>
          <h3 className="text-xl font-extrabold text-blue-700 mt-1">100% Tax Compliant</h3>
          <span className="text-[11px] text-slate-400">With Stamp & Digital Audit</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-fintech grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search receipt #, client, UTR, loan ID..."
          leftIcon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />

        <Select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Payment Types' },
            { value: 'LOAN_EMI', label: 'Loan EMI Collections' },
            { value: 'INVESTMENT_PAYMENT', label: 'Investment Deposits' },
            { value: 'INVESTMENT_RETURN', label: 'Investment Return Payouts' },
            { value: 'LOAN_DISBURSEMENT', label: 'Loan Disbursements' },
            { value: 'PENALTY', label: 'Late Penalties' },
          ]}
        />

        <Select
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Payment Methods' },
            { value: 'UPI', label: 'UPI' },
            { value: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/RTGS)' },
            { value: 'CHEQUE', label: 'Cheque' },
            { value: 'CASH', label: 'Cash' },
          ]}
        />
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
        {filteredPayments.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-8 h-8" />}
            title="No Payments Found"
            description="Record a new payment or adjust your search filter criteria."
            actionLabel="Record Payment"
            onAction={() => setRecordModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Category / Purpose</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Method & Ref</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Recorded By</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPayments.map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{pmt.receiptNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{pmt.clientName}</span>
                      <span className="text-[11px] text-slate-400">{pmt.clientId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">
                        {pmt.paymentType.replace(/_/g, ' ')}
                      </span>
                      {pmt.loanId && (
                        <span className="text-[10px] text-slate-500">
                          {pmt.loanId} {pmt.emiNumber ? `(EMI #${pmt.emiNumber})` : ''}
                        </span>
                      )}
                      {pmt.investmentId && (
                        <span className="text-[10px] text-slate-500">{pmt.investmentId}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700 text-sm">
                      {formatCurrency(pmt.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-medium block">{pmt.paymentMethod}</span>
                      <span className="text-[10px] font-mono text-slate-400">{pmt.transactionReference}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(pmt.paymentDate)}</td>
                    <td className="py-3.5 px-4 text-slate-500">{pmt.recordedBy}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="xs"
                        variant="outline"
                        leftIcon={<Printer className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedReceiptPayment(pmt)}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredPayments.length > 0 && (
          <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, filteredPayments.length)}</strong> of{' '}
              <strong>{filteredPayments.length}</strong> receipts
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

      <RecordPaymentModal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
      />

      <ReceiptModal
        isOpen={Boolean(selectedReceiptPayment)}
        onClose={() => setSelectedReceiptPayment(null)}
        payment={selectedReceiptPayment}
      />
    </div>
  );
};
