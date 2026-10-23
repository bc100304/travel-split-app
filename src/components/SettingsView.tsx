import React, { useState } from 'react';
import {
  Settings,
  Users,
  Plus,
  Trash2,
  FileSpreadsheet,
  RefreshCw,
  Check,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Github,
  Globe,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { Member, TripInfo, ExpenseItem } from '../types';
import { MEMBER_COLORS } from '../utils/categories';
import { testGasConnection } from '../utils/gasSync';

interface SettingsViewProps {
  trip: TripInfo;
  expenses: ExpenseItem[];
  onUpdateTrip: (updated: TripInfo) => void;
  onSyncGasUpload: () => Promise<void>;
  onSyncGasDownload: () => Promise<void>;
  onLoadDemoData: () => void;
  onClearData: () => void;
  onOpenGasGuide: () => void;
  onOpenGitHubGuide: () => void;
  onImportData: (data: { trip: TripInfo; expenses: ExpenseItem[] }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  trip,
  expenses,
  onUpdateTrip,
  onSyncGasUpload,
  onSyncGasDownload,
  onLoadDemoData,
  onClearData,
  onOpenGasGuide,
  onOpenGitHubGuide,
  onImportData,
}) => {
  // Local state for trip fields
  const [tripName, setTripName] = useState(trip.name);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);
  const [currency, setCurrency] = useState(trip.currency || 'TWD');
  const [currencySymbol, setCurrencySymbol] = useState(trip.currencySymbol || 'NT$');
  const [gasUrl, setGasUrl] = useState(trip.gasWebAppUrl || '');
  const [members, setMembers] = useState<Member[]>(trip.members);
  const [newMemberName, setNewMemberName] = useState('');

  // Statuses
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [urlTestStatus, setUrlTestStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Currency options
  const CURRENCIES = [
    { code: 'TWD', symbol: 'NT$', label: '新台幣 (TWD - NT$)' },
    { code: 'JPY', symbol: '¥', label: '日圓 (JPY - ¥)' },
    { code: 'USD', symbol: '$', label: '美元 (USD - $)' },
    { code: 'EUR', symbol: '€', label: '歐元 (EUR - €)' },
    { code: 'KRW', symbol: '₩', label: '韓元 (KRW - ₩)' },
    { code: 'THB', symbol: '฿', label: '泰銖 (THB - ฿)' },
    { code: 'HKD', symbol: 'HK$', label: '港幣 (HKD - HK$)' },
    { code: 'SGD', symbol: 'S$', label: '新加坡幣 (SGD - S$)' },
  ];

  const handleCurrencyChange = (code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    setCurrency(code);
    if (found) {
      setCurrencySymbol(found.symbol);
    }
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const nextColor = MEMBER_COLORS[members.length % MEMBER_COLORS.length];
    const newMember: Member = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newMemberName.trim(),
      color: nextColor,
    };
    setMembers([...members, newMember]);
    setNewMemberName('');
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) {
      alert('旅行團至少需要一位成員！');
      return;
    }
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleUpdateMemberColor = (id: string, color: string) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, color } : m)));
  };

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim()) {
      alert('請填寫旅行團名稱');
      return;
    }
    if (members.length === 0) {
      alert('請至少加入一位成員');
      return;
    }

    onUpdateTrip({
      ...trip,
      name: tripName.trim(),
      startDate,
      endDate,
      currency,
      currencySymbol,
      gasWebAppUrl: gasUrl.trim(),
      members,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleTestUrl = async () => {
    if (!gasUrl.trim()) {
      setUrlTestStatus({ success: false, msg: '請先輸入 Google Apps Script 網址' });
      return;
    }
    setIsTestingUrl(true);
    setUrlTestStatus(null);
    try {
      await testGasConnection(gasUrl.trim());
      setUrlTestStatus({ success: true, msg: '連線成功！Google 試算表可正常存取。' });
    } catch (err: any) {
      setUrlTestStatus({
        success: false,
        msg: `連線失敗：${err.message || '請確認 GAS 權限已設為 Anyone 所有人存取'}`,
      });
    } finally {
      setIsTestingUrl(false);
    }
  };

  const handleManualUpload = async () => {
    setIsUploading(true);
    try {
      await onSyncGasUpload();
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualDownload = async () => {
    setIsDownloading(true);
    try {
      await onSyncGasDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  // Export JSON file
  const handleExportJson = () => {
    const data = {
      trip,
      expenses,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel-split-${trip.name.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.trip && Array.isArray(parsed.expenses)) {
          if (confirm('確定要載入此備份檔案嗎？現有資料將會被替換。')) {
            onImportData({ trip: parsed.trip, expenses: parsed.expenses });
            alert('備份資料已成功匯入！');
          }
        } else {
          alert('匯入格式不符合預期，需包含 trip 與 expenses');
        }
      } catch (err) {
        alert('無法解析 JSON 檔案');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Settings Form */}
      <form onSubmit={handleSaveTrip} className="space-y-5">
        {/* Basic Trip Info Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Settings className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">旅程基本資訊</h3>
                <p className="text-xs text-slate-500">團名、出發日期與預設結算貨幣</p>
              </div>
            </div>

            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5" /> 已儲存變更
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              旅行團名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="例如：東京櫻花五日行 🌸、墾丁衝浪放空團"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                開始日期
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                結束日期
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                結算貨幣
              </label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                貨幣符號
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Members Management Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  旅行團成員名單 ({members.length} 人)
                </h3>
                <p className="text-xs text-slate-500">自訂每位夥伴名稱與代表顏色</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {members.map((member, idx) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs gap-3"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="relative">
                    <input
                      type="color"
                      value={member.color}
                      onChange={(e) => handleUpdateMemberColor(member.id, e.target.value)}
                      className="w-6 h-6 rounded-full border border-white shadow-2xs cursor-pointer appearance-none bg-transparent"
                      title="更換代表色"
                    />
                  </div>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => {
                      const updated = members.map((m) =>
                        m.id === member.id ? { ...m, name: e.target.value } : m
                      );
                      setMembers(updated);
                    }}
                    className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-hidden py-0.5 px-1 truncate w-full"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-slate-400">成員 #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="移除成員"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add member input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="輸入新成員稱呼（例如：阿凱、Cindy）"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
            />
            <button
              type="button"
              onClick={handleAddMember}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增成員</span>
            </button>
          </div>
        </div>

        {/* Google Apps Script & Sheets Integration Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-teal-200/90 shadow-2xs space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Google 試算表 (GAS) 雲端串接
                </h3>
                <p className="text-xs text-slate-500">多人共享同步、免伺服器永久備份</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenGasGuide}
              className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-200 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>教學與腳本</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Apps Script Web App URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleTestUrl}
                disabled={isTestingUrl || !gasUrl}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
              >
                {isTestingUrl ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>測試中...</span>
                  </>
                ) : (
                  <span>測試連線</span>
                )}
              </button>
            </div>

            {urlTestStatus && (
              <div
                className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                  urlTestStatus.success
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {urlTestStatus.success ? (
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{urlTestStatus.msg}</span>
              </div>
            )}
          </div>

          {gasUrl && (
            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleManualUpload}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                <span>{isUploading ? '上傳中...' : '立即上傳至 Google 試算表'}</span>
              </button>

              <button
                type="button"
                onClick={handleManualDownload}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold border border-slate-200 transition disabled:opacity-50"
              >
                <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-spin' : ''}`} />
                <span>{isDownloading ? '下載中...' : '從 Google 試算表下載覆蓋'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Save Changes Button */}
        <div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>儲存設定變更</span>
          </button>
        </div>
      </form>

      {/* Deployment & Guides */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-teal-600" />
          <span>部署上線與指南</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onOpenGasGuide}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">GAS 雲端資料庫串接</h4>
                <p className="text-[11px] text-slate-500">查看完整腳本與 Google Sheets 教學</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={onOpenGitHubGuide}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Github className="w-4 h-4 text-slate-800" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">GitHub Pages 發布上線</h4>
                <p className="text-[11px] text-slate-500">免費部署 PWA 與自訂網域步驟</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Backup, Demo & Clear Data */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4 text-teal-600" />
          <span>資料備份與示範重設</span>
        </h3>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>匯出 JSON 備份檔</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>匯入 JSON 備份檔</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>

          <button
            onClick={onLoadDemoData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>載入東京示範資料 (4人)</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              if (confirm('確定要清空所有資料嗎？此動作無法復原。')) {
                onClearData();
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline underline-offset-2"
          >
            清空所有旅程與開銷紀錄
          </button>
        </div>
      </div>
    </div>
  );
};
