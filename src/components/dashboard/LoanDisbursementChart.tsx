import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters';
import { useData } from '../../context/DataContext';

export const LoanDisbursementChart: React.FC = () => {
  const { loans } = useData();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const now = new Date();
  const dynamicData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = monthNames[d.getMonth()];

    const monthLoans = loans.filter((l) => (l.disbursementDate || l.applicationDate)?.startsWith(monthKey));
    const sanctioned = monthLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount || 0), 0);
    const disbursed = monthLoans.filter(l => l.status === 'DISBURSED' || l.status === 'ACTIVE' || l.status === 'OVERDUE' || l.status === 'CLOSED')
      .reduce((sum, l) => sum + (l.approvedAmount || 0), 0);

    return {
      month: monthLabel,
      sanctioned,
      disbursed,
    };
  });

  const hasData = loans.length > 0;

  return (
    <div className="h-72 w-full">
      {!hasData ? (
        <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-semibold text-slate-600">No Loan Applications Yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Sanctioned and disbursed credit volumes will show here once borrower applications are processed.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dynamicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      <p className="text-amber-400">
                        Disbursed: <strong>{formatCurrency(payload[1]?.value as number)}</strong>
                      </p>
                      <p className="text-slate-300">
                        Sanctioned: <strong>{formatCurrency(payload[0]?.value as number)}</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="sanctioned" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={12} />
            <Bar dataKey="disbursed" fill="#d97706" radius={[6, 6, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
