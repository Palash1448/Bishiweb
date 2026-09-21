import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/formatters';
import { KpiCard } from '../components/dashboard/KpiCard';
import { InvestmentGrowthChart } from '../components/dashboard/InvestmentGrowthChart';
import { LoanDisbursementChart } from '../components/dashboard/LoanDisbursementChart';
import { EmiCollectionChart } from '../components/dashboard/EmiCollectionChart';
import { InvestmentVsLoanChart } from '../components/dashboard/InvestmentVsLoanChart';
import { UpcomingEmiWidget } from '../components/dashboard/UpcomingEmiWidget';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { PendingLoanApplicationsWidget } from '../components/dashboard/PendingLoanApplicationsWidget';
import {
  Users,
  TrendingUp,
  Landmark,
  ShieldAlert,
  CreditCard,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { stats } = useData();

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const scrollToPendingApplications = () => {
    const el = document.getElementById('pending-loan-applications-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {greeting}, {user?.name?.split(' ')[0] || 'Admin'}
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening with My Bishi financial portfolios today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Monthly Portfolio Growth: <strong>+18.4%</strong></span>
          </div>
        </div>
      </div>

      {/* 8 FinTech KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Clients */}
        <KpiCard
          title="Total Clients"
          value={stats.totalClients.toString()}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: '+12%', isPositive: true }}
          subtitle="Active KYC Investors & Borrowers"
          color="navy"
        />

        {/* 2. Total Investments */}
        <KpiCard
          title="Total Investments"
          value={formatCurrency(stats.totalInvestmentsAmount)}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: '+24.5%', isPositive: true }}
          subtitle="Cumulative Bishi Capital Pool"
          color="emerald"
        />

        {/* 3. Active Investments */}
        <KpiCard
          title="Active Investments"
          value={formatCurrency(stats.activeInvestmentsAmount)}
          icon={<Layers className="w-5 h-5" />}
          subtitle={`${stats.activeInvestmentsCount} Active Yield Plans`}
          color="emerald"
        />

        {/* 4. Active Loans */}
        <KpiCard
          title="Active Loans"
          value={formatCurrency(stats.activeLoansAmount)}
          icon={<Landmark className="w-5 h-5" />}
          subtitle={`${stats.activeLoansCount} Disbursed Accounts`}
          color="blue"
        />

        {/* 5. Loan Outstanding */}
        <KpiCard
          title="Loan Outstanding"
          value={formatCurrency(stats.loanOutstandingAmount)}
          icon={<CreditCard className="w-5 h-5" />}
          subtitle="Principal + Interest Balance"
          color="amber"
        />

        {/* 6. Pending Loan Applications */}
        <div onClick={scrollToPendingApplications} className="cursor-pointer transition-transform hover:scale-[1.01]">
          <KpiCard
            title="Pending Applications"
            value={stats.pendingLoanApplicationsCount.toString()}
            icon={<Clock className="w-5 h-5" />}
            subtitle="Click to Underwrite & Review"
            color="purple"
          />
        </div>

        {/* 7. Today's Collection */}
        <KpiCard
          title="Today's Collection"
          value={formatCurrency(stats.todayCollectionAmount)}
          icon={<CreditCard className="w-5 h-5" />}
          trend={{ value: '+8.2%', isPositive: true }}
          subtitle="Real-time Received EMIs"
          color="emerald"
        />

        {/* 8. Overdue Amount */}
        <KpiCard
          title="Overdue Amount"
          value={formatCurrency(stats.overdueAmount)}
          icon={<ShieldAlert className="w-5 h-5" />}
          trend={{ value: '1 Account', isPositive: false }}
          subtitle="Late EMIs & Penalties"
          color="rose"
        />
      </div>

      {/* Mobile & Online Loan Underwriting Section */}
      <PendingLoanApplicationsWidget />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investment Growth Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-fintech p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Investment Growth & Returns</h3>
              <p className="text-xs text-slate-500">Cumulative Bishi pool capital & accrued dividend payouts</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Capital Invested
              </span>
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Return Payouts
              </span>
            </div>
          </div>
          <InvestmentGrowthChart />
        </div>

        {/* Investment vs Loan Donut Ratio */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Portfolio Distribution</h3>
            <p className="text-xs text-slate-500">Investments vs Loan Book Outstanding</p>
          </div>
          <InvestmentVsLoanChart />
        </div>
      </div>

      {/* Monthly Disbursements & EMI Collections Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Disbursements Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Loan Disbursements</h3>
              <p className="text-xs text-slate-500">Sanctioned vs actual disbursed capital</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" /> Sanctioned
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Disbursed
              </span>
            </div>
          </div>
          <LoanDisbursementChart />
        </div>

        {/* Monthly EMI Collection Area Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly EMI Recovery</h3>
              <p className="text-xs text-slate-500">Actual collections vs scheduled targets</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              98.2% Collection Rate
            </span>
          </div>
          <EmiCollectionChart />
        </div>
      </div>

      {/* Bottom Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming & Due EMIs */}
        <UpcomingEmiWidget />

        {/* Recent Activity Stream */}
        <RecentActivityFeed />
      </div>
    </div>
  );
};
