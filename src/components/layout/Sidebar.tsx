import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Layers,
  Landmark,
  CreditCard,
  Receipt,
  BarChart3,
  Bell,
  FileText,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { user, role } = useAuth();
  const { notifications, loans } = useData();
  const location = useLocation();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const pendingLoans = loans.filter((l) => l.status === 'PENDING' || l.status === 'UNDER_REVIEW').length;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Clients CRM', path: '/clients', icon: Users },
    { label: 'Investments', path: '/investments', icon: TrendingUp },
    { label: 'Investment Plans', path: '/investment-plans', icon: Layers },
    { label: 'Loans & Credit', path: '/loans', icon: Landmark, badge: pendingLoans > 0 ? pendingLoans : undefined, badgeColor: 'bg-amber-500' },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Transaction Ledger', path: '/transactions', icon: Receipt },
    { label: 'Analytics & Reports', path: '/reports', icon: BarChart3 },
    { label: 'Documents Vault', path: '/documents', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined, badgeColor: 'bg-rose-500' },
    { label: 'Audit Trail', path: '/audit-logs', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <NavLink
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <img
              src="/logo.png"
              alt="साई बीशी मंडळ मिरज"
              className="w-10 h-10 rounded-full object-cover bg-white p-0.5 border border-amber-400/50 shadow-md shrink-0 group-hover:scale-105 transition-transform"
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent leading-snug truncate">
                  साई बीशी मंडळ
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> मिरज • Admin
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-900/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400')} />
                
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0',
                      item.badgeColor || 'bg-emerald-500',
                      collapsed && 'absolute top-2 right-2 px-1 py-0.5 text-[9px]'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Info / Role Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">{user?.name || 'Administrator'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    {role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'MANAGER' ? 'Manager' : 'Staff'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
