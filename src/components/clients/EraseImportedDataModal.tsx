import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useData } from '../../context/DataContext';
import {
  AlertTriangle,
  Trash2,
  Users,
  Calendar,
  CreditCard,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface EraseImportedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultGroupName?: string;
}

export const EraseImportedDataModal: React.FC<EraseImportedDataModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultGroupName,
}) => {
  const { clients, payments, transactions, eraseImportedClients } = useData();

  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroupName || 'ALL');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Identify all unique imported bishi groups
  const availableGroups = useMemo(() => {
    const groups = new Set<string>();
    clients.forEach((c) => {
      if (c.bishiGroupName) groups.add(c.bishiGroupName);
    });
    return Array.from(groups);
  }, [clients]);

  // Compute what will be erased based on selected scope
  const targetClients = useMemo(() => {
    return clients.filter((c) => {
      if (selectedGroup !== 'ALL') {
        return c.bishiGroupName?.toLowerCase().trim() === selectedGroup.toLowerCase().trim();
      }
      return (
        Boolean(c.monthlyLedger && c.monthlyLedger.length > 0) ||
        Boolean(c.customFields && Object.keys(c.customFields).length > 0) ||
        Boolean(c.bishiGroupName) ||
        Boolean(c.notes && c.notes.includes('Excel')) ||
        Boolean(c.srNo !== undefined)
      );
    });
  }, [clients, selectedGroup]);

  const targetClientIds = useMemo(() => new Set(targetClients.map((c) => c.id)), [targetClients]);

  const targetMonthlyRecordsCount = useMemo(() => {
    return targetClients.reduce((acc, c) => acc + (c.monthlyLedger?.length || 0), 0);
  }, [targetClients]);

  const targetPaymentsCount = useMemo(() => {
    return payments.filter(
      (p) => targetClientIds.has(p.clientId) || (p.notes && p.notes.includes('Excel Sheet Monthly Matrix Import'))
    ).length;
  }, [payments, targetClientIds]);

  const targetTxnsCount = useMemo(() => {
    return transactions.filter(
      (t) => targetClientIds.has(t.clientId) || (t.createdBy && t.createdBy.includes('Excel Import'))
    ).length;
  }, [transactions, targetClientIds]);

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE' || confirmText.trim().toUpperCase() === 'ERASE';

  const handleErase = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);

    try {
      await eraseImportedClients({
        bishiGroupName: selectedGroup !== 'ALL' ? selectedGroup : undefined,
        eraseAll: selectedGroup === 'ALL',
      });

      setIsDeleting(false);
      setConfirmText('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setIsDeleting(false);
      alert('Failed to erase imported data. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚠️ Alert: Erase Imported Spreadsheet Data"
      subtitle="Permanently remove imported Bhishi members, monthly passbooks, and generated transactions"
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 flex items-start gap-3.5 text-rose-900">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-rose-950 text-sm">Warning: Irreversible Action</h4>
            <p className="text-rose-800 leading-relaxed">
              This operation will permanently delete the selected imported members and their entire financial passbooks from both <strong>Firebase Firestore</strong> and <strong>local storage</strong>.
            </p>
          </div>
        </div>

        {/* Scope Selector */}
        {availableGroups.length > 0 && (
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Select Group / Scope to Erase:
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs font-semibold rounded-xl border border-slate-300 py-2.5 px-3"
            >
              <option value="ALL">All Imported Spreadsheet Data (All Groups)</option>
              {availableGroups.map((g) => (
                <option key={g} value={g}>
                  Group: {g}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Deletion Breakdown Stats */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Items Marked for Permanent Deletion:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-center">
              <Users className="w-4 h-4 text-rose-600 mx-auto mb-1" />
              <strong className="text-lg font-black text-rose-900 block">{targetClients.length}</strong>
              <span className="text-[10px] text-rose-700 font-medium">Member Profiles</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-center">
              <Calendar className="w-4 h-4 text-rose-600 mx-auto mb-1" />
              <strong className="text-lg font-black text-rose-900 block">{targetMonthlyRecordsCount}</strong>
              <span className="text-[10px] text-rose-700 font-medium">Monthly Passbooks</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-center">
              <CreditCard className="w-4 h-4 text-rose-600 mx-auto mb-1" />
              <strong className="text-lg font-black text-rose-900 block">{targetPaymentsCount}</strong>
              <span className="text-[10px] text-rose-700 font-medium">Payment Receipts</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-center">
              <Activity className="w-4 h-4 text-rose-600 mx-auto mb-1" />
              <strong className="text-lg font-black text-rose-900 block">{targetTxnsCount}</strong>
              <span className="text-[10px] text-rose-700 font-medium">Ledger Txns</span>
            </div>
          </div>
        </div>

        {/* Confirmation Input */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Type "DELETE" to Confirm</span>
          </div>

          <p className="text-[11px] text-slate-300">
            To prevent accidental data loss, please type <strong className="text-rose-400 font-mono">DELETE</strong> in the box below:
          </p>

          <input
            type="text"
            placeholder="Type DELETE here..."
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full bg-slate-800 text-white font-mono text-xs rounded-xl border border-slate-700 py-2.5 px-3.5 focus:border-rose-500 focus:outline-hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel (Keep Data)
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={!isConfirmed || targetClients.length === 0}
            isLoading={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-900/20 disabled:bg-slate-300 disabled:shadow-none"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={handleErase}
          >
            Yes, Erase {targetClients.length} Imported Records
          </Button>
        </div>
      </div>
    </Modal>
  );
};
