import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Investment, InvestmentStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCsv } from '../services/exportService';
import { CreateInvestmentModal } from '../components/investments/CreateInvestmentModal';
import { InvestmentDetailModal } from '../components/investments/InvestmentDetailModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/common/EmptyState';
import {
  TrendingUp,
  Search,
  Plus,
  Download,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
} from 'lucide-react';

const getInvAmount = (inv: Investment | any): number => {
  return Number(inv?.amount ?? inv?.investedAmount ?? inv?.investmentAmount ?? inv?.principal ?? 0);
};

const getInvExpectedReturn = (inv: Investment | any): number => {
  if (inv?.expectedReturn !== undefined && inv?.expectedReturn !== null) {
    return Number(inv.expectedReturn);
  }
  const amt = getInvAmount(inv);
  const rate = Number(inv?.returnRate || 0);
  const months = Number(inv?.durationMonths || 12);
  return Math.round((amt * rate * months) / 1200);
};

export const InvestmentsPage: React.FC = () => {
  const { investments, plans, updateInvestmentStatus } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredInvestments = useMemo(() => {
    return investments.filter((inv) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        inv.id.toLowerCase().includes(query) ||
        inv.clientName.toLowerCase().includes(query) ||
        inv.clientId.toLowerCase().includes(query) ||
        inv.planName.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchesPlan = planFilter === 'ALL' || inv.planId === planFilter;

      return matchesQuery && matchesStatus && matchesPlan;
    });
  }, [investments, searchQuery, statusFilter, planFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvestments.length / pageSize));
  const paginatedInvestments = filteredInvestments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalCapital = investments.reduce((sum, i) => sum + getInvAmount(i), 0);
  const totalAccruedReturns = investments.reduce((sum, i) => sum + getInvExpectedReturn(i), 0);

  const handleExportCsv = () => {
    exportToCsv('MyBishi_Investments_Export', filteredInvestments, [
      { key: 'id', label: 'Investment ID' },
      { key: 'clientName', label: 'Client Name' },
      { key: 'clientId', label: 'Client ID' },
      { key: 'planName', label: 'Plan Name' },
      { key: 'amount', label: 'Principal (INR)' },
      { key: 'returnRate', label: 'Return Rate (%)' },
      { key: 'durationMonths', label: 'Duration (Months)' },
      { key: 'expectedReturn', label: 'Expected Return (INR)' },
      { key: 'totalPayout', label: 'Total Payout (INR)' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'maturityDate', label: 'Maturity Date' },
      { key: 'status', label: 'Status' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-emerald-600" /> Bishi Investment Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer capital pools, accrued dividend yields, and maturity payouts
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
            onClick={() => setCreateModalOpen(true)}
          >
            Create Investment
          </Button>
        </div>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Subscribed Capital</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalCapital)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ₹
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Projected Returns</span>
            <h3 className="text-xl font-extrabold text-emerald-700 mt-1">+{formatCurrency(totalAccruedReturns)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Active Bishi Portfolios</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {investments.filter((i) => i.status === 'ACTIVE').length} Active
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-fintech grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by client, ID, or plan name..."
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
            { value: 'ALL', label: 'All Investment Statuses' },
            { value: 'ACTIVE', label: 'Active Plans' },
            { value: 'MATURED', label: 'Matured' },
            { value: 'CLOSED', label: 'Closed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
        />

        <Select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">All Bishi Plans</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Investments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
        {filteredInvestments.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="w-8 h-8" />}
            title="No Investments Found"
            description="Create a new Bishi pool subscription for your registered clients."
            actionLabel="Create Investment"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Investment ID</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Bishi Plan</th>
                  <th className="py-3.5 px-4 text-right">Principal</th>
                  <th className="py-3.5 px-4 text-right">Return Rate</th>
                  <th className="py-3.5 px-4 text-right">Expected Return</th>
                  <th className="py-3.5 px-4">Start / Maturity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedInvestments.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvestment(inv)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {inv.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/clients/${inv.clientId}`);
                        }}
                        className="font-bold text-slate-900 hover:text-emerald-700 text-left transition-colors"
                      >
                        {inv.clientName}
                      </button>
                      <span className="block text-[11px] text-slate-400">{inv.clientId}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{inv.planName}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 text-sm">
                      {formatCurrency(getInvAmount(inv))}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                      {inv.returnRate}% p.a.
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-blue-700">
                      +{formatCurrency(getInvExpectedReturn(inv))}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="block">{formatDate(inv.startDate)}</span>
                      <span className="block text-[10px] text-slate-400">Due: {formatDate(inv.maturityDate)}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvestment(inv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="View Details & Popup Cards"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.status === 'ACTIVE' && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => updateInvestmentStatus(inv.id, 'MATURED')}
                          >
                            Mark Matured
                          </Button>
                        )}
                        {inv.status === 'MATURED' && (
                          <Button
                            size="xs"
                            variant="success"
                            onClick={() => updateInvestmentStatus(inv.id, 'CLOSED')}
                          >
                            Close / Payout
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredInvestments.length > 0 && (
          <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, filteredInvestments.length)}</strong> of{' '}
              <strong>{filteredInvestments.length}</strong> investments
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

      <CreateInvestmentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Investment Popup Cards Modal */}
      <InvestmentDetailModal
        isOpen={Boolean(selectedInvestment)}
        onClose={() => setSelectedInvestment(null)}
        investment={selectedInvestment}
      />
    </div>
  );
};

