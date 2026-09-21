import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDateTime } from '../utils/formatters';
import { exportToCsv } from '../services/exportService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import {
  History,
  Search,
  Download,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        log.id.toLowerCase().includes(query) ||
        log.userName.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.recordId.toLowerCase().includes(query) ||
        (log.newValue && String(log.newValue).toLowerCase().includes(query));

      const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
      return matchesQuery && matchesModule;
    });
  }, [auditLogs, searchQuery, moduleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCsv = () => {
    exportToCsv('MyBishi_Audit_Trail_Report', filteredLogs, [
      { key: 'id', label: 'Log ID' },
      { key: 'userName', label: 'Admin User' },
      { key: 'userRole', label: 'Role' },
      { key: 'module', label: 'Module' },
      { key: 'action', label: 'Action Type' },
      { key: 'recordId', label: 'Target Record ID' },
      { key: 'newValue', label: 'Modification Details' },
      { key: 'timestamp', label: 'Timestamp' },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-purple-600" /> Compliance Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all financial disbursements, loan approvals, customer edits, and system actions
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCsv}
        >
          Export Audit Trail (CSV)
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-fintech grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search actor, action, record ID, or details..."
          leftIcon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />

        <Select
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Modules' },
            { value: 'LOANS', label: 'Loans & Underwriting' },
            { value: 'INVESTMENTS', label: 'Investments & Plans' },
            { value: 'CLIENTS', label: 'Clients & KYC' },
            { value: 'PAYMENTS', label: 'Payments & Collections' },
            { value: 'TRANSACTIONS', label: 'Transactions & Ledger' },
            { value: 'SETTINGS', label: 'System Settings' },
          ]}
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Log ID</th>
                <th className="py-3.5 px-4">Admin Actor</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Record ID</th>
                <th className="py-3.5 px-4">Modification Details</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{log.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{log.userName}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={log.userRole} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{log.module}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-800">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">{log.recordId}</td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                    {typeof log.newValue === 'object' ? JSON.stringify(log.newValue) : String(log.newValue || '—')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDateTime(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, filteredLogs.length)}</strong> of{' '}
              <strong>{filteredLogs.length}</strong> log entries
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
