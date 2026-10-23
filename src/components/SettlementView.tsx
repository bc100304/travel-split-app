import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ArrowRight,
  Copy,
  Check,
  Share2,
  PieChart,
  Users,
  Wallet,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExpenseItem, Member, TripInfo } from '../types';
import { CATEGORIES, getCategoryById } from '../utils/categories';
import {
  calculateMemberBalances,
  calculateSimplifiedDebts,
  formatCurrency,
  generateLineShareText,
} from '../utils/settlement';

interface SettlementViewProps {
  trip: TripInfo;
  expenses: ExpenseItem[];
}

export const SettlementView: React.FC<SettlementViewProps> = ({ trip, expenses }) => {
  const [copied, setCopied] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Balances & Debts
  const balances = useMemo(() => {
    return calculateMemberBalances(trip.members, expenses);
  }, [trip.members, expenses]);

  const debts = useMemo(() => {
    return calculateSimplifiedDebts(balances);
  }, [balances]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const avgPerPerson = trip.members.length > 0 ? totalSpent / trip.members.length : 0;

  // Category Breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    CATEGORIES.forEach((c) => map.set(c.id, 0));

    expenses.forEach((e) => {
      const current = map.get(e.category) || 0;
      map.set(e.category, current + (Number(e.amount) || 0));
    });

    return CATEGORIES.map((c) => {
      const amount = map.get(c.id) || 0;
      const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
      return {
        ...c,
        amount,
        percentage,
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [expenses, totalSpent]);

  // Handle Copy to LINE
  const handleCopySummary = () => {
    const text = generateLineShareText(trip, balances, debts, expenses);
    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-teal-100 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" />
            <span>旅程總花費</span>
          </span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight">
              {formatCurrency(totalSpent, trip.currencySymbol)}
            </span>
          </div>
          <span className="text-[11px] text-teal-100">
            共 {expenses.length} 筆項目 • {trip.members.length} 位分攤者
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>人均平均應付</span>
          </span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {formatCurrency(avgPerPerson, trip.currencySymbol)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            每人均等負擔基準
          </span>
        </div>
      </div>

      {/* Simplified Debt Settlement (Core Feature) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-teal-200/90 shadow-sm space-y-3.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-teal-50 rounded-bl-full -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs">
                智慧簡化
              </span>
              <h3 className="text-base font-bold text-slate-800">
                最終轉帳結算方案
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              已自動化繁為簡，以最少轉帳次數完成所有結算！
            </p>
          </div>

          <button
            onClick={handleCopySummary}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>已複製結算文字！</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>一鍵複製傳至 LINE / 群組</span>
              </>
            )}
          </button>
        </div>

        {debts.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">所有夥伴已結清！</h4>
            <p className="text-xs text-slate-500 mt-1">目前大家的代墊與應付金額完全打平，無需任何轉帳。</p>
          </div>
        ) : (
          <div className="space-y-2.5 relative z-10">
            {debts.map((debt, idx) => (
              <div
                key={debt.id}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 transition"
              >
                {/* Flow indicator */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* From Debtor */}
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: debt.fromMember.color }}
                    />
                    <span className="font-bold text-slate-800 text-sm">
                      {debt.fromMember.name}
                    </span>
                  </div>

                  {/* Transfer arrow */}
                  <div className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 text-xs text-slate-400">
                    <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                      轉帳給
                    </span>
                    <ArrowRight className="w-4 h-4 text-teal-600" />
                  </div>

                  {/* To Creditor */}
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: debt.toMember.color }}
                    />
                    <span className="font-bold text-slate-800 text-sm">
                      {debt.toMember.name}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <span className="text-xs text-slate-500 sm:hidden">應轉金額：</span>
                  <span className="text-base font-black text-teal-700 font-mono tracking-tight">
                    {formatCurrency(debt.amount, trip.currencySymbol)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Balance Overview */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-teal-600" />
            <span>每位夥伴的代墊與應付明細</span>
          </h3>
          <span className="text-[11px] text-slate-400">點擊查看個人清單</span>
        </div>

        <div className="space-y-2">
          {balances.map((b) => {
            const isExpanded = expandedMemberId === b.memberId;
            const memberPaidExpenses = expenses.filter((e) => e.payerId === b.memberId);
            const memberSharedExpenses = expenses.filter(
              (e) => e.splitMemberIds && e.splitMemberIds.includes(b.memberId)
            );

            return (
              <div
                key={b.memberId}
                className="rounded-xl border border-slate-200 overflow-hidden bg-white transition"
              >
                <div
                  onClick={() => setExpandedMemberId(isExpanded ? null : b.memberId)}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: b.member.color }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{b.member.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        代墊 {formatCurrency(b.totalPaid, trip.currencySymbol)} • 應攤{' '}
                        {formatCurrency(b.totalShare, trip.currencySymbol)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.netBalance > 0.01 ? (
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                        應收回 {formatCurrency(b.netBalance, trip.currencySymbol)}
                      </span>
                    ) : b.netBalance < -0.01 ? (
                      <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                        需補繳 {formatCurrency(Math.abs(b.netBalance), trip.currencySymbol)}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium text-xs">
                        已結平
                      </span>
                    )}

                    <button className="text-slate-400 p-0.5">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-2 bg-slate-50/70 border-t border-slate-100 text-xs space-y-3">
                    <div>
                      <h5 className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <span>💳 {b.member.name} 代墊的項目 ({memberPaidExpenses.length} 筆)：</span>
                      </h5>
                      {memberPaidExpenses.length === 0 ? (
                        <p className="text-slate-400 italic text-[11px]">尚未有代墊開銷</p>
                      ) : (
                        <div className="space-y-1">
                          {memberPaidExpenses.map((e) => (
                            <div key={e.id} className="flex justify-between text-[11px] text-slate-600">
                              <span>• {e.title}</span>
                              <span className="font-medium text-slate-800">
                                {formatCurrency(e.amount, trip.currencySymbol)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <span>👥 {b.member.name} 參與分攤的項目 ({memberSharedExpenses.length} 筆)：</span>
                      </h5>
                      {memberSharedExpenses.length === 0 ? (
                        <p className="text-slate-400 italic text-[11px]">無參與項目</p>
                      ) : (
                        <div className="space-y-1">
                          {memberSharedExpenses.map((e) => {
                            const splitCount = e.splitMemberIds?.length || trip.members.length;
                            const share = e.amount / splitCount;
                            return (
                              <div key={e.id} className="flex justify-between text-[11px] text-slate-600">
                                <span>• {e.title} ({splitCount}人平分)</span>
                                <span className="font-medium text-slate-800">
                                  {formatCurrency(share, trip.currencySymbol)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Distribution Breakdown */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-teal-600" />
          <span>各類別開銷分佈統計</span>
        </h3>

        <div className="space-y-2.5">
          {categoryStats
            .filter((c) => c.amount > 0)
            .map((cat) => (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {formatCurrency(cat.amount, trip.currencySymbol)}
                    </span>
                    <span className="text-[11px] text-slate-400 w-9 text-right font-mono">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(cat.percentage, 2)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
