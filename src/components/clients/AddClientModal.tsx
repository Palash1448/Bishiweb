import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Select';
import { Button } from '../ui/Button';
import { useData } from '../../context/DataContext';
import { User, MapPin, Landmark, Sparkles, Key, Eye, EyeOff, RefreshCw, ShieldCheck } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (clientId: string) => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { addClient } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State: Name, Address, Bank Details, and Portal Credentials
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: '411001',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    loginId: '',
    password: 'client123',
    portalAccessEnabled: true,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = 'Bishi@';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: result }));
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter client full name.');
      return;
    }
    if (!formData.address.trim()) {
      alert('Please enter client address.');
      return;
    }
    if (!formData.bankName.trim() || !formData.accountNumber.trim()) {
      alert('Please enter bank name and account number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedPhone = formData.phone.trim() || `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`;
      const holderName = formData.accountHolderName.trim() || formData.name.trim();

      const newClient = await addClient({
        name: formData.name.trim(),
        phone: generatedPhone,
        email: `${formData.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@customer.mybishi.in`,
        dateOfBirth: '1995-01-01',
        gender: 'MALE',
        address: formData.address.trim(),
        city: formData.city.trim() || 'Pune',
        state: formData.state.trim() || 'Maharashtra',
        pinCode: formData.pinCode.trim() || '411001',
        occupation: 'Self-Employed / Business',
        companyName: '—',
        monthlyIncome: 60000,
        bankName: formData.bankName.trim(),
        accountHolderName: holderName,
        accountNumber: formData.accountNumber.trim(),
        ifscCode: (formData.ifscCode.trim() || 'HDFC0001234').toUpperCase(),
        nomineeName: 'Family Nominee',
        nomineeRelationship: 'Family',
        nomineePhone: generatedPhone,
        clientType: 'INVESTOR',
        kycStatus: 'VERIFIED',
        status: 'ACTIVE',
        loginId: formData.loginId.trim() || undefined,
        password: formData.password.trim() || 'client123',
        portalAccessEnabled: formData.portalAccessEnabled,
      });

      setIsSubmitting(false);
      // Reset form
      setFormData({
        name: '',
        phone: '',
        address: '',
        city: 'Pune',
        state: 'Maharashtra',
        pinCode: '411001',
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        loginId: '',
        password: 'client123',
        portalAccessEnabled: true,
      });
      onClose();
      if (onSuccess) onSuccess(newClient.id);
    } catch (err) {
      setIsSubmitting(false);
      alert('Failed to register client. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Client"
      subtitle="Client onboarding with Name, Address, Bank Details, and Login Credentials"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Client Identity & Name */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-1 border-b border-slate-200/60">
            <User className="w-4 h-4 text-emerald-600" />
            <span>1. Client Name & Contact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Ramesh Kadam"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <Input
              label="Mobile Number (Optional)"
              type="tel"
              placeholder="e.g. +91 98220 12345"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              helperText="Used for SMS alerts & portal login."
            />
          </div>
        </div>

        {/* 2. Residential Address */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-1 border-b border-slate-200/60">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>2. Address Information</span>
          </div>

          <div className="space-y-3">
            <Textarea
              label="Street Address / Building"
              required
              rows={2}
              placeholder="e.g. Flat 301, Shivneri Heights, Shivaji Nagar"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="City"
                required
                placeholder="e.g. Pune"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
              <Input
                label="State"
                required
                placeholder="e.g. Maharashtra"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
              <Input
                label="PIN Code"
                placeholder="e.g. 411001"
                value={formData.pinCode}
                onChange={(e) => handleChange('pinCode', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 3. Bank Account Details */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-1 border-b border-slate-200/60">
            <Landmark className="w-4 h-4 text-purple-600" />
            <span>3. Bank Account Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Bank Name"
              required
              placeholder="e.g. HDFC Bank, SBI, ICICI"
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
            />
            <Input
              label="Account Holder Name"
              placeholder="Leave blank to use client name"
              value={formData.accountHolderName}
              onChange={(e) => handleChange('accountHolderName', e.target.value)}
            />
            <Input
              label="Bank Account Number"
              required
              placeholder="e.g. 50100234589712"
              value={formData.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
            />
            <Input
              label="IFSC Code"
              placeholder="e.g. HDFC0001234"
              value={formData.ifscCode}
              onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
            />
          </div>
        </div>

        {/* 4. Portal Login Credentials (ID & Password) */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Key className="w-4 h-4 text-amber-600" />
              <span>4. Client Portal Login Credentials</span>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.portalAccessEnabled}
                onChange={(e) => handleChange('portalAccessEnabled', e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span className="text-[11px] font-semibold text-slate-700">Enable Portal Login</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Custom Login ID (Optional)"
              placeholder="Leave blank to use generated ID"
              leftIcon={<Key className="w-3.5 h-3.5 text-slate-400" />}
              value={formData.loginId}
              onChange={(e) => handleChange('loginId', e.target.value)}
              helperText="Client can also log in using phone."
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Portal Password
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-3 pr-10 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
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
                  size="sm"
                  onClick={generateRandomPassword}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="whitespace-nowrap text-xs"
                >
                  Generate
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Default password: <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-700 font-mono">client123</code></p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="bg-emerald-600 hover:bg-emerald-700 font-bold"
            isLoading={isSubmitting}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Register Client
          </Button>
        </div>
      </form>
    </Modal>
  );
};
