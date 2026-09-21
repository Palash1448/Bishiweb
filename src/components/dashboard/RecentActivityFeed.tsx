import React from 'react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Activity, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const RecentActivityFeed: React.FC = () => {
  const { transactions } = useData();

  // Combine latest activities
  const activities = transactions.slice(0, 6).map((txn) => {
    const isCredit = txn.nature === 'CREDIT';
    return {
      id: txn.id,
      title: txn.description,
      client: txn.clientName,
      amount: txn.amount,
      nature: txn.nature,
      date: txn.createdAt || txn.date,
      type: txn.type,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Live Activity Stream</h3>
              <p className="text-[11px] text-slate-500">Real-time ledger events and transactions</p>
            </div>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No ledger transactions yet. System events will log here automatically.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((act) => {
              const isCredit = act.nature === 'CREDIT';
              return (
                <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {act.client} • {formatDateTime(act.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-xs font-extrabold ${
                        isCredit ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}{formatCurrency(act.amount)}
                    </p>
                    <StatusBadge status={act.nature} size="sm" dot={false} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
