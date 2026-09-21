import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { InvestmentDetailModal } from '../../components/investments/InvestmentDetailModal';
import { Investment } from '../../types';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  PieChart,
  Eye,
} from 'lucide-react';

const getInvAmount = (inv: Investment | any): number => {
  return Number(inv?.amount ?? inv?.investedAmount ?? inv?.investmentAmount ?? inv?.principal ?? 0);
};

const getInvExpectedReturn = (inv: Investment | any): number => {
  if (inv?.expectedReturn !== undefined && inv?.expectedReturn !== null) {
    return Number(inv.expectedReturn);
  }
  const amt = getInvAmount(inv);
  const rate = Number(inv?.returnRate || 0);
  const months = Number(inv?.durationMonths || 12);
  return Math.round((amt * rate * months) / 1200);
};

export const ClientPortalInvestments: React.FC = () => {
  const { currentClient, user } = useAuth();
  const { clients, investments } = useData();
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  const client = useMemo(() => {
    if (currentClient) return currentClient;
    if (user?.clientId) return clients.find((c) => c.id === user.clientId) || null;
    return clients[0] || null;
  }, [currentClient, user, clients]);

  const clientId = client?.id || '';

  const clientInvestments = useMemo(
    () => investments.filter((i) => i.clientId === clientId),
    [investments, clientId]
  );

  const totalInvested = clientInvestments.reduce((sum, i) => sum + getInvAmount(i), 0);
  const totalExpectedReturns = clientInvestments.reduce((sum, i) => sum + getInvExpectedReturn(i), 0);
  const totalPayout = clientInvestments.reduce((sum, i) => sum + (Number(i.totalPayout) || (getInvAmount(i) + getInvExpectedReturn(i))), 0);
  const totalPaid = clientInvestments.reduce((sum, i) => sum + (Number(i.returnsPaid) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <TrendingUp className="w-7 h-7 text-emerald-600" /> My Investment Portfolio
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed overview of your subscribed Bishi investment pools and dividend returns
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Capital Invested</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(totalInvested)}</p>
          <span className="text-xs text-slate-400 mt-1 block">{clientInvestments.length} Active Subscriptions</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Expected Returns</span>
          <p className="text-2xl font-black text-blue-700 mt-1">+{formatCurrency(totalExpectedReturns)}</p>
          <span className="text-xs text-slate-400 mt-1 block">Dividend Profit</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Maturity Payout</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalPayout)}</p>
          <span className="text-xs text-slate-400 mt-1 block">Principal + Returns</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Dividends Received</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalPaid)}</p>
          <span className="text-xs text-slate-400 mt-1 block">Credited to Bank</span>
        </div>
      </div>

      {/* Investments List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Your Subscribed Bishi Plans</h3>

        {clientInvestments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-fintech text-xs text-slate-400">
            You do not currently have any active investments in the pool. Contact administrator to subscribe.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientInvestments.map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvestment(inv)}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-4 hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{inv.planName}</h4>
                      <StatusBadge status={inv.status} size="sm" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">Ref: {inv.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Annual ROI</span>
                    <span className="text-base font-black text-emerald-600">+{inv.returnRate}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 block">Principal Amount:</span>
                    <strong className="text-sm font-black text-emerald-700">{formatCurrency(getInvAmount(inv))}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Expected Return:</span>
                    <strong className="text-sm font-black text-blue-700">+{formatCurrency(getInvExpectedReturn(inv))}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Start Date:</span>
                    <strong className="text-slate-800">{formatDate(inv.startDate)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Maturity Date:</span>
                    <strong className="text-slate-800">{formatDate(inv.maturityDate)}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Duration: <strong>{inv.durationMonths} Months</strong></span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3.5 h-3.5" /> View Full Cards
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Investment Popup Cards Modal */}
      <InvestmentDetailModal
        isOpen={Boolean(selectedInvestment)}
        onClose={() => setSelectedInvestment(null)}
        investment={selectedInvestment}
      />
    </div>
  );
};

