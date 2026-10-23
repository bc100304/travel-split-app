import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-amber-500/95 backdrop-blur-xs px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg animate-in slide-in-from-top-3">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>離線模式運作中：已儲存於本機，連線後可同步 Google 試算表</span>
    </div>
  );
};
