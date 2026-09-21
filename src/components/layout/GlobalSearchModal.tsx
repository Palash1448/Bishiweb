import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Landmark, TrendingUp, Receipt, ArrowRight, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { clients, loans, investments, transactions } = useData();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Filter grouped results
  const matchingClients = cleanQuery
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.id.toLowerCase().includes(cleanQuery) ||
          c.phone.includes(cleanQuery) ||
          c.email.toLowerCase().includes(cleanQuery) ||
          c.city.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const matchingLoans = cleanQuery
    ? loans.filter(
        (l) =>
          l.id.toLowerCase().includes(cleanQuery) ||
          l.clientName.toLowerCase().includes(cleanQuery) ||
          l.loanPurpose.toLowerCase().includes(cleanQuery) ||
          l.status.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const matchingInvestments = cleanQuery
    ? investments.filter(
        (i) =>
          i.id.toLowerCase().includes(cleanQuery) ||
          i.clientName.toLowerCase().includes(cleanQuery) ||
          i.planName.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const matchingTransactions = cleanQuery
    ? transactions.filter(
        (t) =>
          t.id.toLowerCase().includes(cleanQuery) ||
          t.clientName.toLowerCase().includes(cleanQuery) ||
          t.referenceNumber.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const totalResults =
    matchingClients.length +
    matchingLoans.length +
    matchingInvestments.length +
    matchingTransactions.length;

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-fintech-xl border border-slate-200 overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search clients, loan IDs, investments, reference numbers... (e.g. Rahul, LN-10001, ₹50,000)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-300 rounded-md shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!cleanQuery ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p className="font-semibold text-slate-700 text-sm mb-1">Quick FinTech Global Search</p>
              <p>Type client name, mobile number, Loan ID (LN-10001), or Investment ID (INV-10001)</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No results found for <span className="font-semibold text-slate-800">"{query}"</span>
            </div>
          ) : (
            <>
              {/* Clients Section */}
              {matchingClients.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>Clients</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchingClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleSelect(`/clients/${client.id}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {client.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {client.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {client.id} • {client.phone} • {client.city}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loans Section */}
              {matchingLoans.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Landmark className="w-3.5 h-3.5 text-amber-500" />
                    <span>Loans</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchingLoans.map((loan) => (
                      <button
                        key={loan.id}
                        onClick={() => handleSelect(`/loans/${loan.id}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                            LN
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                              {loan.id} — {loan.clientName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatCurrency(loan.approvedAmount || loan.requestedAmount)} • {loan.status} • {loan.loanPurpose}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Investments Section */}
              {matchingInvestments.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Investments</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchingInvestments.map((inv) => (
                      <button
                        key={inv.id}
                        onClick={() => handleSelect(`/investments`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                            INV
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {inv.id} — {inv.clientName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {inv.planName} • {formatCurrency(inv.amount)} • {inv.status}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions Section */}
              {matchingTransactions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Receipt className="w-3.5 h-3.5 text-purple-500" />
                    <span>Transactions</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchingTransactions.map((txn) => (
                      <button
                        key={txn.id}
                        onClick={() => handleSelect(`/transactions`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                            TXN
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                              {txn.id} — {formatCurrency(txn.amount)} ({txn.nature})
                            </p>
                            <p className="text-xs text-slate-500">
                              {txn.clientName} • Ref: {txn.referenceNumber}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Search across Clients, Loans, Investments & Transactions</span>
          <button onClick={onClose} className="hover:text-slate-800 font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
