import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  TrendingUp,
  Landmark,
  CreditCard,
  User,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  LandmarkIcon,
} from 'lucide-react';

export const ClientLayout: React.FC = () => {
  const { user, currentClient, isAuthenticated, isLoading, logout, role } = useAuth();
  const { clients } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not logged in, go to login
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get active client entity
  const activeClient = currentClient || (user?.clientId ? clients.find((c) => c.id === user.clientId) : clients[0]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/portal/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/portal/investments', label: 'My Investments', icon: TrendingUp },
    { path: '/portal/loans', label: 'Loans & EMI', icon: Landmark },
    { path: '/portal/payments', label: 'Passbook & Receipts', icon: CreditCard },
    { path: '/portal/profile', label: 'Profile & Security', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-900/5 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-xl shadow-slate-950/20 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <NavLink to="/portal/dashboard" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="साई बीशी मंडळ मिरज"
                className="w-10 h-10 rounded-full object-cover bg-white p-0.5 border border-amber-400/50 shadow-md shrink-0 group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-wide text-white">साई बीशी मंडळ</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    मिरज
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">ग्राहक व सभासद पोर्टल (Client Portal)</p>
              </div>
            </NavLink>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right User & Actions */}
          <div className="flex items-center gap-3">
            {/* Client Pill */}
            {activeClient && (
              <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                  {activeClient.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <span className="font-bold text-white block text-[11px] leading-tight truncate max-w-[120px]">
                    {activeClient.name}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">{activeClient.id}</span>
                </div>
              </div>
            )}

            {/* Switch to Admin if Staff */}
            {role && role !== 'CLIENT' && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700"
                title="Return to Admin Panel"
              >
                Admin Panel <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-t border-slate-800 px-4 py-3 space-y-1">
            {activeClient && (
              <div className="p-3 mb-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{activeClient.name}</p>
                  <p className="text-[10px] font-mono text-emerald-400">{activeClient.id} • {activeClient.phone}</p>
                </div>
                <StatusBadge status={activeClient.kycStatus} size="sm" />
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {role && role !== 'CLIENT' && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full mt-2 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                <span>Back to Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="साई बीशी मंडळ मिरज"
              className="w-6 h-6 rounded-full object-cover bg-white p-0.5 border border-amber-300 shrink-0"
            />
            <span className="font-bold text-slate-800">साई बीशी मंडळ मिरज</span>
            <span>• सुरक्षित सभासद पोर्टल</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>256-Bit SSL Encrypted</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} साई बीशी मंडळ मिरज</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
