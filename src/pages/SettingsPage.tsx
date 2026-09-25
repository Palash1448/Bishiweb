import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { isFirebaseConfigured } from '../firebase/config';
import { BusinessSettings } from '../types';
import { initialUsers } from '../services/seedData';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ImportClientsModal } from '../components/clients/ImportClientsModal';
import { EraseImportedDataModal } from '../components/clients/EraseImportedDataModal';
import { downloadSampleClientTemplate } from '../services/importService';
import {
  Settings as SettingsIcon,
  Building2,
  Percent,
  Database,
  RefreshCw,
  CloudUpload,
  Users,
  FileSpreadsheet,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const { settings, updateBusinessSettings, resetAllData, syncToFirestore } = useData();

  const [activeSection, setActiveSection] = useState<'business' | 'financial' | 'users' | 'system'>('business');

  const [businessName, setBusinessName] = useState(settings.businessName || 'साई बीशी मंडळ मिरज');
  const [tagline, setTagline] = useState(settings.tagline || 'विश्वसनीय बीशी बचत, मासिक गुंतवणूक व कर्ज योजना');
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || 'contact@saibishi.in');
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || '+91 98765 43210');
  const [address, setAddress] = useState(settings.address || 'मुख्य रस्ता, मिरज शहर');
  const [city, setCity] = useState(settings.city || 'मिरज (Miraj)');
  const [state, setState] = useState(settings.state || 'महाराष्ट्र (Maharashtra)');
  const [pinCode, setPinCode] = useState(settings.pinCode || '416410');
  const [gstNumber, setGstNumber] = useState(settings.gstNumber || '27AABCU9603R1ZM');
  const [panNumber, setPanNumber] = useState(settings.panNumber || 'AABCU9603R');

  // Financial
  const [defaultInterestRate, setDefaultInterestRate] = useState<number>(settings.defaultInterestRate || 14.0);
  const [defaultLatePenaltyPercent, setDefaultLatePenaltyPercent] = useState<number>(settings.defaultLatePenaltyPercent || 2.0);
  const [currency, setCurrency] = useState(settings.currency || 'INR');

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [eraseModalOpen, setEraseModalOpen] = useState(false);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateBusinessSettings({
      ...settings,
      businessName,
      tagline,
      contactEmail,
      supportPhone,
      address,
      city,
      state,
      pinCode,
      gstNumber,
      panNumber,
      defaultInterestRate,
      defaultLatePenaltyPercent,
      currency,
    });
    setIsSaving(false);
  };

  const handleSyncFirestore = async () => {
    setIsSyncing(true);
    await syncToFirestore();
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-emerald-600" /> Platform & Business Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure business metadata, legal GSTIN tax identifiers, interest defaults, and cloud persistence
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'business', label: 'Business & Branding', icon: Building2 },
          { id: 'financial', label: 'Lending & Interest Rates', icon: Percent },
          { id: 'users', label: 'Admin Roles & Access', icon: Users },
          { id: 'system', label: 'Firebase & System Data', icon: Database },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: BUSINESS & BRANDING */}
      {activeSection === 'business' && (
        <form onSubmit={handleSaveBusiness} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Entity Details & Legal Registration</h3>
            <p className="text-xs text-slate-500">
              Details printed on official investment certificates, loan agreements, and payment receipts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Business Entity Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
            <Input
              label="Tagline / Brand Statement"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
            <Input
              label="Contact Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
            <Input
              label="Official Helpline Phone"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              required
            />
            <Input
              label="Registered Office Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="md:col-span-2"
            />
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <Input
              label="PIN Code"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
            />
            <Input
              label="GSTIN Number"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              placeholder="27AABCU9603R1ZM"
            />
            <Input
              label="PAN Card Number"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value)}
              placeholder="AABCU9603R"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" isLoading={isSaving} disabled={!isSuperAdmin}>
              Save Business Details
            </Button>
          </div>
        </form>
      )}

      {/* SECTION 2: FINANCIAL POLICIES */}
      {activeSection === 'financial' && (
        <form onSubmit={handleSaveBusiness} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Lending & Credit Policies</h3>
            <p className="text-xs text-slate-500">
              Default terms, interest rates, penalty percentages, and currency configuration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Default Loan Interest Rate (% p.a.)"
              type="number"
              step="0.1"
              value={defaultInterestRate}
              onChange={(e) => setDefaultInterestRate(Number(e.target.value))}
              hint="Annual reducing-balance rate"
            />
            <Input
              label="Late Payment Penalty (% per day)"
              type="number"
              step="0.01"
              value={defaultLatePenaltyPercent}
              onChange={(e) => setDefaultLatePenaltyPercent(Number(e.target.value))}
              hint="Applied on overdue EMI balances"
            />
            <Input
              label="Currency Code"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              hint="Base financial currency (INR)"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" isLoading={isSaving} disabled={!isSuperAdmin}>
              Save Financial Policies
            </Button>
          </div>
        </form>
      )}

      {/* SECTION 3: ADMIN USERS & RBAC */}
      {activeSection === 'users' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Administrator Roles & Privileges</h3>
            <p className="text-xs text-slate-500">
              Role-based access matrix for Super Admins, Branch Managers, and Operations Staff
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
            {initialUsers.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
                    <p className="text-slate-500">{u.email} • {u.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={u.role} size="sm" />
                  <span className="text-[11px] text-slate-400 font-mono">{u.id}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Role matrix guide */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900">Permissions Matrix:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li><strong>Super Admin:</strong> Full unrestricted access, user management, loan approval, disbursement, deletion rights, and ledger edits.</li>
              <li><strong>Manager:</strong> Client registration, loan underwriting approval, loan disbursement, payment collection, and report generation.</li>
              <li><strong>Staff:</strong> Client registration, loan application submission, investment creation, EMI payment collection, and receipt printing.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 4: FIREBASE & SYSTEM DATA */}
      {activeSection === 'system' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-fintech space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Firebase Cloud & Database Health</h3>
            <p className="text-xs text-slate-500">
              Connected to Google Firebase Cloud Project <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono">bishi-883da</code>
            </p>
          </div>

          {/* Connection Status Card */}
          <div className="p-4 rounded-xl border flex items-center justify-between gap-4 bg-slate-50 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-emerald-50 text-emerald-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Google Firebase Firestore Connected
                </p>
                <p className="text-[11px] text-slate-500">
                  Project: <strong>bishi-883da</strong> • Real-time cloud persistence active
                </p>
              </div>
            </div>

            <span className="text-xs px-3 py-1 rounded-full font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
              Live Cloud Active
            </span>
          </div>

          {/* Data Import & Migration Hub */}
          <div className="p-5 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 rounded-2xl border border-emerald-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Bhishi Member & Ledger Data Migration
                  </h4>
                  <p className="text-xs text-slate-600">
                    Import existing Bhishi members, savings records, and active loans from Excel (.xlsx) or CSV
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs shadow-xs"
                  leftIcon={<Download className="w-3.5 h-3.5 text-slate-500" />}
                  onClick={() => downloadSampleClientTemplate('xlsx')}
                >
                  Download Template
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100 text-xs shadow-xs"
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                  onClick={() => setEraseModalOpen(true)}
                >
                  Erase Imported Data
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs shadow-fintech"
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                  onClick={() => setImportModalOpen(true)}
                >
                  Import Spreadsheet
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] text-slate-600 border-t border-emerald-100/80">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Automatic Marathi & English column detection
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Smart duplicate phone detection
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Auto-generates investment & loan portfolios
              </div>
            </div>
          </div>

          {/* Sync & Reset Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-emerald-600" /> Cloud Firestore Sync
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct write-through to Cloud Firestore is enabled for all clients, investments, loan accounts, and ledger records.
              </p>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<CloudUpload className="w-4 h-4" />}
                onClick={handleSyncFirestore}
                isLoading={isSyncing}
              >
                Verify Cloud Connection
              </Button>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-rose-600" /> Clear Local Cache
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clears any cached local data from memory and resets the view to live Firestore records.
              </p>
              <Button
                size="sm"
                variant="danger"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={resetAllData}
              >
                Clear Local Cache
              </Button>
            </div>
          </div>
        </div>
      )}

      <ImportClientsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
      <EraseImportedDataModal
        isOpen={eraseModalOpen}
        onClose={() => setEraseModalOpen(false)}
      />
    </div>
  );
};
