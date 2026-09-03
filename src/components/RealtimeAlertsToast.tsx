import React from 'react';
import { Bell, X, ArrowRight, Zap } from 'lucide-react';
import { AlertNotification } from '../types.ts';

interface RealtimeAlertsToastProps {
  alerts: AlertNotification[];
  onDismiss: (id: string) => void;
  onSelectArticle: (articleId: string) => void;
}

export const RealtimeAlertsToast: React.FC<RealtimeAlertsToastProps> = ({
  alerts,
  onDismiss,
  onSelectArticle
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {alerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          id={`toast-alert-${alert.id}`}
          className="pointer-events-auto rounded-xl border border-neutral-300 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-[#333] dark:bg-[#111111]/95 transition-all animate-in slide-in-from-bottom-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#00FF41]"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-900 dark:text-[#00FF41]">
                {alert.keywordMatch ? `TRIGGER MATCH: ${alert.keywordMatch}` : 'BREAKING DISPATCH'}
              </span>
            </div>
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <h4 className="mt-2 text-xs font-serif font-bold text-neutral-900 dark:text-[#F0F0F0] line-clamp-2 leading-snug">
            {alert.title}
          </h4>
          <p className="mt-1 text-[11px] text-neutral-600 dark:text-[#888] line-clamp-2 font-sans">
            {alert.summary}
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-2 dark:border-[#222] text-[10px] font-mono">
            <span className="text-neutral-400 dark:text-[#666]">
              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={() => onSelectArticle(alert.id)}
              className="flex items-center gap-1 font-mono uppercase text-xs text-neutral-900 hover:underline dark:text-[#00FF41]"
            >
              <span>Read Intel</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
