import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters';
import { useData } from '../../context/DataContext';

export const InvestmentGrowthChart: React.FC = () => {
  const { investments } = useData();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Build dynamic 6-month timeline
  const now = new Date();
  const dynamicData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = monthNames[d.getMonth()];

    const monthInvestments = investments.filter((inv) => inv.startDate?.startsWith(monthKey));
    const totalAmount = monthInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalReturns = monthInvestments.reduce((sum, inv) => sum + (inv.expectedReturn || 0), 0);

    return {
      month: monthLabel,
      investments: totalAmount,
      returns: totalReturns,
    };
  });

  const hasData = investments.length > 0;

  return (
    <div className="h-72 w-full">
      {!hasData ? (
        <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-semibold text-slate-600">No Investment Data Yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Once you register client investments into Bishi Pools, the growth trajectories will render here automatically.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dynamicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        Investments: <strong>{formatCurrency(payload[0]?.value as number)}</strong>
                      </p>
                      <p className="text-blue-400">
                        Returns Accrued: <strong>{formatCurrency(payload[1]?.value as number)}</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="investments"
              stroke="#059669"
              strokeWidth={3}
              dot={{ fill: '#059669', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="returns"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
