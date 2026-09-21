import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Client } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import {
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Mail,
  UserCheck,
} from 'lucide-react';

interface ManageClientCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export const ManageClientCredentialsModal: React.FC<ManageClientCredentialsModalProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  const { updateClient } = useData();
  const { impersonateClient } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setLoginId(client.loginId || client.id);
      setPassword(client.password || 'client123');
      setPortalEnabled(client.portalAccessEnabled !== false);
      setShowPassword(false);
      setCopied(false);
    }
  }, [client]);

  if (!client) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = 'Bishi@';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setShowPassword(true);
    toast.info('Password Generated', `Generated new password: ${result}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      toast.error('Validation Error', 'Login ID cannot be blank.');
      return;
    }
    if (!password.trim()) {
      toast.error('Validation Error', 'Password cannot be blank.');
      return;
    }

    setIsSaving(true);
    try {
      await updateClient(client.id, {
        loginId: loginId.trim(),
        password: password.trim(),
        portalAccessEnabled: portalEnabled,
      });
      toast.success('Credentials Saved', `Portal login details for ${client.name} updated.`);
      setIsSaving(false);
      onClose();
    } catch (err) {
      setIsSaving(false);
      toast.error('Error', 'Failed to update credentials.');
    }
  };

  const portalUrl = `${window.location.origin}/login`;

  const getShareableText = () => {
    return `🏦 *साई बीशी मंडळ मिरज - ग्राहक पोर्टल*\n\n` +
      `नमस्कार ${client.name},\n` +
      `आपण साई बीशी मंडळ मिरजच्या पोर्टलवर आपली बीशी गुंतवणूक, कर्ज व मासिक हप्ता (EMI) खात्याची माहिती ऑनलाइन पाहू शकता:\n\n` +
      `🔗 *पोर्टल लिंक:* ${portalUrl}\n` +
      `🆔 *लॉगिन आयडी / मोबाईल:* ${loginId} (किंवा ${client.phone})\n` +
      `🔑 *पासवर्ड:* ${password}\n\n` +
      `कृपया आपले लॉगिन तपशील सुरक्षित ठेवा.`;
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText(getShareableText());
    setCopied(true);
    toast.success('Copied to Clipboard', 'Portal login details copied. You can paste into SMS or chat.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = client.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(getShareableText());
    window.open(`https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${text}`, '_blank');
  };

  const handleDirectLogin = () => {
    impersonateClient(client);
    toast.success('Client Session Active', `Signed in as ${client.name} (Client Portal Preview).`);
    navigate('/portal/dashboard');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Client Portal Login Credentials"
      subtitle={`Manage ID, password, and portal permissions for ${client.name} (${client.id})`}
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Portal Access Status Banner */}
        <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
          portalEnabled
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className={`p-2 rounded-xl text-white ${portalEnabled ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            {portalEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold">
                {portalEnabled ? 'Client Portal Access Enabled' : 'Portal Access Disabled'}
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={portalEnabled}
                  onChange={(e) => setPortalEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <p className="text-xs mt-1 opacity-80">
              {portalEnabled
                ? 'Client can sign in using their Login ID, registered phone number, or email address.'
                : 'Sign-in is currently blocked for this client. Toggle on to grant access.'}
            </p>
          </div>
        </div>

        {/* Credentials Inputs */}
        <div className="space-y-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <Input
              label="Assigned Client Login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="e.g. MB-10024 or rajesh.sharma"
              leftIcon={<Key className="w-4 h-4 text-emerald-600" />}
              helperText="Client can use this ID, their mobile number, or email to log in."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Client Portal Password
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter login password"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={generateRandomPassword}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="whitespace-nowrap"
              >
                Auto Generate
              </Button>
            </div>
          </div>

          {/* Quick info about aliases */}
          <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Phone: <strong className="text-slate-700">{client.phone}</strong>
            </span>
            {client.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email: <strong className="text-slate-700">{client.email}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Share & Actions Toolbar */}
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-emerald-900 font-semibold flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-emerald-600" /> Share Login Details with Client:
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100/50 text-xs font-bold transition-all shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Info'}
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" /> WhatsApp
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDirectLogin}
            leftIcon={<UserCheck className="w-4 h-4 text-emerald-600" />}
            className="text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto font-bold"
          >
            Login as this Client (Preview)
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Save Credentials
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
