import React from 'react';
import { cn } from '../../utils/cn';

export type StatusType =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING'
  | 'PENDING_VERIFICATION'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'OVERDUE'
  | 'CLOSED'
  | 'MATURED'
  | 'CANCELLED'
  | 'UPCOMING'
  | 'DUE'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'COMPLETED'
  | 'FAILED'
  | 'VERIFIED'
  | 'NOT_SUBMITTED'
  | 'INVESTOR'
  | 'BORROWER'
  | 'INVESTOR_BORROWER'
  | 'CREDIT'
  | 'DEBIT'
  | 'SUPER_ADMIN'
  | 'MANAGER'
  | 'STAFF';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; dotColor: string }> = {
  // Positive / Active states
  ACTIVE: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
  PAID: { label: 'Paid', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
  VERIFIED: { label: 'Verified', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
  APPROVED: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
  CREDIT: { label: '+ Credit', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },

  // Informational / Tech states
  MATURED: { label: 'Matured', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dotColor: 'bg-blue-500' },
  DISBURSED: { label: 'Disbursed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dotColor: 'bg-blue-500' },
  INVESTOR: { label: 'Investor', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dotColor: 'bg-blue-500' },
  SUPER_ADMIN: { label: 'Super Admin', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dotColor: 'bg-purple-500' },
  MANAGER: { label: 'Manager', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dotColor: 'bg-indigo-500' },
  STAFF: { label: 'Staff', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dotColor: 'bg-slate-500' },

  // Combined / Neutral states
  INVESTOR_BORROWER: { label: 'Investor + Borrower', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dotColor: 'bg-purple-500' },
  BORROWER: { label: 'Borrower', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dotColor: 'bg-amber-500' },
  UPCOMING: { label: 'Upcoming', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dotColor: 'bg-slate-400' },
  CLOSED: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dotColor: 'bg-slate-400' },
  INACTIVE: { label: 'Inactive', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', dotColor: 'bg-slate-400' },

  // Pending / Review states
  PENDING: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dotColor: 'bg-amber-500' },
  PENDING_VERIFICATION: { label: 'Pending KYC', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dotColor: 'bg-amber-500' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dotColor: 'bg-amber-500' },
  DUE: { label: 'Due Today', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dotColor: 'bg-amber-500' },
  PARTIALLY_PAID: { label: 'Partial Paid', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dotColor: 'bg-amber-500' },

  // Negative / Alert states
  OVERDUE: { label: 'Overdue', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dotColor: 'bg-rose-500' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dotColor: 'bg-rose-500' },
  FAILED: { label: 'Failed', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dotColor: 'bg-rose-500' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dotColor: 'bg-rose-500' },
  DEBIT: { label: '- Debit', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dotColor: 'bg-rose-500' },
  NOT_SUBMITTED: { label: 'Not Submitted', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', dotColor: 'bg-slate-400' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = 'md',
  dot = true,
}) => {
  const normalizedKey = (status || '').toUpperCase().replace(/[\s-]/g, '_');
  const config = statusConfig[normalizedKey] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border transition-colors shrink-0',
        config.bg,
        config.text,
        config.border,
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)} />}
      <span>{config.label}</span>
    </span>
  );
};
