import React, { useState } from 'react';
import {
  Compass,
  Users,
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Plane
} from 'lucide-react';
import { Member, TripInfo } from '../types';
import { MEMBER_COLORS } from '../utils/categories';

interface TripSetupWizardModalProps {
  isOpen: boolean;
  onComplete: (trip: TripInfo) => void;
  onLoadDemo: () => void;
}

export const TripSetupWizardModal: React.FC<TripSetupWizardModalProps> = ({
  isOpen,
  onComplete,
  onLoadDemo,
}) => {
  const [tripName, setTripName] = useState('東京夏日漫遊 2026');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState('TWD');
  const [currencySymbol, setCurrencySymbol] = useState('NT$');
  const [members, setMembers] = useState<Member[]>([
    { id: 'mem-1', name: '小明 (我)', color: '#0d9488' },
    { id: 'mem-2', name: '小美', color: '#ec4899' },
    { id: 'mem-3', name: '阿豪', color: '#3b82f6' },
  ]);
  const [newMemberName, setNewMemberName] = useState('');

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const nextColor = MEMBER_COLORS[members.length % MEMBER_COLORS.length];
    setMembers([
      ...members,
      {
        id: `mem-${Date.now()}`,
        name: newMemberName.trim(),
        color: nextColor,
      },
    ]);
    setNewMemberName('');
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) {
      alert('旅行團至少需要一位成員');
      return;
    }
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim()) {
      alert('請填寫旅行團名稱');
      return;
    }
    if (members.length === 0) {
      alert('請至少加入一位夥伴');
      return;
    }

    const newTrip: TripInfo = {
      id: `trip-${Date.now()}`,
      name: tripName.trim(),
      startDate,
      endDate,
      currency,
      currencySymbol,
      members,
      gasWebAppUrl: '',
    };

    onComplete(newTrip);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-100 bg-gradient-to-b from-teal-50/60 to-white rounded-t-3xl shrink-0">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
            <Plane className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            歡迎使用「旅費分帳通」
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            專為多人同行設計的旅遊記帳與分帳 PWA。首先，請設定這次的旅行團資訊吧！
          </p>

          <div className="mt-3">
            <button
              type="button"
              onClick={onLoadDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-100/80 hover:bg-teal-200 text-teal-800 text-xs font-bold transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>直接載入「東京示範行程」快速體驗</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Trip Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              旅行團名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="例如：東京秋天賞楓趣、沖繩潛水自駕"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold focus:bg-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>出發日期</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>回程日期</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          {/* Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                記帳貨幣
              </label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  if (e.target.value === 'JPY') setCurrencySymbol('¥');
                  else if (e.target.value === 'USD') setCurrencySymbol('$');
                  else if (e.target.value === 'EUR') setCurrencySymbol('€');
                  else if (e.target.value === 'KRW') setCurrencySymbol('₩');
                  else if (e.target.value === 'THB') setCurrencySymbol('฿');
                  else setCurrencySymbol('NT$');
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
              >
                <option value="TWD">新台幣 (TWD)</option>
                <option value="JPY">日圓 (JPY)</option>
                <option value="USD">美元 (USD)</option>
                <option value="EUR">歐元 (EUR)</option>
                <option value="KRW">韓元 (KRW)</option>
                <option value="THB">泰銖 (THB)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                貨幣符號
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          {/* Members */}
          <div className="space-y-2 pt-1">
            <label className="block font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>旅行同行夥伴名單 ({members.length} 人)</span>
              </span>
            </label>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {members.map((member, idx) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: member.color }}
                    />
                    <span className="font-bold text-slate-800">{member.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="輸入旅伴稱呼（例如：佩佩）"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition shrink-0"
              >
                ＋ 新增
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>建立並進入旅程</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
