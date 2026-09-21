import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Client, ClientType, ClientStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCsv } from '../services/exportService';
import { AddClientModal } from '../components/clients/AddClientModal';
import { CreateInvestmentModal } from '../components/investments/CreateInvestmentModal';
import { LoanApplicationModal } from '../components/loans/LoanApplicationModal';
import { RecordPaymentModal } from '../components/payments/RecordPaymentModal';
import { ManageClientCredentialsModal } from '../components/clients/ManageClientCredentialsModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/common/EmptyState';
import {
  Users,
  Search,
  Plus,
  Download,
  Eye,
  TrendingUp,
  Landmark,
  CreditCard,
  Key,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const { clients, deactivateClient } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'invested' | 'loan'>('date');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [selectedClientForInvestment, setSelectedClientForInvestment] = useState<string | null>(null);
  const [selectedClientForLoan, setSelectedClientForLoan] = useState<string | null>(null);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<string | null>(null);
  const [selectedClientForCredentials, setSelectedClientForCredentials] = useState<Client | null>(null);

  // Filter & Search Logic
  const filteredClients = useMemo(() => {
    return clients
      .filter((c) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.city.toLowerCase().includes(query);

        const matchesType = typeFilter === 'ALL' || c.clientType === typeFilter;
        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

        return matchesQuery && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'invested') return (b.totalInvested || 0) - (a.totalInvested || 0);
        if (sortBy === 'loan') return (b.outstandingLoanAmount || 0) - (a.outstandingLoanAmount || 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [clients, searchQuery, typeFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const paginatedClients = filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCsv = () => {
    exportToCsv('MyBishi_Clients_Export', filteredClients, [
      { key: 'id', label: 'Client ID' },
      { key: 'name', label: 'Full Name' },
      { key: 'phone', label: 'Mobile Phone' },
      { key: 'email', label: 'Email' },
      { key: 'clientType', label: 'Client Type' },
      { key: 'city', label: 'City' },
      { key: 'totalInvested', label: 'Total Invested (INR)' },
      { key: 'outstandingLoanAmount', label: 'Outstanding Loan (INR)' },
      { key: 'kycStatus', label: 'KYC Status' },
      { key: 'status', label: 'Account Status' },
      { key: 'createdAt', label: 'Joined Date' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-600" /> Client Management (CRM)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage KYC profiles, investment portfolios, and borrower credit dossiers
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
            onClick={() => setAddClientOpen(true)}
          >
            Register Client
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-fintech grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          placeholder="Search by name, ID, phone, email, city..."
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
            { value: 'ALL', label: 'All Client Types' },
            { value: 'INVESTOR', label: 'Investors Only' },
            { value: 'BORROWER', label: 'Borrowers Only' },
            { value: 'INVESTOR_BORROWER', label: 'Investor + Borrower' },
          ]}
        />

        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'PENDING_VERIFICATION', label: 'Pending Verification' },
            { value: 'INACTIVE', label: 'Inactive' },
          ]}
        />

        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          options={[
            { value: 'date', label: 'Sort: Recently Joined' },
            { value: 'name', label: 'Sort: Name (A-Z)' },
            { value: 'invested', label: 'Sort: Highest Investment' },
            { value: 'loan', label: 'Sort: Highest Loan' },
          ]}
        />
      </div>

      {/* Clients Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
        {filteredClients.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="No Clients Found"
            description="Try adjusting your search criteria or register a new customer."
            actionLabel="Add New Client"
            onAction={() => setAddClientOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Client ID & Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Total Invested</th>
                  <th className="py-3.5 px-4 text-right">Outstanding Loan</th>
                  <th className="py-3.5 px-4">KYC / Status</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    {/* ID & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {client.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block group-hover:text-emerald-700 transition-colors">
                            {client.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">{client.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <p className="font-medium text-slate-900">{client.phone}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{client.email}</p>
                    </td>

                    {/* Client Type */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={client.clientType} size="sm" />
                    </td>

                    {/* Total Invested */}
                    <td className="py-3.5 px-4 text-right">
                      {client.totalInvested > 0 ? (
                        <div>
                          <strong className="text-emerald-700 text-sm block">
                            {formatCurrency(client.totalInvested)}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            {client.activeInvestmentsCount} active plans
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Outstanding Loan */}
                    <td className="py-3.5 px-4 text-right">
                      {client.outstandingLoanAmount > 0 ? (
                        <div>
                          <strong className="text-amber-700 text-sm block">
                            {formatCurrency(client.outstandingLoanAmount)}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            {client.activeLoansCount} active loans
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* KYC & Account Status */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <StatusBadge status={client.kycStatus} size="sm" />
                        <span className="block text-[10px] text-slate-400">
                          {client.status}
                        </span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatDate(client.createdAt)}
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="View 360 Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedClientForCredentials(client)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Manage Portal Login ID & Password"
                        >
                          <Key className="w-4 h-4 text-emerald-600" />
                        </button>
                        <button
                          onClick={() => setSelectedClientForInvestment(client.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Add Investment"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedClientForLoan(client.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          title="New Loan Application"
                        >
                          <Landmark className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedClientForPayment(client.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                          title="Record Payment"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredClients.length > 0 && (
          <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, filteredClients.length)}</strong> of{' '}
              <strong>{filteredClients.length}</strong> clients
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
      <AddClientModal
        isOpen={addClientOpen}
        onClose={() => setAddClientOpen(false)}
      />
      {selectedClientForCredentials && (
        <ManageClientCredentialsModal
          isOpen={Boolean(selectedClientForCredentials)}
          onClose={() => setSelectedClientForCredentials(null)}
          client={selectedClientForCredentials}
        />
      )}
      {selectedClientForInvestment && (
        <CreateInvestmentModal
          isOpen={Boolean(selectedClientForInvestment)}
          onClose={() => setSelectedClientForInvestment(null)}
          preSelectedClientId={selectedClientForInvestment}
        />
      )}
      {selectedClientForLoan && (
        <LoanApplicationModal
          isOpen={Boolean(selectedClientForLoan)}
          onClose={() => setSelectedClientForLoan(null)}
          preSelectedClientId={selectedClientForLoan}
        />
      )}
      {selectedClientForPayment && (
        <RecordPaymentModal
          isOpen={Boolean(selectedClientForPayment)}
          onClose={() => setSelectedClientForPayment(null)}
          preSelectedClientId={selectedClientForPayment}
        />
      )}
    </div>
  );
};
