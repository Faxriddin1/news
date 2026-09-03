import React, { useState } from 'react';
import { Archive, Calendar, Download, Send, Sparkles, ExternalLink, ChevronRight, FileText } from 'lucide-react';
import { DailyDigest, LanguageCode } from '../types.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';
import { exportDigestToPdf } from '../utils/pdfExport.ts';

interface DigestArchiveProps {
  digests: DailyDigest[];
  onOpenDigest: (digest: DailyDigest) => void;
  onSendDigestToTelegram: (digest: DailyDigest) => Promise<void>;
  onGenerateNew: () => void;
  language: LanguageCode;
}

export const DigestArchive: React.FC<DigestArchiveProps> = ({
  digests,
  onOpenDigest,
  onSendDigestToTelegram,
  onGenerateNew,
  language
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = digests.filter(d =>
    d.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.dateStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.executiveSummary.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-neutral-200 dark:border-[#2A2A2A] pb-6 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 dark:text-[#888888] mb-2 font-mono">
            HISTORICAL DISPATCHES & ARCHIVE
          </p>
          <h1 className="text-4xl sm:text-6xl font-serif italic text-neutral-900 dark:text-[#F0F0F0] leading-none">
            {t.navArchive}
          </h1>
        </div>

        <button
          onClick={onGenerateNew}
          className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 dark:bg-[#FFFFFF] dark:text-[#000000] dark:hover:bg-[#E5E5E5] transition-all self-start sm:self-auto"
        >
          Generate New
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search historical digests by keyword, headline, or date..."
          className="w-full rounded-lg border border-neutral-300 bg-white p-3 pl-4 text-xs sm:text-sm font-sans text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-[#333] dark:bg-[#111111] dark:text-white dark:placeholder-[#666]"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center dark:border-[#333]">
          <FileText className="mx-auto h-8 w-8 text-neutral-400 dark:text-[#666]" />
          <p className="mt-3 text-sm font-serif italic text-neutral-600 dark:text-[#888]">
            No archived briefings found matching your search.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((digest) => (
            <div
              key={digest.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-2xs transition-all hover:border-neutral-400 dark:border-[#222] dark:bg-[#111111] dark:hover:border-[#444]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-800 dark:text-[#CCC] bg-neutral-100 dark:bg-[#1A1A1A] px-2 py-0.5 rounded-sm border border-neutral-300 dark:border-[#333]">
                      <Calendar className="h-3 w-3" />
                      <span>{digest.dateStr}</span>
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-500 dark:text-[#777] text-[10px] font-mono uppercase tracking-wider">
                      {digest.articleIds.length} Articles Compiled
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-500 dark:text-[#777] text-[10px] font-mono uppercase tracking-wider">
                      Lang: {digest.language}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-900 dark:text-white leading-snug">
                    {digest.headline}
                  </h3>

                  <div className="space-y-1.5 text-xs text-neutral-600 dark:text-[#999]">
                    {digest.executiveSummary.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-[10px] text-neutral-400">0{idx + 1}</span>
                        <span className="line-clamp-1">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Filter chips used */}
                  {digest.filtersUsed?.categories && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {digest.filtersUsed.categories.map((c) => (
                        <span
                          key={c}
                          className="rounded-sm bg-neutral-100 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-neutral-600 dark:bg-[#1C1C1C] dark:text-[#888] border border-neutral-200 dark:border-[#2A2A2A]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2 pt-2 md:pt-0">
                  <button
                    onClick={() => exportDigestToPdf(digest)}
                    className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-[11px] font-mono uppercase text-neutral-700 hover:bg-neutral-100 dark:border-[#333] dark:text-[#CCC] dark:hover:bg-[#202020]"
                    title={t.exportPdf}
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => onSendDigestToTelegram(digest)}
                    className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-100 px-3.5 py-1.5 text-[11px] font-mono uppercase text-neutral-800 hover:bg-neutral-200 dark:border-[#333] dark:bg-[#1A1A1A] dark:text-[#DDD] dark:hover:bg-[#252525]"
                    title={t.sendToTelegram}
                  >
                    <Send className="h-3 w-3" />
                    <span>Telegram</span>
                  </button>

                  <button
                    onClick={() => onOpenDigest(digest)}
                    className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-1.5 text-[11px] font-mono uppercase font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5]"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
