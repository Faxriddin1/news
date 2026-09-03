import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { LanguageCode } from '../types.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface OfflineBannerProps {
  isOnline: boolean;
  language: LanguageCode;
  onRefresh: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline, language, onRefresh }) => {
  if (isOnline) return null;
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;

  return (
    <div
      id="offline-status-banner"
      className="bg-neutral-900 border-b border-[#333] px-4 py-2 text-[#F0F0F0] font-mono text-xs transition-all"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="uppercase tracking-widest text-[11px] text-amber-400">OFFLINE MODE • {t.offlineBadge}</span>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-full border border-[#444] bg-[#1A1A1A] px-3 py-0.5 text-[10px] uppercase tracking-wider text-neutral-300 hover:bg-[#252525] transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry Sync</span>
        </button>
      </div>
    </div>
  );
};
