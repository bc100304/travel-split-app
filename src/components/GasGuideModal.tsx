import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  FileSpreadsheet,
  ExternalLink,
  Code2,
  AlertTriangle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '../utils/gasScriptCode';

interface GasGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyUrl?: (url: string) => void;
}

export const GasGuideModal: React.FC<GasGuideModalProps> = ({
  isOpen,
  onClose,
  onApplyUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [testUrlInput, setTestUrlInput] = useState('');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Google 試算表 (GAS) 雲端串接指南
              </h2>
              <p className="text-xs text-slate-500">
                免伺服器費用，利用 Google Apps Script 實現多人雲端即時同步
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed">
          {/* Quick Flow */}
          <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200 space-y-2">
            <h3 className="font-bold text-teal-900 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>只需 3 分鐘，即可完成多人同步雲端試算表：</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-teal-800 font-medium">
              <li>在 Google Drive 建立一個新的「Google 試算表」</li>
              <li>點擊「擴充功能」➔「Apps Script」</li>
              <li>貼上下方的後端腳本程式碼</li>
              <li>點擊「部署」➔「網頁應用程式 (Web app)」，取得網址</li>
              <li>將網址貼回本 App「設定」即可開始同步！</li>
            </ol>
          </div>

          {/* Copy Code Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-teal-600" />
                <span>Google Apps Script 完整程式碼</span>
              </span>
              <button
                onClick={handleCopyCode}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 shadow-2xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>已複製代碼！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>一鍵複製程式碼</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-200 font-mono text-[11px] max-h-56 overflow-y-auto p-3">
              <pre className="whitespace-pre">{GOOGLE_APPS_SCRIPT_TEMPLATE}</pre>
            </div>
          </div>

          {/* Detailed step-by-step */}
          <div className="space-y-4 pt-1">
            <h3 className="font-bold text-slate-800 text-sm">
              詳細圖文指引步驟：
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>建立 Google 試算表</span>
                </div>
                <p className="text-slate-600 pl-6.5">
                  前往{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 font-bold underline inline-flex items-center gap-0.5"
                  >
                    sheets.new <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  建立空白試算表，命名為「2026 旅遊記帳資料庫」即可。
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>開啟 Apps Script 編輯器</span>
                </div>
                <p className="text-slate-600 pl-6.5">
                  在試算表頂端選單，點選<strong>「擴充功能 (Extensions)」➔「Apps Script」</strong>。
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>貼上腳本並儲存</span>
                </div>
                <p className="text-slate-600 pl-6.5">
                  將編輯器中的預設內容全部清空，貼上上方複製的完整程式碼，並點擊磁碟圖示「儲存」。
                </p>
              </div>

              <div className="p-3 rounded-xl border border-teal-200 bg-teal-50/50 space-y-1.5">
                <div className="font-bold text-teal-900 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>部署為網頁應用程式 (重要關鍵設定！)</span>
                </div>
                <div className="pl-6.5 space-y-1 text-slate-700">
                  <p>1. 點擊右上角藍色按鈕<strong>「部署 (Deploy)」➔「新增部署作業 (New deployment)」</strong>。</p>
                  <p>2. 點擊齒輪圖示，選擇<strong>「網頁應用程式 (Web app)」</strong>。</p>
                  <p>3. 說明可填寫：<code>旅費分帳通 API</code>。</p>
                  <p>4. <strong>執行身分 (Execute as)</strong>：選擇 <code>我 (Me)</code>。</p>
                  <p className="font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>5. 誰可以存取 (Who has access)：務必選擇「所有人 (Anyone)」！</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    （選擇「所有人」才能讓旅伴免登入同一個 Google 帳號就能寫入試算表）
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                    5
                  </span>
                  <span>複製網頁應用程式網址</span>
                </div>
                <p className="text-slate-600 pl-6.5">
                  點擊「部署」，依提示授權 Google 存取試算表。完成後會得到一組以 <code>/exec</code> 結尾的網址，複製它並貼至本 App 的「設定」頁面中即可！
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
          >
            我瞭解了，開始使用
          </button>
        </div>
      </div>
    </div>
  );
};
