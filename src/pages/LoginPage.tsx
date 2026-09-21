import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { UserRole, Client } from '../types';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  TrendingUp,
  Landmark,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Key,
  User,
  Users,
  Smartphone,
  Check,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { login, loginAsClient, quickLogin, impersonateClient } = useAuth();
  const { clients } = useData();
  const toast = useToast();
  const navigate = useNavigate();

  // Login Mode: 'admin' vs 'client'
  const [authMode, setAuthMode] = useState<'admin' | 'client'>('admin');

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('admin@mybishi.in');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Client Form State
  const [clientIdentifier, setClientIdentifier] = useState('MB-10021');
  const [clientPassword, setClientPassword] = useState('client123');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  // Admin Submit
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      toast.error('Required Fields', 'Please enter your admin email and password.');
      return;
    }

    setIsLoading(true);
    const success = await login(adminEmail, adminPassword);
    setIsLoading(false);

    if (success) {
      toast.success('Welcome Back', 'Logged in to My Bishi Admin Portal.');
      navigate('/dashboard');
    } else {
      toast.error('Authentication Failed', 'Invalid credentials. Please verify your email and password.');
    }
  };

  // Client Submit
  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdentifier || !clientPassword) {
      toast.error('Required Fields', 'Please enter your Client Login ID, Phone, or Email, and Password.');
      return;
    }

    setIsLoading(true);
    const result = await loginAsClient(clientIdentifier, clientPassword);
    setIsLoading(false);

    if (result.success) {
      toast.success('Welcome to Client Portal', 'Signed in successfully to your financial dashboard.');
      navigate('/portal/dashboard');
    } else {
      toast.error('Login Failed', result.message || 'Invalid Client ID or Password.');
    }
  };

  const handleAdminDemoClick = (role: UserRole) => {
    quickLogin(role);
    toast.success('Quick Login', `Switched to ${role.replace('_', ' ')} mode.`);
    navigate('/dashboard');
  };

  const handleClientDemoClick = (targetClient?: Client) => {
    if (targetClient) {
      impersonateClient(targetClient);
      toast.success('Client Demo Login', `Logged in as ${targetClient.name}.`);
      navigate('/portal/dashboard');
    } else if (clients.length > 0) {
      impersonateClient(clients[0]);
      toast.success('Client Demo Login', `Logged in as ${clients[0].name}.`);
      navigate('/portal/dashboard');
    } else {
      // Create or use fallback demo client
      const demoClient: Client = {
        id: 'MB-10021',
        loginId: 'MB-10021',
        password: 'client123',
        name: 'Rajesh Sharma',
        phone: '+91 98201 23456',
        email: 'rajesh.sharma@example.com',
        dateOfBirth: '1988-06-12',
        gender: 'MALE',
        address: 'Flat 402, Shivam Heights',
        city: 'Pune',
        state: 'Maharashtra',
        pinCode: '411038',
        occupation: 'Senior IT Consultant',
        companyName: 'Infosys Ltd',
        monthlyIncome: 120000,
        bankName: 'HDFC Bank',
        accountHolderName: 'Rajesh Sharma',
        accountNumber: '50100492817264',
        ifscCode: 'HDFC0001234',
        nomineeName: 'Pooja Sharma',
        nomineeRelationship: 'Spouse',
        nomineePhone: '+91 98201 55667',
        clientType: 'INVESTOR_BORROWER',
        kycStatus: 'VERIFIED',
        status: 'ACTIVE',
        portalAccessEnabled: true,
        totalInvested: 150000,
        activeInvestmentsCount: 1,
        totalLoanAmount: 200000,
        outstandingLoanAmount: 180000,
        activeLoansCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Admin',
      };
      impersonateClient(demoClient);
      toast.success('Client Demo Login', 'Logged in to sample Client Portal.');
      navigate('/portal/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      {/* Left FinTech Hero Showcase */}
      <div className="md:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3.5 relative z-10">
          <img
            src="/logo.png"
            alt="साई बीशी मंडळ मिरज"
            className="w-14 h-14 rounded-full object-cover bg-white p-0.5 border-2 border-amber-400/60 shadow-xl shadow-emerald-950 shrink-0"
          />
          <div>
            <h1 className="text-xl font-black tracking-wide text-white">साई बीशी मंडळ मिरज</h1>
            <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">
              बीशी बचत व कर्ज व्यवस्थापन प्रणाली
            </p>
          </div>
        </div>

        {/* Center Hero Proposition */}
        <div className="my-10 md:my-auto space-y-6 relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> विश्वसनीय बीशी बचत व पतपुरवठा संस्था
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            बीशी गुंतवणूक, मासिक परतावा व सुलभ कर्ज वितरण प्रणाली.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            सभासदांसाठी सुरक्षित मासिक बीशी ठेवी, वेळेवर लाभांश वाटप, सुलभ मासिक हप्ते (EMI) व पारदर्शक डिजिटल पासबुक.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <TrendingUp className="w-5 h-5 text-emerald-400 mb-1.5" />
              <p className="text-xs font-bold text-white">बीशी बचत योजना</p>
              <p className="text-[11px] text-slate-400">मासिक व मुदत बचत परतावा</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <Landmark className="w-5 h-5 text-amber-400 mb-1.5" />
              <p className="text-xs font-bold text-white">सुलभ पतपुरवठा</p>
              <p className="text-[11px] text-slate-400">कर्ज मंजुरी व मासिक हप्ता व्यवस्थापन</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 relative z-10 flex items-center justify-between">
          <span>साई बीशी मंडळ • मिरज</span>
          <span>© {new Date().getFullYear()} साई बीशी मंडळ मिरज</span>
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="md:w-1/2 bg-white p-8 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Dual Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setAuthMode('admin');
                setShowPassword(false);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                authMode === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${authMode === 'admin' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Admin / Staff Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('client');
                setShowPassword(false);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                authMode === 'client'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Client / Member Sign In</span>
            </button>
          </div>

          {/* MODE 1: ADMIN LOGIN */}
          {authMode === 'admin' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Console Sign In</h2>
                <p className="text-xs text-slate-500">
                  Enter administrative credentials to manage underwriting, CRM, and pool ledgers.
                </p>
              </div>

              {/* 1-Click Demo Logins for Fast Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 1-Click Quick Demo Login
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Instant Access</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdminDemoClick('SUPER_ADMIN')}
                    className="py-2 px-2.5 rounded-xl bg-fintech-navy-900 text-white hover:bg-fintech-navy-800 text-xs font-bold transition-all shadow-xs text-center"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminDemoClick('MANAGER')}
                    className="py-2 px-2.5 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 text-xs font-bold transition-all text-center"
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminDemoClick('STAFF')}
                    className="py-2 px-2.5 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 text-xs font-bold transition-all text-center"
                  >
                    Staff
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[11px] text-slate-400 font-medium uppercase">Or Sign In with Email</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <Input
                  label="Admin Email Address"
                  type="email"
                  required
                  leftIcon={<Mail className="w-4 h-4" />}
                  placeholder="admin@mybishi.in"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />

                <div>
                  <Input
                    label="Admin Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-600 font-medium">Remember me for 30 days</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-bold"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to Admin Dashboard
                </Button>
              </form>
            </div>
          )}

          {/* MODE 2: CLIENT PORTAL LOGIN */}
          {authMode === 'client' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Client Portal Sign In</h2>
                <p className="text-xs text-slate-500">
                  Log in with your Client ID, registered Mobile Number, or Email, and your password.
                </p>
              </div>

              {/* 1-Click Client Demo Button */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> 1-Click Client Demo Login
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Test Client View</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleClientDemoClick()}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-xs text-center flex items-center justify-center gap-1.5"
                  >
                    <User className="w-4 h-4" /> Sign In as Client (1-Click Demo)
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[11px] text-slate-400 font-medium uppercase">Or Enter Client Credentials</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleClientSubmit} className="space-y-4">
                <Input
                  label="Client Login ID, Mobile, or Email"
                  type="text"
                  required
                  leftIcon={<Key className="w-4 h-4 text-emerald-600" />}
                  placeholder="e.g. MB-10021, 9820123456, or email"
                  value={clientIdentifier}
                  onChange={(e) => setClientIdentifier(e.target.value)}
                  helperText="Use the ID or phone number assigned by your administrator."
                />

                <div>
                  <Input
                    label="Client Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    placeholder="Enter password"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-600 font-medium">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-bold"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to Client Portal
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-fintech-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Sign In Assistance</h3>
            <div className="text-xs text-slate-600 space-y-2">
              <p>
                <strong>Admin Accounts:</strong> Passwords are <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">admin123</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">manager123</code>, or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">staff123</code>.
              </p>
              <p>
                <strong>Client Accounts:</strong> Default temporary password is <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">client123</code>.
              </p>
              <p className="text-slate-500">
                Administrators can view or reset any client's password from the Client Details dossier.
              </p>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setForgotModalOpen(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
