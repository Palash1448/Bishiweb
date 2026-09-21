import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { InvestmentPlan } from '../types';
import { formatCurrency } from '../utils/formatters';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select, Textarea } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import {
  Layers,
  Plus,
  TrendingUp,
  Clock,
  Coins,
  Edit2,
  CheckCircle,
} from 'lucide-react';

export const InvestmentPlansPage: React.FC = () => {
  const { plans, addPlan, updatePlan } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [minAmount, setMinAmount] = useState<number>(10000);
  const [maxAmount, setMaxAmount] = useState<number>(500000);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [returnRate, setReturnRate] = useState<number>(12.0);
  const [paymentFrequency, setPaymentFrequency] = useState<'MONTHLY' | 'QUARTERLY' | 'LUMP_SUM'>('MONTHLY');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [color, setColor] = useState('#059669');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setName('');
    setCode('MB-PLAN');
    setDescription('');
    setMinAmount(10000);
    setMaxAmount(500000);
    setDurationMonths(12);
    setReturnRate(12.0);
    setPaymentFrequency('MONTHLY');
    setStatus('ACTIVE');
    setColor('#059669');
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: InvestmentPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setCode(plan.code);
    setDescription(plan.description);
    setMinAmount(plan.minAmount);
    setMaxAmount(plan.maxAmount);
    setDurationMonths(plan.durationMonths);
    setReturnRate(plan.returnRate);
    setPaymentFrequency(plan.paymentFrequency);
    setStatus(plan.status);
    setColor(plan.color || '#059669');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, {
          name,
          code,
          description,
          minAmount,
          maxAmount,
          durationMonths,
          returnRate,
          paymentFrequency,
          status,
          color,
        });
      } else {
        await addPlan({
          name,
          code,
          description,
          minAmount,
          maxAmount,
          durationMonths,
          returnRate,
          paymentFrequency,
          status,
          color,
        });
      }
      setIsSubmitting(false);
      setModalOpen(false);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-emerald-600" /> Bishi Investment Plans Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic Bishi pool tiers, return rates, minimum investments, and payout cycles
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Create New Plan
        </Button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech p-6 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-300 transition-all"
          >
            {/* Top Color Accent */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: plan.color || '#059669' }}
            />

            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    {plan.code}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{plan.name}</h3>
                </div>
                <StatusBadge status={plan.status} size="sm" />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-6 min-h-[40px]">
                {plan.description}
              </p>

              {/* Plan Specs Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Return Rate:</span>
                  <strong className="text-emerald-700 text-sm font-extrabold block">
                    {plan.returnRate}% Annual
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Tenure:</span>
                  <strong className="text-slate-900 text-sm font-bold block">
                    {plan.durationMonths} Months
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Payout Frequency:</span>
                  <strong className="text-slate-900 font-semibold block">{plan.paymentFrequency}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Investment Range:</span>
                  <strong className="text-slate-900 font-semibold block">
                    {formatCurrency(plan.minAmount)} – {formatCurrency(plan.maxAmount)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">{plan.id}</span>
              <Button
                size="xs"
                variant="outline"
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={() => handleOpenEdit(plan)}
              >
                Edit Plan
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Plan Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlan ? `Edit ${editingPlan.name}` : 'Create New Bishi Plan'}
        subtitle="Set investment terms, return yields, and capital thresholds"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Plan Name"
              required
              placeholder="e.g. My Bishi Platinum Pool"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Plan Code"
              required
              placeholder="e.g. MB-PLATINUM"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          <Textarea
            label="Plan Description"
            rows={2}
            placeholder="Explain suitability and payout structure..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Min Investment (₹)"
              type="number"
              required
              value={minAmount}
              onChange={(e) => setMinAmount(Number(e.target.value))}
              prefixText="₹"
            />
            <Input
              label="Max Investment (₹)"
              type="number"
              required
              value={maxAmount}
              onChange={(e) => setMaxAmount(Number(e.target.value))}
              prefixText="₹"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Tenure (Months)"
              type="number"
              required
              min={1}
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
            />
            <Input
              label="Return Rate (% p.a.)"
              type="number"
              step="0.1"
              required
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
            />
            <Select
              label="Payout Frequency"
              value={paymentFrequency}
              onChange={(e) => setPaymentFrequency(e.target.value as any)}
              options={[
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'QUARTERLY', label: 'Quarterly' },
                { value: 'LUMP_SUM', label: 'Lump-Sum at Maturity' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Plan Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'ACTIVE', label: 'Active (Available for subscriptions)' },
                { value: 'INACTIVE', label: 'Inactive / Archived' },
              ]}
            />
            <Input
              label="Theme Accent Color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingPlan ? 'Save Changes' : 'Publish Investment Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
