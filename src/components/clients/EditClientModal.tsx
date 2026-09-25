import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useData } from '../../context/DataContext';
import { Client } from '../../types';
import { User, MapPin, Landmark, Key, ShieldCheck, FileText, Sparkles } from 'lucide-react';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({ isOpen, onClose, client }) => {
  const { updateClient } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    occupation: '',
    companyName: '',
    monthlyIncome: 0,
    aadhaarNumber: '',
    panNumber: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    nomineeName: '',
    nomineeRelationship: '',
    nomineePhone: '',
    memberNumber: '',
    bishiGroupName: '',
    monthlyInstallment: 0,
    totalMonths: 12,
    monthsPaid: 0,
    totalPaid: 0,
    balanceAmount: 0,
    penaltyAmount: 0,
    loginId: '',
    password: '',
    portalAccessEnabled: true,
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
        dateOfBirth: client.dateOfBirth || '1995-01-01',
        gender: client.gender || 'MALE',
        address: client.address || '',
        city: client.city || 'Pune',
        state: client.state || 'Maharashtra',
        pinCode: client.pinCode || '411001',
        occupation: client.occupation || '',
        companyName: client.companyName || '',
        monthlyIncome: client.monthlyIncome || 0,
        aadhaarNumber: client.aadhaarNumber || '',
        panNumber: client.panNumber || '',
        bankName: client.bankName || '',
        accountHolderName: client.accountHolderName || client.name || '',
        accountNumber: client.accountNumber || '',
        ifscCode: client.ifscCode || '',
        nomineeName: client.nomineeName || '',
        nomineeRelationship: client.nomineeRelationship || '',
        nomineePhone: client.nomineePhone || '',
        memberNumber: client.memberNumber || '',
        bishiGroupName: client.bishiGroupName || '',
        monthlyInstallment: client.monthlyInstallment || 0,
        totalMonths: client.totalMonths || 12,
        monthsPaid: client.monthsPaid || 0,
        totalPaid: client.totalPaid || 0,
        balanceAmount: client.balanceAmount || 0,
        penaltyAmount: client.penaltyAmount || 0,
        loginId: client.loginId || '',
        password: client.password || 'client123',
        portalAccessEnabled: client.portalAccessEnabled !== false,
      });
    }
  }, [client]);

  if (!client) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateClient(client.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as any,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pinCode: formData.pinCode.trim(),
        occupation: formData.occupation.trim(),
        companyName: formData.companyName.trim(),
        monthlyIncome: Number(formData.monthlyIncome) || 0,
        aadhaarNumber: formData.aadhaarNumber.trim(),
        panNumber: formData.panNumber.trim().toUpperCase(),
        bankName: formData.bankName.trim(),
        accountHolderName: formData.accountHolderName.trim() || formData.name.trim(),
        accountNumber: formData.accountNumber.trim(),
        ifscCode: formData.ifscCode.trim().toUpperCase(),
        nomineeName: formData.nomineeName.trim(),
        nomineeRelationship: formData.nomineeRelationship.trim(),
        nomineePhone: formData.nomineePhone.trim(),
        memberNumber: formData.memberNumber.trim(),
        bishiGroupName: formData.bishiGroupName.trim(),
        monthlyInstallment: Number(formData.monthlyInstallment) || 0,
        totalMonths: Number(formData.totalMonths) || 12,
        monthsPaid: Number(formData.monthsPaid) || 0,
        totalPaid: Number(formData.totalPaid) || 0,
        balanceAmount: Number(formData.balanceAmount) || 0,
        penaltyAmount: Number(formData.penaltyAmount) || 0,
        loginId: formData.loginId.trim() || undefined,
        password: formData.password.trim(),
        portalAccessEnabled: formData.portalAccessEnabled,
      });

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      alert('Failed to update client details.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Profile: ${client.name}`}
      subtitle={`Client ID: ${client.id} • Member #${client.memberNumber || client.id}`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* 1. Identity & Contact */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-1 border-b border-slate-200/60">
            <User className="w-4 h-4 text-emerald-600" />
            <span>1. Identity & Contact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <Input
              label="Mobile Phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Aadhaar Card Number"
              placeholder="12-digit Aadhaar"
              value={formData.aadhaarNumber}
              onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
            />
            <Input
              label="PAN Card Number"
              placeholder="10-digit PAN"
              value={formData.panNumber}
              onChange={(e) => handleChange('panNumber', e.target.value)}
            />
            <Input
              label="Occupation / Business"
              value={formData.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
            />
          </div>
        </div>

        {/* 2. Bhishi Mandale & Hfta Details */}
        <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider pb-1 border-b border-emerald-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>2. Bhishi Mandale & Installment Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Bhishi Group / Mandale Name"
              placeholder="e.g. SAI BHISHI MANDALE -3"
              value={formData.bishiGroupName}
              onChange={(e) => handleChange('bishiGroupName', e.target.value)}
            />
            <Input
              label="Member / Sabhasad No (SR)"
              placeholder="e.g. 1"
              value={formData.memberNumber}
              onChange={(e) => handleChange('memberNumber', e.target.value)}
            />
            <Input
              label="Monthly Hfta (AMT ₹)"
              type="number"
              value={formData.monthlyInstallment}
              onChange={(e) => handleChange('monthlyInstallment', Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Input
              label="Months Paid (Count)"
              type="number"
              value={formData.monthsPaid}
              onChange={(e) => handleChange('monthsPaid', Number(e.target.value))}
            />
            <Input
              label="Total Paid (जमा ₹)"
              type="number"
              value={formData.totalPaid}
              onChange={(e) => handleChange('totalPaid', Number(e.target.value))}
            />
            <Input
              label="Balance Due (शिल्लक ₹)"
              type="number"
              value={formData.balanceAmount}
              onChange={(e) => handleChange('balanceAmount', Number(e.target.value))}
            />
            <Input
              label="Penalty / Danda (₹)"
              type="number"
              value={formData.penaltyAmount}
              onChange={(e) => handleChange('penaltyAmount', Number(e.target.value))}
            />
          </div>
        </div>

        {/* 3. Address & Residence */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-1 border-b border-slate-200/60">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>3. Address & Location</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="sm:col-span-2">
              <Input
                label="Street / Landmark Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
            <Input
              label="PIN Code"
              value={formData.pinCode}
              onChange={(e) => handleChange('pinCode', e.target.value)}
            />
          </div>
        </div>

        {/* 4. Bank & Nominee Details */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-1 border-b border-slate-200/60">
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>4. Bank Account & Nominee Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Bank Name"
              placeholder="e.g. State Bank of India"
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
            />
            <Input
              label="Account Number"
              value={formData.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
            />
            <Input
              label="IFSC Code"
              placeholder="e.g. SBIN0001234"
              value={formData.ifscCode}
              onChange={(e) => handleChange('ifscCode', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Nominee Name"
              value={formData.nomineeName}
              onChange={(e) => handleChange('nomineeName', e.target.value)}
            />
            <Input
              label="Nominee Relation"
              value={formData.nomineeRelationship}
              onChange={(e) => handleChange('nomineeRelationship', e.target.value)}
            />
            <Input
              label="Nominee Phone"
              value={formData.nomineePhone}
              onChange={(e) => handleChange('nomineePhone', e.target.value)}
            />
          </div>
        </div>

        {/* 5. Portal Credentials */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider pb-1 border-b border-slate-800">
            <Key className="w-4 h-4" />
            <span>5. Client Portal Login Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Login ID / Username</label>
              <input
                type="text"
                value={formData.loginId}
                placeholder={client.phone || client.id}
                onChange={(e) => handleChange('loginId', e.target.value)}
                className="w-full bg-slate-800 text-white text-xs font-mono rounded-xl border border-slate-700 py-2.5 px-3"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Portal Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full bg-slate-800 text-white text-xs font-mono rounded-xl border border-slate-700 py-2.5 px-3"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
