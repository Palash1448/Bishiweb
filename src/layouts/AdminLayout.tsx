import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';
import { GlobalSearchModal } from '../components/layout/GlobalSearchModal';
import { AddClientModal } from '../components/clients/AddClientModal';
import { CreateInvestmentModal } from '../components/investments/CreateInvestmentModal';
import { LoanApplicationModal } from '../components/loans/LoanApplicationModal';
import { RecordPaymentModal } from '../components/payments/RecordPaymentModal';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, role, isClient } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Quick Action Modals
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [createInvestmentOpen, setCreateInvestmentOpen] = useState(false);
  const [applyLoanOpen, setApplyLoanOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  const location = useLocation();

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isClient || role === 'CLIENT') {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Fixed/Collapsible Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenAddClient={() => setAddClientOpen(true)}
          onOpenCreateInvestment={() => setCreateInvestmentOpen(true)}
          onOpenApplyLoan={() => setApplyLoanOpen(true)}
          onOpenRecordPayment={() => setRecordPaymentOpen(true)}
        />

        {/* Page View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Quick Action Modals */}
      <AddClientModal
        isOpen={addClientOpen}
        onClose={() => setAddClientOpen(false)}
      />
      <CreateInvestmentModal
        isOpen={createInvestmentOpen}
        onClose={() => setCreateInvestmentOpen(false)}
      />
      <LoanApplicationModal
        isOpen={applyLoanOpen}
        onClose={() => setApplyLoanOpen(false)}
      />
      <RecordPaymentModal
        isOpen={recordPaymentOpen}
        onClose={() => setRecordPaymentOpen(false)}
      />
    </div>
  );
};
