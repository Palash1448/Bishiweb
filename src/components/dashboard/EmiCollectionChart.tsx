import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters';
import { useData } from '../../context/DataContext';

export const EmiCollectionChart: React.FC = () => {
  const { payments, loans } = useData();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const now = new Date();
  const dynamicData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = monthNames[d.getMonth()];

    // Actual collected EMI payments in that month
    const monthPayments = payments.filter((p) => (p.paymentDate || p.createdAt)?.startsWith(monthKey) && p.paymentType === 'LOAN_EMI');
    const collected = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Target scheduled EMIs
    let target = 0;
    loans.forEach((l) => {
      l.emiSchedule?.forEach((s) => {
        if (s.dueDate?.startsWith(monthKey)) {
          target += s.emiAmount || 0;
        }
      });
    });

    return {
      month: monthLabel,
      target: target || collected,
      collected,
    };
  });

  const hasData = payments.length > 0 || loans.length > 0;

  return (
    <div className="h-72 w-full">
      {!hasData ? (
        <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-semibold text-slate-600">No EMI Collection Records</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Installment payments recorded against active loans will chart monthly performance and recovery rates here.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dynamicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="emiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(val) => formatCompactCurrency(val)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                      <p className="font-bold border-b border-slate-700 pb-1">{label}</p>
                      <p className="text-emerald-400">
                        Collected: <strong>{formatCurrency(payload[0]?.value as number)}</strong>
                      </p>
                      <p className="text-slate-400">
                        Scheduled Target: <strong>{formatCurrency(payload[1]?.value as number)}</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="collected"
              stroke="#059669"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#emiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
