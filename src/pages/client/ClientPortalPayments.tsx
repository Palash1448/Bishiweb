import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ReceiptModal } from '../../components/payments/ReceiptModal';
import { Payment } from '../../types';
import {
  CreditCard,
  Download,
  Eye,
  FileText,
  Search,
  Printer,
  ShieldCheck,
} from 'lucide-react';

export const ClientPortalPayments: React.FC = () => {
  const { currentClient, user } = useAuth();
  const { clients, payments } = useData();
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const client = useMemo(() => {
    if (currentClient) return currentClient;
    if (user?.clientId) return clients.find((c) => c.id === user.clientId) || null;
    return clients[0] || null;
  }, [currentClient, user, clients]);

  const clientId = client?.id || '';

  const clientPayments = useMemo(
    () => payments.filter((p) => p.clientId === clientId),
    [payments, clientId]
  );

  const filteredPayments = useMemo(() => {
    return clientPayments.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.receiptNumber.toLowerCase().includes(q) ||
        p.paymentType.toLowerCase().includes(q) ||
        p.paymentMethod.toLowerCase().includes(q) ||
        p.transactionReference.toLowerCase().includes(q)
      );
    });
  }, [clientPayments, searchQuery]);

  const totalPaid = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-purple-600" /> Passbook & Payment Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download certified PDF receipts and review all past transactions on your account
          </p>
        </div>

        <div className="p-3 px-4 rounded-2xl bg-white border border-slate-200/80 shadow-fintech text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Volume Recorded</span>
          <strong className="text-lg font-black text-purple-700">{formatCurrency(totalPaid)}</strong>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-fintech">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by receipt #, payment type, reference ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No transaction records found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Payment Category</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4">Reference No.</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{pay.receiptNumber}</td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(pay.paymentDate)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-100 text-[11px]">
                        {pay.paymentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{pay.paymentMethod}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{pay.transactionReference || '—'}</td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(pay)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-all text-xs border border-emerald-200/60"
                      >
                        <Printer className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
      />
    </div>
  );
};
