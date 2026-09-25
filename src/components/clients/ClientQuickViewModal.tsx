import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Client } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  ShieldCheck,
  CreditCard,
  Key,
  ExternalLink,
  FileText,
  TrendingUp,
  Landmark,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface ClientQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string | null;
  client?: Client | null;
  onRecordPayment?: (clientId: string) => void;
}

export const ClientQuickViewModal: React.FC<ClientQuickViewModalProps> = ({
  isOpen,
  onClose,
  clientId,
  client: directClient,
  onRecordPayment,
}) => {
  const navigate = useNavigate();
  const { clients, investments, loans, payments } = useData();
  const [copiedKey, setCopiedKey] = React.useState(false);

  // Find target client
  const client = React.useMemo(() => {
    if (directClient) return directClient;
    if (clientId) return clients.find((c) => c.id === clientId) || null;
    return null;
  }, [clients, clientId, directClient]);

  const clientInvestments = React.useMemo(
    () => (client ? investments.filter((i) => i.clientId === client.id) : []),
    [investments, client]
  );
  const clientLoans = React.useMemo(
    () => (client ? loans.filter((l) => l.clientId === client.id) : []),
    [loans, client]
  );
  const clientPayments = React.useMemo(
    () => (client ? payments.filter((p) => p.clientId === client.id) : []),
    [payments, client]
  );

  if (!client) return null;

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(client.password || 'client123');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleOpenFullProfile = () => {
    onClose();
    navigate(`/clients/${client.id}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${client.name} — Full Dossier Details`}
      subtitle={`Member ID: ${client.memberNumber || client.id} • ${client.bishiGroupName || 'Sai Bhishi Mandale'}`}
      maxWidth="4xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Top Header Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-fintech-navy-900 to-slate-900 text-white shadow-fintech relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
                {client.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-white">{client.name}</h2>
                  {client.memberNumber && (
                    <span className="text-xs font-mono font-bold bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                      Member #{client.memberNumber}
                    </span>
                  )}
                  <StatusBadge status={client.clientType} size="sm" />
                  <StatusBadge status={client.status} size="sm" />
                </div>
                <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> {client.phone || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" /> {client.email || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {client.city}, {client.state}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={handleOpenFullProfile}
              >
                Open 360° Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Bhishi Installment & Financial KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Hfta (AMT)</span>
            <strong className="text-base font-black text-emerald-700 mt-0.5 block">
              {client.monthlyInstallment ? formatCurrency(client.monthlyInstallment) : '—'}
            </strong>
            <span className="text-[10px] text-slate-400">Monthly Target</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Months Paid</span>
            <strong className="text-base font-extrabold text-slate-900 mt-0.5 block">
              {client.monthsPaid || 0} / {client.totalMonths || 12}
            </strong>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {Math.round(((client.monthsPaid || 0) / (client.totalMonths || 12)) * 100)}% Completed
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Paid (जमा)</span>
            <strong className="text-base font-black text-emerald-700 mt-0.5 block">
              {client.totalPaid ? formatCurrency(client.totalPaid) : '—'}
            </strong>
            <span className="text-[10px] text-slate-400">Collected to date</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Balance (शिल्लक)</span>
            <strong className="text-base font-black text-amber-700 mt-0.5 block">
              {client.balanceAmount !== undefined ? formatCurrency(client.balanceAmount) : '—'}
            </strong>
            <span className="text-[10px] text-slate-400">Remaining due</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Investments</span>
            <strong className="text-base font-extrabold text-slate-900 mt-0.5 block">
              {formatCurrency(client.totalInvested || 0)}
            </strong>
            <span className="text-[10px] text-slate-400">{clientInvestments.length} Active Plans</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Loan Balance</span>
            <strong className={`text-base font-extrabold mt-0.5 block ${(client.outstandingLoanAmount || 0) > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
              {formatCurrency(client.outstandingLoanAmount || 0)}
            </strong>
            <span className="text-[10px] text-slate-400">{clientLoans.length} Loans</span>
          </div>
        </div>

        {/* Month-by-Month Passbook Table (If imported from Excel) */}
        {client.monthlyLedger && client.monthlyLedger.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Month-by-Month Passbook (मासिक हप्ता पत्रक)
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                {client.bishiGroupName || 'Sai Bhishi Mandale'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3"># Period</th>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3 text-right">Target Hfta</th>
                    <th className="py-2.5 px-3 text-right">Amount Paid</th>
                    <th className="py-2.5 px-3">Payment Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Splits / Partial Payments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {client.monthlyLedger.map((entry) => {
                    const isPaid = entry.status === 'PAID' || entry.amountPaid >= entry.amountDue;
                    const isPartial =
                      entry.status === 'PARTIALLY_PAID' ||
                      (entry.amountPaid > 0 && entry.amountPaid < entry.amountDue);

                    return (
                      <tr
                        key={entry.monthIndex}
                        className={isPaid ? 'bg-emerald-50/20' : isPartial ? 'bg-amber-50/20' : ''}
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-500">
                          Month {entry.monthIndex}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-800">{entry.monthName}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {formatCurrency(entry.amountDue || client.monthlyInstallment || 0)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                          {entry.amountPaid > 0 ? formatCurrency(entry.amountPaid) : '—'}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-700">
                          {entry.paymentDate ? formatDate(entry.paymentDate) : '—'}
                        </td>
                        <td className="py-2 px-3">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              ✓ Paid
                            </span>
                          ) : isPartial ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                              Partial
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              Due
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-500">
                          {entry.splits && entry.splits.length > 1 ? (
                            <div className="flex flex-wrap gap-1">
                              {entry.splits.map((s, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="inline-block bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-mono"
                                >
                                  ₹{s.amount.toLocaleString()} ({s.date ? formatDate(s.date) : '—'})
                                </span>
                              ))}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Personal, KYC, Banking & Custom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal & Residence */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <User className="w-3.5 h-3.5 text-blue-600" /> Personal & Residence Details
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name:</span>
                <strong className="text-slate-900">{client.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mobile Phone:</span>
                <strong className="text-slate-900">{client.phone || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email:</span>
                <strong className="text-slate-900 truncate block">{client.email || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date of Birth & Gender:</span>
                <strong className="text-slate-900">
                  {formatDate(client.dateOfBirth)} ({client.gender})
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Occupation:</span>
                <strong className="text-slate-900">{client.occupation || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Monthly Income:</span>
                <strong className="text-emerald-700">{formatCurrency(client.monthlyIncome)}/mo</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Full Address:</span>
                <strong className="text-slate-900">
                  {client.address}, {client.city}, {client.state} - {client.pinCode}
                </strong>
              </div>
            </div>
          </div>

          {/* Banking & Government KYC */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Banking & KYC Identification
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Aadhaar Number:</span>
                <strong className="font-mono text-slate-900">{client.aadhaarNumber || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">PAN Card Number:</span>
                <strong className="font-mono text-slate-900">{client.panNumber || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Bank Name:</span>
                <strong className="text-slate-900">{client.bankName || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Account Number:</span>
                <strong className="font-mono text-slate-900">{client.accountNumber || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">IFSC Code:</span>
                <strong className="font-mono text-slate-900">{client.ifscCode || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nominee Name:</span>
                <strong className="text-slate-900">{client.nomineeName || '—'}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Nominee Relationship & Phone:</span>
                <strong className="text-slate-900">
                  {client.nomineeRelationship || '—'} ({client.nomineePhone || '—'})
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Excel Attributes (if any) */}
        {client.customFields && Object.keys(client.customFields).length > 0 && (
          <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100 space-y-2.5 text-xs">
            <h4 className="font-bold text-indigo-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-indigo-200/60">
              <FileText className="w-3.5 h-3.5 text-indigo-600" /> Additional Spreadsheet Attributes
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(client.customFields).map(([k, v]) => (
                <div key={k} className="p-2.5 rounded-xl bg-white border border-indigo-100">
                  <span className="text-slate-500 block truncate text-[10px]" title={k}>
                    {k}:
                  </span>
                  <strong className="text-slate-900 block truncate font-mono text-xs" title={String(v)}>
                    {String(v) || '—'}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portal Login Credentials Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Client Portal Access
              </span>
              <p className="font-mono text-xs font-bold text-slate-200">
                User: <span className="text-emerald-400">{client.loginId || client.phone || client.id}</span> •
                Pass: <span className="text-amber-300 font-mono">{client.password || 'client123'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPassword}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy Login Details'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {onRecordPayment && (
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                leftIcon={<CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={() => {
                  onClose();
                  onRecordPayment(client.id);
                }}
              >
                Record Payment
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={handleOpenFullProfile}
            >
              View Full 360° Profile
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
