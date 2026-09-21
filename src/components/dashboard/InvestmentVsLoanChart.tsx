import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters';
import { useData } from '../../context/DataContext';

export const InvestmentVsLoanChart: React.FC = () => {
  const { stats } = useData();

  const invAmount = stats.activeInvestmentsAmount || 0;
  const loanAmount = stats.loanOutstandingAmount || 0;
  const total = invAmount + loanAmount;

  const data = total > 0 ? [
    { name: 'Active Investments', value: invAmount, color: '#059669' },
    { name: 'Loan Outstanding', value: loanAmount, color: '#d97706' },
  ] : [
    { name: 'Active Investments', value: 0, color: '#059669' },
    { name: 'Loan Outstanding', value: 0, color: '#d97706' },
  ];

  return (
    <div className="h-72 w-full flex flex-col items-center justify-center">
      {total === 0 ? (
        <div className="h-48 w-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-xs font-bold text-slate-600">Zero Active Portfolios</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Asset balance will appear upon creating investments or loans.</p>
        </div>
      ) : (
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs">
                        <p className="font-semibold">{item.name}</p>
                        <p className="font-bold text-emerald-400 mt-0.5">
                          {formatCurrency(item.value as number)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Portfolio</span>
            <span className="text-sm font-black text-slate-900">{formatCompactCurrency(total)}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 w-full pt-2 border-t border-slate-100 text-xs mt-auto">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
          <div className="truncate">
            <p className="text-slate-500 text-[11px] truncate">Investments</p>
            <p className="font-bold text-slate-900">{formatCompactCurrency(invAmount)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          <div className="truncate">
            <p className="text-slate-500 text-[11px] truncate">Loans Outstanding</p>
            <p className="font-bold text-slate-900">{formatCompactCurrency(loanAmount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
