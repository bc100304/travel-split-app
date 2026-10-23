import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Filter,
  Users,
  Calendar,
  Utensils,
  Hotel,
  Car,
  Ticket,
  ShoppingBag,
  Coffee,
  Receipt,
  Sparkles
} from 'lucide-react';
import { ExpenseItem, TripInfo } from '../types';
import { CATEGORIES, getCategoryById } from '../utils/categories';
import { createGoogleMapsUrl, formatCoordinates } from '../utils/geo';
import { formatCurrency } from '../utils/settlement';

interface ExpenseListViewProps {
  trip: TripInfo;
  expenses: ExpenseItem[];
  onAddExpense: () => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpenseListView: React.FC<ExpenseListViewProps> = ({
  trip,
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayer, setSelectedPayer] = useState<string>('all');

  // Compute quick statistics
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAmount = useMemo(() => {
    return expenses
      .filter((item) => item.date === todayStr)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses, todayStr]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedPayer !== 'all' && item.payerId !== selectedPayer) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesLocation = item.locationName?.toLowerCase().includes(q);
        const matchesNote = item.note?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocation && !matchesNote) {
          return false;
        }
      }
      return true;
    });
  }, [expenses, selectedCategory, selectedPayer, searchQuery]);

  // Group by date (descending)
  const groupedExpenses = useMemo(() => {
    const groups: { [date: string]: ExpenseItem[] } = {};
    // Sort items latest first
    const sorted = [...filteredExpenses].sort((a, b) => {
      const dateA = `${a.date} ${a.time || '00:00'}`;
      const dateB = `${b.date} ${b.time || '00:00'}`;
      return dateB.localeCompare(dateA);
    });

    sorted.forEach((item) => {
      const d = item.date || '其他未分類日期';
      if (!groups[d]) groups[d] = [];
      groups[d].push(item);
    });

    return groups;
  }, [filteredExpenses]);

  const getMemberById = (id: string) => {
    return trip.members.find((m) => m.id === id) || { name: '未知成員', color: '#64748b' };
  };

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'Hotel':
        return <Hotel className="w-4 h-4" />;
      case 'Car':
        return <Car className="w-4 h-4" />;
      case 'Ticket':
        return <Ticket className="w-4 h-4" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-teal-100">旅程總支出</span>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              {formatCurrency(totalAmount, trip.currencySymbol)}
            </span>
          </div>
          <span className="text-[11px] text-teal-100 mt-1">共 {expenses.length} 筆開銷記錄</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">今日花費</span>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {formatCurrency(todayAmount, trip.currencySymbol)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            {todayAmount > 0 ? '持續記帳中 ✍️' : '今天尚未記帳'}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex sm:flex-col justify-between items-center sm:items-start">
          <div>
            <span className="text-xs font-medium text-slate-500">平均每人</span>
            <div className="mt-1">
              <span className="text-lg sm:text-xl font-bold text-slate-800">
                {trip.members.length > 0
                  ? formatCurrency(totalAmount / trip.members.length, trip.currencySymbol)
                  : '$0'}
              </span>
            </div>
          </div>
          <button
            onClick={onAddExpense}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>記一筆</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋項目名稱、地點、備註..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Payer filter */}
          <select
            value={selectedPayer}
            onChange={(e) => setSelectedPayer(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">所有付款人</option>
            {trip.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} 先付
              </option>
            ))}
          </select>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
              selectedCategory === 'all'
                ? 'bg-teal-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部類別 ({expenses.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = expenses.filter((e) => e.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs shrink-0 transition ${
                  isSelected
                    ? 'bg-teal-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{renderCategoryIcon(cat.iconName)}</span>
                <span>{cat.name}</span>
                {count > 0 && <span className="opacity-80">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses by Date Feed */}
      {Object.keys(groupedExpenses).length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">尚無開銷紀錄</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' || selectedPayer !== 'all'
              ? '找不到符合篩選條件的消費，試著清除搜尋條件。'
              : '旅程開始了嗎？點擊下方按鈕記錄第一筆開銷吧！'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {searchQuery || selectedCategory !== 'all' || selectedPayer !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedPayer('all');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                清除篩選條件
              </button>
            ) : (
              <button
                onClick={onAddExpense}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
              >
                ＋ 立即新增第一筆支出
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedExpenses).map(([dateStr, items]) => {
            const dayTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

            return (
              <div key={dateStr} className="space-y-2">
                {/* Date header divider */}
                <div className="flex items-center justify-between px-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{dateStr}</span>
                  </div>
                  <span className="font-semibold text-slate-500">
                    小計：{formatCurrency(dayTotal, trip.currencySymbol)}
                  </span>
                </div>

                {/* Items in date */}
                <div className="space-y-2">
                  {items.map((item) => {
                    const category = getCategoryById(item.category);
                    const payer = getMemberById(item.payerId);
                    const splitCount = item.splitMemberIds?.length || trip.members.length;
                    const splitNames = (item.splitMemberIds || trip.members.map((m) => m.id))
                      .map((id) => getMemberById(id).name)
                      .join('、');

                    const perPersonAmount = item.amount / splitCount;
                    const hasGps = item.latitude !== undefined && item.longitude !== undefined;

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Left: Category Icon & Title */}
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${category.bgColor} ${category.borderColor}`}
                            >
                              {renderCategoryIcon(category.iconName)}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 leading-snug truncate">
                                {item.title}
                              </h4>

                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-500">
                                {/* Payer badge */}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: payer.color }}
                                  />
                                  <span>{payer.name} 先付</span>
                                </span>

                                {/* Split info */}
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                  <Users className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {splitCount} 人分擔 ({formatCurrency(perPersonAmount, trip.currencySymbol)}/人)
                                  </span>
                                </span>

                                {item.time && (
                                  <span className="text-[11px] text-slate-400">
                                    • {item.time}
                                  </span>
                                )}
                              </div>

                              {/* Split members detail */}
                              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                分攤：{splitNames}
                              </div>

                              {/* Note if exists */}
                              {item.note && (
                                <p className="text-xs text-slate-500 mt-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 italic">
                                  「{item.note}」
                                </p>
                              )}

                              {/* GPS / Location badge */}
                              {(item.locationName || hasGps) && (
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  {hasGps ? (
                                    <a
                                      href={createGoogleMapsUrl(item.latitude!, item.longitude!)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 text-[11px] font-medium transition"
                                      title="點擊在 Google Maps 中檢視地標"
                                    >
                                      <MapPin className="w-3 h-3 text-rose-500" />
                                      <span className="truncate max-w-[150px] sm:max-w-[200px]">
                                        {item.locationName || formatCoordinates(item.latitude, item.longitude)}
                                      </span>
                                      <ExternalLink className="w-2.5 h-2.5 text-teal-600" />
                                    </a>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                      <MapPin className="w-3 h-3 text-slate-400" />
                                      <span>{item.locationName}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Amount & Actions */}
                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              {formatCurrency(item.amount, trip.currencySymbol)}
                            </span>

                            <div className="flex items-center gap-1 mt-2">
                              <button
                                onClick={() => onEditExpense(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                                title="編輯開銷"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteExpense(item.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="刪除開銷"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
