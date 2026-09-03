import React, { useState, useMemo } from 'react';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Send,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Clock,
  Tag,
  Share2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  Bot,
  Terminal,
  ShieldAlert,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { NewsArticle, Category, Importance, LanguageCode } from '../types.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface NewsDashboardProps {
  articles: NewsArticle[];
  categoriesCount: Record<string, number>;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedImportance: string;
  onSelectImportance: (imp: string) => void;
  showBookmarksOnly: boolean;
  onToggleBookmarksOnly: () => void;
  bookmarkedIds: string[];
  onToggleBookmark: (articleId: string) => void;
  onFetchLatest: () => Promise<void>;
  isFetching: boolean;
  onSendToTelegram: (article: NewsArticle) => void;
  onOpenDigestModal: () => void;
  language: LanguageCode;
  trackedKeywords: string[];
}

export const NewsDashboard: React.FC<NewsDashboardProps> = ({
  articles,
  categoriesCount,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedImportance,
  onSelectImportance,
  showBookmarksOnly,
  onToggleBookmarksOnly,
  bookmarkedIds,
  onToggleBookmark,
  onFetchLatest,
  isFetching,
  onSendToTelegram,
  onOpenDigestModal,
  language,
  trackedKeywords
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'ALL', label: t.categoryAll, icon: SlidersHorizontal },
    { id: 'LLM', label: t.categoryLLM, icon: Terminal },
    { id: 'Agents', label: t.categoryAgents, icon: Bot },
    { id: 'OpenSource', label: t.categoryOpenSource, icon: Sparkles },
    { id: 'Robotics', label: t.categoryRobotics, icon: Bot },
    { id: 'Hardware', label: t.categoryHardware, icon: Cpu },
    { id: 'Vision', label: t.categoryVision, icon: Eye },
    { id: 'Ethics', label: t.categoryEthics, icon: ShieldAlert }
  ];

  const handleCopy = (article: NewsArticle) => {
    navigator.clipboard.writeText(`${article.title}\n\n${article.summary}\n\nИсточник: ${article.source}`);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadgeClass = (category: Category) => {
    switch (category) {
      case 'LLM':
        return 'border-neutral-300 bg-neutral-200 text-neutral-800 dark:border-[#333] dark:bg-[#222] dark:text-[#E0E0E0]';
      case 'Agents':
        return 'border-neutral-300 bg-neutral-200 text-neutral-800 dark:border-[#333] dark:bg-[#222] dark:text-[#E0E0E0]';
      case 'OpenSource':
        return 'border-neutral-300 bg-neutral-200 text-neutral-800 dark:border-[#333] dark:bg-[#222] dark:text-[#E0E0E0]';
      case 'Robotics':
        return 'border-neutral-300 bg-neutral-200 text-neutral-800 dark:border-[#333] dark:bg-[#222] dark:text-[#E0E0E0]';
      case 'Hardware':
        return 'border-neutral-300 bg-neutral-200 text-neutral-800 dark:border-[#333] dark:bg-[#222] dark:text-[#E0E0E0]';
      case 'Vision':
        return 'border-neutral-300 bg-neutral-200 text-neutral-800 dark:border-[#333] dark:bg-[#222] dark:text-[#E0E0E0]';
      case 'Ethics':
        return 'border-neutral-300 bg-neutral-200 text-neutral-800 dark:border-[#333] dark:bg-[#222] dark:text-[#E0E0E0]';
      default:
        return 'border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-[#333] dark:bg-[#1A1A1A] dark:text-[#AAA]';
    }
  };

  const getImportanceBadge = (imp: Importance) => {
    if (imp === 'critical') {
      return (
        <span className="flex items-center gap-1 rounded-sm border border-rose-300 bg-rose-50 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <Flame className="h-2.5 w-2.5 text-rose-500" />
          <span>{t.importanceCritical}</span>
        </span>
      );
    }
    if (imp === 'high') {
      return (
        <span className="rounded-sm border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          {t.importanceHigh}
        </span>
      );
    }
    return (
      <span className="rounded-sm border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-neutral-600 dark:border-[#333] dark:bg-[#1A1A1A] dark:text-[#888]">
        {t.importanceMedium}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Editorial Masthead / Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-neutral-200 dark:border-[#2A2A2A] pb-6 gap-4">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 dark:text-[#888888] mb-2 font-mono">
            AUTONOMOUS INTELLIGENCE DISPATCH
          </h2>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif italic text-neutral-900 dark:text-[#F0F0F0] leading-none">
            The AI Observer
          </h1>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto">
          <div className="text-right">
            <p className="text-3xl sm:text-4xl font-light font-serif text-neutral-900 dark:text-[#F0F0F0]">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-[#666666]">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="fetch-updates-btn"
              onClick={onFetchLatest}
              disabled={isFetching}
              className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-neutral-800 hover:bg-neutral-100 dark:border-[#333] dark:bg-[#141414] dark:text-[#CCC] dark:hover:bg-[#1E1E1E] transition-all disabled:opacity-50"
              title={t.fetchLatest}
            >
              <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin text-[#00FF41]' : ''}`} />
              <span className="hidden sm:inline">{isFetching ? t.fetching : t.fetchLatest}</span>
            </button>
            <button
              id="generate-digest-hero-btn"
              onClick={onOpenDigestModal}
              className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 dark:bg-[#FFFFFF] dark:text-[#000000] dark:hover:bg-[#E5E5E5] transition-all active:scale-95"
            >
              {t.generateDailyDigest}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Articles + Editorial Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Column: Filters & Articles Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search and Filters Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 sm:p-4 shadow-2xs dark:border-[#2A2A2A] dark:bg-[#111111]">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative w-full flex-1">
                <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400 dark:text-[#666]" />
                <input
                  type="text"
                  id="news-search-input"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-xs font-sans text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-[#333] dark:bg-[#161616] dark:text-white dark:placeholder-[#666] dark:focus:border-[#666]"
                />
              </div>

              {/* Importance Filter */}
              <div className="flex w-full sm:w-auto items-center gap-2">
                <select
                  id="importance-filter-select"
                  value={selectedImportance}
                  onChange={(e) => onSelectImportance(e.target.value)}
                  aria-label={t.filterImportance}
                  className="w-full sm:w-auto rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-mono uppercase tracking-wider text-neutral-700 focus:border-neutral-900 focus:outline-none dark:border-[#333] dark:bg-[#161616] dark:text-[#CCC]"
                >
                  <option value="ALL">{t.importanceAll}</option>
                  <option value="critical">{t.importanceCritical}</option>
                  <option value="high">{t.importanceHigh}</option>
                  <option value="medium">{t.importanceMedium}</option>
                </select>

                {/* Bookmarks Toggle */}
                <button
                  id="bookmarks-toggle-btn"
                  onClick={onToggleBookmarksOnly}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    showBookmarksOnly
                      ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-[#333] dark:bg-[#161616] dark:text-[#AAA] dark:hover:bg-[#202020]'
                  }`}
                >
                  {showBookmarksOnly ? (
                    <BookmarkCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5 text-neutral-400" />
                  )}
                  <span className="text-[11px] uppercase tracking-wider">{t.bookmarksOnly}</span>
                  {bookmarkedIds.length > 0 && (
                    <span className="rounded-sm bg-neutral-200 px-1 py-0.2 text-[9px] font-mono font-bold text-neutral-800 dark:bg-[#333] dark:text-white">
                      {bookmarkedIds.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Category Pills: Editorial clean badges */}
            <div className="flex overflow-x-auto gap-1.5 pt-1 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = cat.id === 'ALL'
                  ? articles.length
                  : categoriesCount[cat.id] || 0;

                return (
                  <button
                    key={cat.id}
                    id={`cat-filter-${cat.id}`}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex shrink-0 items-center gap-1.5 px-3 py-1 text-[10px] rounded-sm transition-all ${
                      isSelected
                        ? 'bg-black text-white dark:bg-[#FFFFFF] dark:text-[#000000] font-bold shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200 dark:bg-[#222] dark:text-[#CCC] dark:border-[#333] dark:hover:bg-[#2A2A2A]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {count > 0 && (
                      <span
                        className={`rounded-xs px-1 text-[9px] font-mono ${
                          isSelected
                            ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-900'
                            : 'bg-neutral-200 text-neutral-700 dark:bg-[#333] dark:text-[#888]'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Articles Feed */}
          {articles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center dark:border-[#333]">
              <Sparkles className="mx-auto h-8 w-8 text-neutral-400 dark:text-[#666]" />
              <h3 className="mt-3 text-sm font-serif italic font-bold text-neutral-900 dark:text-[#F0F0F0]">
                {t.noArticlesFound}
              </h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-[#777]">
                Попробуйте изменить категорию или сбросить поисковый запрос
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => {
                const isBookmarked = bookmarkedIds.includes(article.id);
                const isExpanded = expandedArticleId === article.id;
                const hasKeywordMatch = trackedKeywords.some(kw =>
                  article.title.toLowerCase().includes(kw.toLowerCase()) ||
                  article.tags.some(t => t.toLowerCase().includes(kw.toLowerCase()))
                );

                return (
                  <article
                    key={article.id}
                    id={`article-card-${article.id}`}
                    className={`group relative rounded-xl border bg-white p-5 sm:p-6 transition-all hover:border-neutral-400 dark:bg-[#111111] dark:hover:border-[#444] ${
                      hasKeywordMatch
                        ? 'border-neutral-900 dark:border-[#555]'
                        : 'border-neutral-200 dark:border-[#222]'
                    }`}
                  >
                    <div>
                      {/* Top Meta Line: Timestamp, Category, Importance */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-[#777]">
                            {article.date ? new Date(article.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TODAY'} / {article.category}
                          </p>
                          {getImportanceBadge(article.importance)}
                          {hasKeywordMatch && (
                            <span className="rounded-sm bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider">
                              TRIGGER MATCH
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 dark:text-[#666]">
                          <Clock className="h-3 w-3" />
                          <span>{article.readTimeMin} MIN READ</span>
                        </div>
                      </div>

                      {/* Editorial Title */}
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 dark:text-[#F0F0F0] leading-snug group-hover:underline underline-offset-4 cursor-pointer"
                          onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}>
                        {article.title}
                      </h3>

                      {/* Summary */}
                      <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-[#999999] leading-relaxed">
                        {article.summary}
                      </p>

                      {/* Expanded Full Story Content */}
                      {isExpanded && (
                        <div className="mt-4 rounded-lg bg-neutral-50 p-4 text-xs text-neutral-700 dark:bg-[#161616] dark:text-[#CCC] border border-neutral-200 dark:border-[#2A2A2A] animate-in fade-in">
                          <p className="leading-relaxed whitespace-pre-line font-sans">{article.content}</p>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono rounded-sm border border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-[#2A2A2A] dark:bg-[#181818] dark:text-[#888]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3 dark:border-[#222] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-[#666]">
                          SRC: {article.source}
                        </span>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                          title="Open original publication"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Expand / Collapse Toggle */}
                        <button
                          onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                          className="flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-[10px] font-mono uppercase text-neutral-700 hover:bg-neutral-100 dark:border-[#333] dark:text-[#AAA] dark:hover:bg-[#202020]"
                        >
                          <span>{isExpanded ? 'Collapse' : 'Full Story'}</span>
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>

                        {/* Copy Summary */}
                        <button
                          onClick={() => handleCopy(article)}
                          className="rounded-full border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-100 dark:border-[#333] dark:text-[#888] dark:hover:bg-[#202020]"
                          title="Copy Synopsis"
                        >
                          <Share2 className="h-3 w-3" />
                        </button>

                        {/* Bookmark */}
                        <button
                          onClick={() => onToggleBookmark(article.id)}
                          className={`rounded-full border p-1.5 transition-colors ${
                            isBookmarked
                              ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-black'
                              : 'border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-[#333] dark:text-[#888] dark:hover:bg-[#202020]'
                          }`}
                          title={isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-3 w-3" />
                          ) : (
                            <Bookmark className="h-3 w-3" />
                          )}
                        </button>

                        {/* Send single article to Telegram */}
                        <button
                          onClick={() => onSendToTelegram(article)}
                          className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-neutral-800 dark:bg-[#FFF] dark:text-[#000] dark:hover:bg-[#E5E5E5] transition-colors"
                          title={t.sendToTelegram}
                        >
                          <Send className="h-2.5 w-2.5" />
                          <span>Telegram</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Editorial Sidebar (Status, Notification Keywords, System Status) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Subscription & Bot Status Panel */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-[#2A2A2A] dark:bg-[#111111] space-y-6">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 dark:text-[#666]">
              SUBSCRIPTION STATUS
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 dark:text-[#AAA] mb-1 font-serif italic">Telegram Bot Hub</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FF41]"></span>
                  <span className="text-xs font-mono font-medium uppercase tracking-tight text-neutral-800 dark:text-[#DDD]">
                    Active & Linked
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3 dark:border-[#222]">
                <p className="text-xs text-neutral-500 dark:text-[#AAA] mb-1 font-serif italic">Daily Dispatch Schedule</p>
                <p className="text-xs font-mono text-neutral-800 dark:text-[#DDD]">09:00 AM (GMT+3)</p>
              </div>

              <div className="border-t border-neutral-100 pt-3 dark:border-[#222]">
                <p className="text-xs text-neutral-500 dark:text-[#AAA] mb-2 font-serif italic">Monitored Vectors</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-neutral-200 text-neutral-800 dark:bg-[#222] dark:text-[#CCC] text-[9px] font-mono rounded-sm border border-neutral-300 dark:border-[#333]">
                    LLMs
                  </span>
                  <span className="px-2.5 py-1 bg-neutral-200 text-neutral-800 dark:bg-[#222] dark:text-[#CCC] text-[9px] font-mono rounded-sm border border-neutral-300 dark:border-[#333]">
                    Robotics
                  </span>
                  <span className="px-2.5 py-1 bg-black text-white dark:bg-[#FFF] dark:text-[#000] text-[9px] font-mono font-bold rounded-sm">
                    OpenSource
                  </span>
                  <span className="px-2.5 py-1 bg-neutral-200 text-neutral-800 dark:bg-[#222] dark:text-[#CCC] text-[9px] font-mono rounded-sm border border-neutral-300 dark:border-[#333]">
                    Hardware
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Keywords Panel */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-[#2A2A2A] dark:bg-[#111111] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 dark:text-[#888]">
                NOTIFICATION TRIGGERS
              </h4>
              <span className="text-[9px] font-mono text-[#00FF41]">AUTO-STREAM</span>
            </div>

            <div className="space-y-3">
              {trackedKeywords.slice(0, 5).map((kw, idx) => (
                <div
                  key={kw}
                  className="flex justify-between items-center border-b border-neutral-100 dark:border-[#222] pb-2.5 text-xs"
                >
                  <span className="font-serif italic font-bold text-neutral-800 dark:text-[#E0E0E0]">
                    "{kw}"
                  </span>
                  <span className="text-[9px] font-mono bg-neutral-200 dark:bg-[#333] text-neutral-700 dark:text-[#AAA] px-2 py-0.5 rounded-sm">
                    {idx % 2 === 0 ? 'Instant' : 'Daily'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div
                onClick={onOpenDigestModal}
                className="w-full bg-neutral-100 hover:bg-neutral-200/80 dark:bg-[#1A1A1A] dark:hover:bg-[#222] rounded-lg border border-neutral-200 dark:border-[#333] flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-full border border-dashed border-neutral-400 dark:border-[#555] mb-2 flex items-center justify-center text-neutral-600 dark:text-[#888] font-bold text-xs">
                  +
                </div>
                <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-[#888] font-mono">
                  Custom AI Synthesis
                </p>
              </div>
            </div>
          </div>

          {/* System Status Panel */}
          <div className="p-5 bg-neutral-100 dark:bg-[#111111] rounded-xl border border-neutral-300 dark:border-[#222]">
            <p className="text-[10px] font-mono text-[#00FF41] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping"></span>
              <span>SYSTEM STATUS • SYNCHRONIZED</span>
            </p>
            <p className="text-[11px] font-mono text-neutral-600 dark:text-[#888] leading-relaxed">
              Archive caching operational for offline PWA access. Realtime SSE alert stream active. Latency 14ms.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
