import React from 'react';
import { Compass, Users, Cloud, RefreshCw, FileSpreadsheet, Github, Settings } from 'lucide-react';
import { TripInfo } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  trip: TripInfo;
  onOpenSettings: () => void;
  onOpenGasGuide: () => void;
  onOpenGitHubGuide: () => void;
  onSyncGas: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  trip,
  onOpenSettings,
  onOpenGasGuide,
  onOpenGitHubGuide,
  onSyncGas,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: App Branding & Trip Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-sm shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 truncate tracking-tight">
                {trip.name || '旅費分帳通'}
              </h1>
              {trip.startDate && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                  {trip.startDate}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                {trip.members.length} 位夥伴
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-600">
                {trip.currency} ({trip.currencySymbol})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Cloud Sync Button */}
          {trip.gasWebAppUrl ? (
            <button
              onClick={onSyncGas}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                isSyncing
                  ? 'bg-teal-50 text-teal-700 border-teal-200 cursor-wait'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
              }`}
              title="與 Google 試算表同步"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : 'text-teal-600'}`} />
              <span className="hidden sm:inline">{isSyncing ? '同步中...' : '同步雲端'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenGasGuide}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition"
              title="設定 Google Sheets 雲端連動"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">串接 Google 試算表</span>
            </button>
          )}

          {/* GitHub Pages Deploy Guide */}
          <button
            onClick={onOpenGitHubGuide}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="GitHub Pages 發布指南"
          >
            <Github className="w-3.5 h-3.5 text-slate-700" />
            <span>發布指南</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Trip Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
            title="旅程設定與資料管理"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
