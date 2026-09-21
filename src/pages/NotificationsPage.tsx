import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatDateTime } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Landmark,
  CreditCard,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'LOAN' | 'EMI' | 'INVESTMENT'>('ALL');

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'LOAN') return n.type.startsWith('LOAN');
    if (filter === 'EMI') return n.type.startsWith('EMI');
    if (filter === 'INVESTMENT') return n.type.startsWith('INVESTMENT');
    return true;
  });

  const getIcon = (type: string) => {
    if (type.startsWith('LOAN')) return <Landmark className="w-5 h-5 text-amber-500" />;
    if (type === 'EMI_OVERDUE') return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    if (type.startsWith('EMI') || type.startsWith('PAYMENT')) return <CreditCard className="w-5 h-5 text-emerald-500" />;
    if (type.startsWith('INVESTMENT')) return <TrendingUp className="w-5 h-5 text-blue-500" />;
    return <Bell className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-emerald-600" /> Notifications & Alert Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial alerts, loan submissions, EMI due dates, and maturity notifications
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
          onClick={markAllNotificationsRead}
        >
          Mark All As Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'ALL', label: 'All Alerts' },
          { id: 'UNREAD', label: 'Unread Only' },
          { id: 'LOAN', label: 'Loan Applications' },
          { id: 'EMI', label: 'EMI Alerts' },
          { id: 'INVESTMENT', label: 'Investment Maturities' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tab.id
                ? 'bg-fintech-navy-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-fintech divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No notifications found in this category.
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                !notif.read ? 'bg-emerald-50/20' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">{formatDateTime(notif.createdAt)}</p>
                </div>
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
