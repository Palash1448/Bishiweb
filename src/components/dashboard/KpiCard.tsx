import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'navy';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'navy',
  onClick,
}) => {
  const colorMap = {
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accent: 'border-l-4 border-l-emerald-500',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      accent: 'border-l-4 border-l-amber-500',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      accent: 'border-l-4 border-l-rose-500',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      accent: 'border-l-4 border-l-blue-500',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      accent: 'border-l-4 border-l-purple-500',
    },
    navy: {
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
      accent: 'border-l-4 border-l-slate-700',
    },
  };

  const style = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech transition-all duration-200 flex flex-col justify-between',
        style.accent,
        onClick && 'cursor-pointer hover:shadow-fintech-md hover:border-slate-300'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight leading-none">
            {value}
          </h3>
        </div>
        <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs', style.iconBg)}>
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-bold',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend.value}
          </span>
        )}
        <span className="text-slate-400 text-[11px] truncate">{subtitle || 'vs previous period'}</span>
      </div>
    </div>
  );
};
