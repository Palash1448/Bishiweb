import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  User,
  Building2,
  Lock,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase,
} from 'lucide-react';

export const ClientPortalProfile: React.FC = () => {
  const { currentClient, user, updateClientPassword } = useAuth();
  const { clients } = useData();
  const toast = useToast();

  const client = useMemo(() => {
    if (currentClient) return currentClient;
    if (user?.clientId) return clients.find((c) => c.id === user.clientId) || null;
    return clients[0] || null;
  }, [currentClient, user, clients]);

  // Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  if (!client) {
    return null;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass.trim()) {
      toast.error('Password Required', 'Please enter a new password.');
      return;
    }
    if (newPass.length < 4) {
      toast.error('Password Too Short', 'Password must be at least 4 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setIsChangingPass(true);
    const success = await updateClientPassword(client.id, newPass.trim());
    setIsChangingPass(false);

    if (success) {
      toast.success('Password Updated', 'Your portal login password was changed successfully.');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      toast.error('Error', 'Failed to update password.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-emerald-600" /> Profile & Security Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your registered personal dossier, verified banking details, and update your portal password
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Summary & Bank */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-lg flex items-center justify-center">
                  {client.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{client.name}</h3>
                  <p className="text-xs font-mono text-emerald-700 font-bold">{client.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={client.clientType} size="sm" />
                <StatusBadge status={client.kycStatus} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Mobile Phone:</span>
                <strong className="text-slate-900 font-medium">{client.phone}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Email Address:</span>
                <strong className="text-slate-900 font-medium">{client.email || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Occupation / Profession:</span>
                <strong className="text-slate-900 font-medium">{client.occupation || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Company / Business:</span>
                <strong className="text-slate-900 font-medium">{client.companyName || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Monthly Income:</span>
                <strong className="text-emerald-700 font-bold">{formatCurrency(client.monthlyIncome)}/mo</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Date of Birth:</span>
                <strong className="text-slate-900 font-medium">{formatDate(client.dateOfBirth)} ({client.gender})</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Registered Address:</span>
                <strong className="text-slate-900 font-medium">
                  {client.address}, {client.city}, {client.state} - {client.pinCode}
                </strong>
              </div>
            </div>
          </div>

          {/* Banking & Nominee Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-emerald-600" /> Payout Banking & Nominee Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Bank Name:</span>
                <strong className="text-slate-900 font-medium">{client.bankName || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Account Holder:</span>
                <strong className="text-slate-900 font-medium">{client.accountHolderName || client.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Account Number:</span>
                <strong className="font-mono text-slate-900 font-bold">{client.accountNumber || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">IFSC Code:</span>
                <strong className="font-mono text-slate-900 font-bold">{client.ifscCode || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Nominee Name:</span>
                <strong className="text-slate-900 font-medium">{client.nomineeName || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Nominee Relationship:</span>
                <strong className="text-slate-900 font-medium">
                  {client.nomineeRelationship || '—'} ({client.nomineePhone || '—'})
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Change Password Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Change Portal Password</h3>
                <p className="text-[11px] text-slate-500">Update your client login credentials</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
              <span className="text-slate-400 block">Your Active Login ID:</span>
              <strong className="font-mono text-slate-900 text-sm block mt-0.5">
                {client.loginId || client.id}
              </strong>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                (You can also log in using your phone: {client.phone})
              </span>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                isLoading={isChangingPass}
                leftIcon={<Key className="w-4 h-4" />}
              >
                Update Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
