import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Transaction, TransactionNature } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { exportToCsv } from '../services/exportService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/common/EmptyState';
import {
  Receipt,
  Search,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  ExternalLink,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { transactions } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [natureFilter, setNatureFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        t.id.toLowerCase().includes(query) ||
        t.clientName.toLowerCase().includes(query) ||
        t.referenceNumber.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query);

      const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchesNature = natureFilter === 'ALL' || t.nature === natureFilter;
      const matchesMethod = methodFilter === 'ALL' || t.paymentMethod === methodFilter;

      return matchesQuery && matchesType && matchesNature && matchesMethod;
    });
  }, [transactions, searchQuery, typeFilter, natureFilter, methodFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalCredits = transactions
    .filter((t) => t.nature === 'CREDIT')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalDebits = transactions
    .filter((t) => t.nature === 'DEBIT')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netCashflow = totalCredits - totalDebits;

  const handleExportCsv = () => {
    exportToCsv('MyBishi_Financial_Ledger', filteredTransactions, [
      { key: 'id', label: 'Transaction ID' },
      { key: 'clientName', label: 'Client Name' },
      { key: 'clientId', label: 'Client ID' },
      { key: 'type', label: 'Transaction Type' },
      { key: 'nature', label: 'Entry Nature (Credit/Debit)' },
      { key: 'amount', label: 'Amount (INR)' },
      { key: 'paymentMethod', label: 'Payment Method' },
      { key: 'referenceNumber', label: 'Reference / UTR #' },
      { key: 'description', label: 'Description' },
      { key: 'date', label: 'Transaction Date' },
      { key: 'status', label: 'Status' },
      { key: 'createdBy', label: 'Created By' },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-purple-600" /> Unified Financial Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Master double-entry transaction book across investments, loans, payouts, and collections
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCsv}
        >
          Export Ledger (CSV)
        </Button>
      </div>

      {/* Ledger Balances Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Inflows (Credit)</span>
            <h3 className="text-xl font-extrabold text-emerald-700 mt-1">+{formatCurrency(totalCredits)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Outflows (Debit)</span>
            <h3 className="text-xl font-extrabold text-rose-700 mt-1">-{formatCurrency(totalDebits)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Net Portfolio Cashflow</span>
            <h3 className={`text-xl font-extrabold mt-1 ${netCashflow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {netCashflow >= 0 ? '+' : ''}{formatCurrency(netCashflow)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            ₹
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-fintech grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Input
          placeholder="Search by ID, client, ref #, description..."
          leftIcon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />

        <Select
          value={natureFilter}
          onChange={(e) => {
            setNatureFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Inflow / Outflow' },
            { value: 'CREDIT', label: 'Credits (+ Inflows)' },
            { value: 'DEBIT', label: 'Debits (- Outflows)' },
          ]}
        />

        <Select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Transaction Types' },
            { value: 'INVESTMENT', label: 'Investment Pool Deposits' },
            { value: 'INVESTMENT_RETURN', label: 'Investment Return Payouts' },
            { value: 'LOAN_DISBURSEMENT', label: 'Loan Disbursements' },
            { value: 'LOAN_EMI', label: 'Loan EMI Collections' },
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
            { value: 'ALL', label: 'All Methods' },
            { value: 'UPI', label: 'UPI' },
            { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
            { value: 'CHEQUE', label: 'Cheque' },
            { value: 'CASH', label: 'Cash' },
          ]}
        />
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-8 h-8" />}
            title="No Ledger Entries Found"
            description="Adjust your search or filter options to view ledger records."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Txn ID</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Entry</th>
                  <th className="py-3.5 px-4">Method & Ref</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransactions.map((txn) => {
                  const isCredit = txn.nature === 'CREDIT';
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{txn.id}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => txn.clientId && navigate(`/clients/${txn.clientId}`)}
                          className="font-bold text-slate-900 hover:text-emerald-700 text-left transition-colors flex items-center gap-1 group cursor-pointer"
                          title="Click to view full client details"
                        >
                          <span className="group-hover:underline">{txn.clientName}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
                        </button>
                        <span className="text-[11px] text-slate-400">{txn.clientId}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 max-w-xs">{txn.description}</td>
                      <td
                        className={`py-3.5 px-4 text-right font-extrabold text-sm ${
                          isCredit ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={txn.nature} size="sm" dot={false} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-medium block">{txn.paymentMethod}</span>
                        <span className="text-[10px] font-mono text-slate-400">{txn.referenceNumber}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(txn.date)}</td>
                      <td className="py-3.5 px-4 text-slate-500">{txn.createdBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, filteredTransactions.length)}</strong> of{' '}
              <strong>{filteredTransactions.length}</strong> transactions
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
    </div>
  );
};
