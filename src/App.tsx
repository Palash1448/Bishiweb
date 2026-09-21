import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { ClientLayout } from './layouts/ClientLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { InvestmentPlansPage } from './pages/InvestmentPlansPage';
import { LoansPage } from './pages/LoansPage';
import { LoanDetailPage } from './pages/LoanDetailPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

// Client Portal Pages
import { ClientPortalDashboard } from './pages/client/ClientPortalDashboard';
import { ClientPortalInvestments } from './pages/client/ClientPortalInvestments';
import { ClientPortalLoans } from './pages/client/ClientPortalLoans';
import { ClientPortalPayments } from './pages/client/ClientPortalPayments';
import { ClientPortalProfile } from './pages/client/ClientPortalProfile';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Clients CRM */}
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />

        {/* Investments & Plans */}
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/investment-plans" element={<InvestmentPlansPage />} />

        {/* Loans & Credit */}
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/loans/:id" element={<LoanDetailPage />} />

        {/* Payments & Ledger */}
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />

        {/* Reports & Documents */}
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Protected Client Portal Routes */}
      <Route path="/portal" element={<ClientLayout />}>
        <Route index element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="dashboard" element={<ClientPortalDashboard />} />
        <Route path="investments" element={<ClientPortalInvestments />} />
        <Route path="loans" element={<ClientPortalLoans />} />
        <Route path="payments" element={<ClientPortalPayments />} />
        <Route path="profile" element={<ClientPortalProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
