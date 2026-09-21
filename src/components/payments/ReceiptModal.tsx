import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Payment } from '../../types';
import { formatCurrency, formatDate, formatDateTime, numberToWordsRupees } from '../../utils/formatters';
import { useData } from '../../context/DataContext';
import { Printer, Download, CheckCircle, Sparkles } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, payment }) => {
  const { settings } = useData();

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Payment Receipt"
      subtitle={`Receipt #${payment.receiptNumber}`}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Print Receipt
            </Button>
          </div>
        </div>
      }
    >
      {/* Printable Receipt Container */}
      <div id="printable-receipt" className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none space-y-6">
        {/* Receipt Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <img
                src={settings.logoUrl || '/logo.png'}
                alt={settings.businessName || 'साई बीशी मंडळ मिरज'}
                className="w-10 h-10 rounded-full object-cover bg-white p-0.5 border border-amber-400/50 shadow-xs shrink-0"
              />
              <h2 className="text-base font-extrabold text-slate-900 tracking-wide">
                {settings.businessName || 'साई बीशी मंडळ मिरज'}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs">{settings.address}, {settings.city}, {settings.state} - {settings.pinCode}</p>
            <p className="text-[11px] text-slate-500">GSTIN: {settings.gstNumber || '27AABCU9603R1ZM'} | PAN: {settings.panNumber || 'AABCU9603R'}</p>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
              PAYMENT ACKNOWLEDGEMENT
            </span>
            <p className="text-xs font-bold text-slate-900 mt-1">Receipt: {payment.receiptNumber}</p>
            <p className="text-[11px] text-slate-500">Date: {formatDate(payment.paymentDate)}</p>
          </div>
        </div>

        {/* Client & Payment Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-400 block font-semibold">Received From (Client):</span>
            <strong className="text-slate-900 text-sm font-bold block">{payment.clientName}</strong>
            <span className="text-slate-600">Client ID: {payment.clientId}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-semibold">Payment Category:</span>
            <strong className="text-slate-900 text-sm font-bold block">
              {payment.paymentType.replace(/_/g, ' ')}
            </strong>
            {payment.loanId && <span className="text-slate-600 block">Loan ID: {payment.loanId} {payment.emiNumber ? `(EMI #${payment.emiNumber})` : ''}</span>}
            {payment.investmentId && <span className="text-slate-600 block">Investment ID: {payment.investmentId}</span>}
          </div>
        </div>

        {/* Amount Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3">Ref / UTR #</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-semibold text-slate-800">
                  {payment.paymentType.replace(/_/g, ' ')}
                  {payment.notes ? ` — ${payment.notes}` : ''}
                </td>
                <td className="p-3 text-slate-600">{payment.paymentMethod}</td>
                <td className="p-3 font-mono text-slate-600">{payment.transactionReference}</td>
                <td className="p-3 text-right font-bold text-slate-900 text-sm">
                  {formatCurrency(payment.amount)}
                </td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={3} className="p-3 text-slate-700 text-right">
                  TOTAL RECEIVED:
                </td>
                <td className="p-3 text-right text-emerald-700 text-base">
                  {formatCurrency(payment.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs">
          <span className="text-slate-500 font-medium">Amount in Words: </span>
          <strong className="text-slate-900 font-bold">{numberToWordsRupees(payment.amount)}</strong>
        </div>

        {/* Footer Signatures */}
        <div className="flex items-end justify-between pt-6 border-t border-slate-200 text-xs">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Verified & Digitally Logged</span>
            </div>
            <p className="text-[10px] text-slate-400">Recorded By: {payment.recordedBy}</p>
            <p className="text-[10px] text-slate-400">Timestamp: {formatDateTime(payment.createdAt)}</p>
          </div>

          <div className="text-center space-y-1">
            <div className="w-36 border-b border-slate-400 pb-8 text-[10px] text-slate-400 italic">
              Authorized Signatory Stamp
            </div>
            <p className="text-[10px] font-bold text-slate-700">MY BISHI ADMIN</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
