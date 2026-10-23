import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  ExternalLink,
  Check,
  Loader2,
  Calendar,
  Clock,
  Sparkles,
  Utensils,
  Hotel,
  Car,
  Ticket,
  ShoppingBag,
  Coffee,
  Receipt,
  FileText,
  AlertCircle
} from 'lucide-react';
import { ExpenseItem, Member, TripInfo } from '../types';
import { CATEGORIES } from '../utils/categories';
import { getCurrentLocation, createGoogleMapsUrl, formatCoordinates } from '../utils/geo';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<ExpenseItem, 'id' | 'createdAt'> & { id?: string }) => void;
  trip: TripInfo;
  editingExpense?: ExpenseItem | null;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  trip,
  editingExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [payerId, setPayerId] = useState('');
  const [splitMemberIds, setSplitMemberIds] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [note, setNote] = useState('');
  
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize or reset form values
  useEffect(() => {
    if (!isOpen) return;

    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(String(editingExpense.amount));
      setCategory(editingExpense.category || 'food');
      setPayerId(editingExpense.payerId);
      setSplitMemberIds(editingExpense.splitMemberIds || trip.members.map((m) => m.id));
      setDate(editingExpense.date || new Date().toISOString().split('T')[0]);
      setTime(editingExpense.time || new Date().toTimeString().substring(0, 5));
      setLocationName(editingExpense.locationName || '');
      setLatitude(editingExpense.latitude);
      setLongitude(editingExpense.longitude);
      setNote(editingExpense.note || '');
    } else {
      const now = new Date();
      setTitle('');
      setAmount('');
      setCategory('food');
      setPayerId(trip.members[0]?.id || '');
      // Default: all members split
      setSplitMemberIds(trip.members.map((m) => m.id));
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toTimeString().substring(0, 5));
      setLocationName('');
      setLatitude(undefined);
      setLongitude(undefined);
      setNote('');
    }
    setGeoError(null);
    setValidationError(null);
  }, [isOpen, editingExpense, trip]);

  if (!isOpen) return null;

  // Toggle member split
  const toggleMemberSplit = (memberId: string) => {
    setSplitMemberIds((prev) => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const selectAllMembers = () => {
    setSplitMemberIds(trip.members.map((m) => m.id));
  };

  const handleGetLocation = async () => {
    setIsLocating(true);
    setGeoError(null);
    try {
      const loc = await getCurrentLocation();
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
      if (!locationName) {
        setLocationName(`目前位置 (${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)})`);
      }
    } catch (err: any) {
      setGeoError(err.message || '無法取得 GPS 座標');
    } finally {
      setIsLocating(false);
    }
  };

  const clearLocation = () => {
    setLatitude(undefined);
    setLongitude(undefined);
    setLocationName('');
    setGeoError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('請輸入有效的開銷金額（大於 0）');
      return;
    }
    if (!title.trim()) {
      setValidationError('請填寫消費項目名稱');
      return;
    }
    if (!payerId) {
      setValidationError('請選擇誰先付款');
      return;
    }
    if (splitMemberIds.length === 0) {
      setValidationError('請至少勾選一位分攤夥伴');
      return;
    }

    onSubmit({
      id: editingExpense?.id,
      title: title.trim(),
      amount: parsedAmount,
      category,
      payerId,
      splitMemberIds,
      date,
      time,
      locationName: locationName.trim() || undefined,
      latitude,
      longitude,
      note: note.trim() || undefined,
    });

    onClose();
  };

  const parsedAmount = parseFloat(amount) || 0;
  const perPersonSplit = splitMemberIds.length > 0 ? (parsedAmount / splitMemberIds.length).toFixed(0) : '0';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {editingExpense ? '編輯支出紀錄' : '新增旅遊記帳'}
              </h2>
              <p className="text-xs text-slate-500">
                記錄開銷、分攤成員與 GPS 位置足跡
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm">
          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              消費金額 ({trip.currencySymbol}) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                {trip.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                required
                autoFocus={!editingExpense}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xl font-bold text-slate-800 placeholder-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              項目名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如：築地壽司早餐、晴空塔門票、計程車"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              消費分類
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition active:scale-95 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="mb-1">{renderCategoryIcon(cat.iconName)}</span>
                    <span className="text-[11px] truncate w-full text-center">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payer Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              由誰先付款？ <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {trip.members.map((member) => {
                const isSelected = payerId === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setPayerId(member.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition active:scale-95 ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: isSelected ? '#ffffff' : member.color }}
                    />
                    <span>{member.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Between Members */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                分攤對象 ({splitMemberIds.length} 人)
              </label>
              <button
                type="button"
                onClick={selectAllMembers}
                className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold"
              >
                全部人平分
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {trip.members.map((member) => {
                const isChecked = splitMemberIds.includes(member.id);
                return (
                  <label
                    key={member.id}
                    onClick={() => toggleMemberSplit(member.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition ${
                      isChecked
                        ? 'bg-white border-teal-400 text-slate-800 font-medium shadow-2xs'
                        : 'bg-slate-100 border-transparent text-slate-400 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center text-white text-[10px] ${
                        isChecked ? 'bg-teal-600' : 'bg-slate-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: member.color }}
                    />
                    <span className="text-xs truncate">{member.name}</span>
                  </label>
                );
              })}
            </div>

            {parsedAmount > 0 && splitMemberIds.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <span>每人平均分擔：</span>
                <span className="font-bold text-teal-700">
                  {trip.currencySymbol} {Number(perPersonSplit).toLocaleString()} / 人
                </span>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>日期</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>時間</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          {/* GPS Location & Google Maps */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>GPS 地理足跡與位置</span>
              </label>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium border border-teal-200 transition active:scale-95 disabled:opacity-50"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>定位中...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>取得目前位置</span>
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              placeholder="地點名稱（例如：東京鐵塔、築地場外市場）"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
            />

            {latitude !== undefined && longitude !== undefined && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono">{formatCoordinates(latitude, longitude)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={createGoogleMapsUrl(latitude, longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-0.5 text-teal-700 hover:text-teal-900 font-semibold underline underline-offset-2"
                  >
                    <span>在 Google Maps 查看</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                    title="清除座標"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {geoError && (
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 text-xs border border-amber-200">
                {geoError}
              </div>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>備註說明 (選填)</span>
            </label>
            <input
              type="text"
              placeholder="例如：含收據、退稅單據、刷卡明細"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{editingExpense ? '儲存修改' : '確認記錄這筆花費'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
