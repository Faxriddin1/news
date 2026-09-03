import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Download,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  Flame,
  Globe,
  Sliders,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { DailyDigest, LanguageCode, Category } from '../types.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';
import { exportDigestToPdf } from '../utils/pdfExport.ts';

interface DigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDigest: DailyDigest | null;
  onGenerateDigest: (options: {
    categories: string[];
    keywords: string[];
    language: string;
    customFocus: string;
  }) => Promise<void>;
  isGenerating: boolean;
  onSendDigestToTelegram: (digest: DailyDigest) => Promise<void>;
  isSendingTelegram: boolean;
  language: LanguageCode;
  allCategories: Category[];
  trackedKeywords: string[];
  userChatId?: string;
}

export const DigestModal: React.FC<DigestModalProps> = ({
  isOpen,
  onClose,
  currentDigest,
  onGenerateDigest,
  isGenerating,
  onSendDigestToTelegram,
  isSendingTelegram,
  language,
  allCategories,
  trackedKeywords,
  userChatId
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  const [selectedCats, setSelectedCats] = useState<string[]>(['LLM', 'OpenSource', 'Robotics', 'Agents']);
  const [customFocus, setCustomFocus] = useState('');
  const [activeTab, setActiveTab] = useState<'brief' | 'telegram' | 'config'>('brief');
  const [copied, setCopied] = useState(false);
  const [telegramSuccessToast, setTelegramSuccessToast] = useState(false);

  const toggleCat = (cat: string) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleCopyMarkdown = () => {
    if (!currentDigest) return;
    navigator.clipboard.writeText(currentDigest.telegramMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTelegram = async () => {
    if (!currentDigest) return;
    await onSendDigestToTelegram(currentDigest);
    setTelegramSuccessToast(true);
    setTimeout(() => setTelegramSuccessToast(false), 4000);
  };

  const handleExportPdf = () => {
    if (!currentDigest) return;
    exportDigestToPdf(currentDigest);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-neutral-300 bg-white shadow-2xl dark:border-[#2A2A2A] dark:bg-[#0E0E0E] overflow-hidden text-neutral-900 dark:text-[#F0F0F0]"
        id="daily-digest-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-[#222] bg-neutral-50/90 dark:bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-base font-serif italic font-bold tracking-tight text-neutral-900 dark:text-white">
                Autonomous Intelligence Digest
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-[#777] flex items-center gap-2">
                <span>{currentDigest?.dateStr || new Date().toLocaleDateString()}</span>
                <span>•</span>
                <span>Gemini 3.8 Flash Engine</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-neutral-300 dark:border-[#333] bg-neutral-200/50 p-0.5 dark:bg-[#1A1A1A]">
              <button
                onClick={() => setActiveTab('brief')}
                className={`rounded-full px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-all ${
                  activeTab === 'brief'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-[#888] dark:hover:text-white'
                }`}
              >
                Synopsis
              </button>
              <button
                onClick={() => setActiveTab('telegram')}
                className={`rounded-full px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-all ${
                  activeTab === 'telegram'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-[#888] dark:hover:text-white'
                }`}
              >
                Telegram
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`rounded-full px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-all ${
                  activeTab === 'config'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-[#888] dark:hover:text-white'
                }`}
              >
                Parameters
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-[#222] dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Tab 1: Briefing View */}
          {activeTab === 'brief' && (
            <div className="space-y-6">
              {currentDigest ? (
                <>
                  {/* Headline */}
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-[#222] dark:bg-[#141414]">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#00FF41]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
                      <span>PRIMARY INTELLIGENCE THEME</span>
                    </div>
                    <h3 className="mt-2 text-xl sm:text-2xl font-serif italic font-bold text-neutral-900 dark:text-white leading-snug">
                      {currentDigest.headline}
                    </h3>
                  </div>

                  {/* Executive Overview */}
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-[#777] mb-3">
                      Executive Summary & Key Takeaways
                    </h4>
                    <div className="space-y-2.5">
                      {currentDigest.executiveSummary.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 p-3.5 text-xs text-neutral-800 dark:border-[#222] dark:bg-[#141414] dark:text-[#CCC]"
                        >
                          <span className="font-mono text-xs font-bold text-neutral-400 dark:text-[#666] shrink-0">
                            0{i + 1}
                          </span>
                          <span className="leading-relaxed font-sans">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Highlights */}
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-[#777] mb-3">
                      High Impact Developments
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {currentDigest.keyHighlights.map((hl, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-[#222] dark:bg-[#141414] flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="rounded-sm border border-neutral-300 bg-neutral-200 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-neutral-800 dark:border-[#333] dark:bg-[#222] dark:text-[#AAA]">
                                {hl.category}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400 dark:text-[#666]">{hl.source}</span>
                            </div>
                            <h5 className="text-sm font-serif font-bold text-neutral-900 dark:text-zinc-100 leading-snug">
                              {hl.title}
                            </h5>
                            <p className="mt-2 text-xs text-neutral-600 dark:text-[#999] leading-relaxed">
                              {hl.summary}
                            </p>
                          </div>
                          <div className="mt-3 border-t border-neutral-100 pt-2 text-[10px] font-mono text-neutral-500 dark:border-[#222] dark:text-[#777]">
                            <strong className="text-neutral-800 dark:text-[#CCC]">IMPACT: </strong>
                            {hl.impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <Sparkles className="mx-auto h-8 w-8 text-neutral-400 dark:text-[#666]" />
                  <p className="mt-3 text-sm font-serif italic text-neutral-600 dark:text-[#888]">
                    No digest generated yet. Press the button below to compile latest briefings.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Active Tab 2: Telegram Bot Preview */}
          {activeTab === 'telegram' && currentDigest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-bold text-neutral-900 dark:text-white">
                    Telegram Bot Payload Preview
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-500 dark:text-[#777]">
                    Target: @AIPulseDailyDigestBot / Direct Telegram Dispatch
                  </p>
                </div>
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-mono uppercase text-neutral-700 hover:bg-neutral-100 dark:border-[#333] dark:bg-[#181818] dark:text-[#CCC] dark:hover:bg-[#222]"
                >
                  {copied ? <Check className="h-3 w-3 text-[#00FF41]" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Editorial Terminal Preview */}
              <div className="rounded-xl border border-neutral-300 dark:border-[#2A2A2A] bg-neutral-900 p-5 text-white shadow-md font-mono text-xs">
                <div className="flex items-center gap-2 border-b border-[#333] pb-3 mb-3 text-[11px] text-[#00FF41]">
                  <Send className="h-3.5 w-3.5" />
                  <span>AI Pulse Daily Digest Bot • TELEGRAM PAYLOAD</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-[#DDD] font-mono text-xs">
                  {currentDigest.telegramMarkdown}
                </div>
              </div>

              {userChatId && (
                <div className="rounded-lg border border-neutral-200 dark:border-[#2A2A2A] bg-neutral-50 dark:bg-[#141414] p-3 text-xs text-neutral-600 dark:text-[#AAA] flex items-center justify-between font-mono">
                  <span>Chat ID: <strong className="text-neutral-900 dark:text-white">{userChatId}</strong></span>
                  <span className="text-[10px] text-neutral-400">Configured in Telegram Hub</span>
                </div>
              )}
            </div>
          )}

          {/* Active Tab 3: Configuration & Regeneration */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-700 dark:text-[#AAA]">
                  Thematic Vectors to Aggregate:
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {allCategories.map((cat) => {
                    const isSelected = selectedCats.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCat(cat)}
                        className={`rounded-sm px-3 py-1.5 text-xs font-mono transition-all border ${
                          isSelected
                            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-bold'
                            : 'border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:border-[#333] dark:bg-[#181818] dark:text-[#888]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-700 dark:text-[#AAA]">
                  Synthesis Instructions for Gemini:
                </label>
                <input
                  type="text"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  placeholder="e.g. Focus on local open weights, benchmark comparisons, and inference silicon"
                  className="mt-2 w-full rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-xs text-neutral-900 focus:border-black focus:outline-none dark:border-[#333] dark:bg-[#161616] dark:text-white"
                />
              </div>

              <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50 dark:border-[#222] dark:bg-[#141414]">
                <h5 className="text-xs font-mono uppercase tracking-wider text-neutral-900 dark:text-white">
                  Active Alert Triggers
                </h5>
                <p className="mt-1 text-[11px] text-neutral-500 font-mono">
                  Articles matching these tags receive highest editorial weighting:
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {trackedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-sm bg-neutral-200 dark:bg-[#222] px-2 py-0.5 text-[10px] font-mono text-neutral-800 dark:text-[#CCC] border border-neutral-300 dark:border-[#333]"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50/90 px-6 py-4 dark:border-[#222] dark:bg-[#121212]">
          <div className="flex items-center gap-3">
            {/* Export PDF */}
            <button
              onClick={handleExportPdf}
              disabled={!currentDigest}
              className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-mono uppercase tracking-wider text-neutral-700 hover:bg-neutral-100 dark:border-[#333] dark:bg-[#181818] dark:text-[#CCC] dark:hover:bg-[#222] disabled:opacity-50"
              title="Download structured PDF report"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t.exportPdf}</span>
            </button>

            {/* Re-generate Digest */}
            <button
              onClick={() => onGenerateDigest({
                categories: selectedCats,
                keywords: trackedKeywords,
                language,
                customFocus
              })}
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-100 px-4 py-2 text-xs font-mono uppercase tracking-wider text-neutral-800 hover:bg-neutral-200 dark:border-[#333] dark:bg-[#202020] dark:text-[#DDD] dark:hover:bg-[#2A2A2A] disabled:opacity-50"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin text-[#00FF41]' : ''}`} />
              <span>{isGenerating ? t.generating : 'Regenerate'}</span>
            </button>
          </div>

          {/* Send to Telegram button */}
          <button
            onClick={handleSendTelegram}
            disabled={!currentDigest || isSendingTelegram}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-black px-6 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5] active:scale-95 disabled:opacity-50 transition-all"
          >
            <Send className={`h-3 w-3 ${isSendingTelegram ? 'animate-bounce' : ''}`} />
            <span>{isSendingTelegram ? 'Transmitting...' : t.sendToTelegram}</span>
          </button>
        </div>

        {/* Telegram Success Notification Toast */}
        {telegramSuccessToast && (
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-[#00FF41] px-4 py-2 text-xs font-mono font-bold text-black shadow-xl animate-in slide-in-from-top">
            <CheckCircle2 className="h-4 w-4 text-black" />
            <span>TRANSMITTED TO TELEGRAM BOT</span>
          </div>
        )}
      </div>
    </div>
  );
};
