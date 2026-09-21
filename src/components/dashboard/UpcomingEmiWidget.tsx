import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { RecordPaymentModal } from '../payments/RecordPaymentModal';
import { Calendar, ArrowRight, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';

export const UpcomingEmiWidget: React.FC = () => {
  const { loans } = useData();
  const [selectedPayment, setSelectedPayment] = useState<{ loanId: string; emiNumber: number } | null>(null);

  // Collect upcoming & due EMIs from active loans
  const upcomingEmis: {
    loanId: string;
    clientId: string;
    clientName: string;
    emiNumber: number;
    dueDate: string;
    amount: number;
    status: string;
  }[] = [];

  loans.forEach((loan) => {
    if (loan.status === 'ACTIVE' || loan.status === 'OVERDUE' || loan.status === 'DISBURSED') {
      loan.emiSchedule.forEach((item) => {
        if (item.status !== 'PAID') {
          upcomingEmis.push({
            loanId: loan.id,
            clientId: loan.clientId,
            clientName: loan.clientName,
            emiNumber: item.emiNumber,
            dueDate: item.dueDate,
            amount: item.remainingAmount || item.emiAmount,
            status: item.status,
          });
        }
      });
    }
  });

  // Sort by due date
  upcomingEmis.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const displayList = upcomingEmis.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Upcoming & Due EMIs</h3>
              <p className="text-[11px] text-slate-500">Scheduled borrower installment collections</p>
            </div>
          </div>
          <Link
            to="/loans"
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {displayList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No upcoming EMIs scheduled. All installments up to date!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayList.map((item, idx) => (
              <div key={`${item.loanId}-${item.emiNumber}-${idx}`} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                    #{item.emiNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.clientName}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.loanId} • Due: {formatDate(item.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{formatCurrency(item.amount)}</p>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <Button
                    size="xs"
                    variant="outline"
                    className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                    onClick={() => setSelectedPayment({ loanId: item.loanId, emiNumber: item.emiNumber })}
                    title="Collect Payment"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collect Modal */}
      {selectedPayment && (
        <RecordPaymentModal
          isOpen={Boolean(selectedPayment)}
          onClose={() => setSelectedPayment(null)}
          preSelectedLoanId={selectedPayment.loanId}
          preSelectedEmiNumber={selectedPayment.emiNumber}
        />
      )}
    </div>
  );
};
