import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-sm transition active:scale-95"
        title="安裝此應用程式至手機或電腦桌面"
      >
        <Download className="w-3.5 h-3.5" />
        <span>安裝 PWA</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-300 transition active:scale-95"
          title="加到 iPhone 主畫面"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-600" />
          <span>加到主畫面</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    安裝至 iPhone / iPad 主畫面
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-sm text-slate-600 leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    使用 <strong>Safari</strong> 瀏覽器開啟本網頁，點擊底部的{' '}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-medium">
                      <Share2 className="w-3.5 h-3.5" /> 分享
                    </span>{' '}
                    圖示。
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    在選單中往下滾動，點選{' '}
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-medium">
                      「加入主畫面」
                    </span>
                    。
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    點擊右上角<strong>「新增」</strong>
                    ，即可像原生 App 一樣全螢幕離線開啟！
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-teal-600 hover:bg-teal-700 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-98"
              >
                我知道了
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
