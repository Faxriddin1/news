import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { OfflineBanner } from './components/OfflineBanner.tsx';
import { RealtimeAlertsToast } from './components/RealtimeAlertsToast.tsx';
import { NewsDashboard } from './components/NewsDashboard.tsx';
import { DigestModal } from './components/DigestModal.tsx';
import { DigestArchive } from './components/DigestArchive.tsx';
import { TelegramBotHub } from './components/TelegramBotHub.tsx';
import { FiltersAndAlertsView } from './components/FiltersAndAlertsView.tsx';
import { MobileApiExplorer } from './components/MobileApiExplorer.tsx';
import { GoogleAuthModal } from './components/GoogleAuthModal.tsx';

import {
  NewsArticle,
  DailyDigest,
  UserPreferences,
  LanguageCode,
  Category,
  AlertNotification
} from './types.ts';
import { OfflineStore } from './utils/offlineStore.ts';
import { INITIAL_ARTICLES, SAMPLE_DIGEST } from '../server/newsData.ts';

export default function App() {
  // Navigation & Theme
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [language, setLanguage] = useState<LanguageCode>('ru');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Modals
  const [isDigestModalOpen, setIsDigestModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data states
  const [articles, setArticles] = useState<NewsArticle[]>(() => {
    const cached = OfflineStore.loadNews();
    return cached && cached.length > 0 ? cached : INITIAL_ARTICLES;
  });

  const [currentDigest, setCurrentDigest] = useState<DailyDigest | null>(() => {
    const cached = OfflineStore.loadDigests();
    return cached && cached.length > 0 ? cached[0] : SAMPLE_DIGEST;
  });

  const [digestArchive, setDigestArchive] = useState<DailyDigest[]>(() => {
    const cached = OfflineStore.loadDigests();
    return cached && cached.length > 0 ? cached : [SAMPLE_DIGEST];
  });

  // User Preferences
  const [user, setUser] = useState<UserPreferences>(() => {
    const cached = OfflineStore.loadPreferences();
    return (
      cached || {
        userId: 'google_iamfakhriddin_gmail_com',
        email: 'iamfakhriddin@gmail.com',
        name: 'Fakhriddin',
        picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fakhriddin',
        telegramChatId: '',
        telegramBotToken: '',
        autoSendTelegram: false,
        dispatchTime: '09:00',
        selectedCategories: ['LLM', 'OpenSource', 'Robotics', 'Agents'],
        alertKeywords: ['DeepSeek', 'Claude 3.7', 'Gemini', 'Nvidia', 'Robot'],
        preferredLanguage: 'ru',
        theme: 'dark',
        realtimeAlertsEnabled: true,
        bookmarkedIds: ['art-1', 'art-3']
      }
    );
  });

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedImportance, setSelectedImportance] = useState<string>('ALL');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);

  // Loading flags
  const [isFetchingNews, setIsFetchingNews] = useState<boolean>(false);
  const [isGeneratingDigest, setIsGeneratingDigest] = useState<boolean>(false);
  const [isSendingTelegram, setIsSendingTelegram] = useState<boolean>(false);

  // Real-time Alerts queue
  const [alertsQueue, setAlertsQueue] = useState<AlertNotification[]>([]);

  // Apply dark mode class on document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync Preferences to LocalStorage and Server
  const savePreferences = useCallback(
    async (updated: Partial<UserPreferences>) => {
      const merged: UserPreferences = { ...user, ...updated };
      setUser(merged);
      OfflineStore.savePreferences(merged);

      if (isOnline) {
        try {
          await fetch('/api/v1/user/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(merged)
          });
        } catch (err) {
          console.warn('Failed to sync preferences to server:', err);
        }
      }
    },
    [user, isOnline]
  );

  // Fetch News from Backend
  const fetchNews = useCallback(async () => {
    if (!isOnline) return;
    setIsFetchingNews(true);
    try {
      const res = await fetch('/api/v1/news?limit=30');
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
          OfflineStore.saveNews(data.articles);
        }
      }
    } catch (err) {
      console.warn('Error fetching fresh news:', err);
    } finally {
      setIsFetchingNews(false);
    }
  }, [isOnline]);

  // Fetch Daily Summary on startup
  useEffect(() => {
    async function loadLatestDigest() {
      try {
        const res = await fetch('/api/v1/summary/daily');
        if (res.ok) {
          const data = await res.json();
          if (data.digest) {
            setCurrentDigest(data.digest);
            setDigestArchive((prev) => {
              const exists = prev.some((d) => d.id === data.digest.id);
              const next = exists ? prev : [data.digest, ...prev];
              OfflineStore.saveDigests(next);
              return next;
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch daily summary:', err);
      }
    }
    loadLatestDigest();
  }, []);

  // Server-Sent Events (SSE) for real-time news alerts
  useEffect(() => {
    if (!isOnline) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream/alerts');

      eventSource.addEventListener('news', (event) => {
        try {
          const newArticle: NewsArticle = JSON.parse(event.data);

          // Add to articles if not present
          setArticles((prev) => {
            if (prev.some((a) => a.id === newArticle.id)) return prev;
            const updated = [newArticle, ...prev];
            OfflineStore.saveNews(updated);
            return updated;
          });

          // Check for keyword matches
          const matchedKw = user.alertKeywords.find(
            (kw) =>
              newArticle.title.toLowerCase().includes(kw.toLowerCase()) ||
              newArticle.tags.some((t) => t.toLowerCase().includes(kw.toLowerCase()))
          );

          if (user.realtimeAlertsEnabled && (matchedKw || newArticle.importance === 'critical')) {
            const toast: AlertNotification = {
              id: `alert-${Date.now()}-${Math.random()}`,
              title: newArticle.title,
              summary: newArticle.summary,
              category: newArticle.category,
              keywordMatch: matchedKw,
              timestamp: new Date().toISOString(),
              read: false
            };
            setAlertsQueue((prev) => [toast, ...prev.slice(0, 4)]);
          }
        } catch (e) {
          console.warn('SSE parse error:', e);
        }
      });
    } catch (e) {
      console.warn('SSE initialization error:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isOnline, user.alertKeywords, user.realtimeAlertsEnabled]);

  // Generate Digest using Gemini server endpoint
  const handleGenerateDigest = async (options: {
    categories: string[];
    keywords: string[];
    language: string;
    customFocus: string;
  }) => {
    setIsGeneratingDigest(true);
    try {
      const res = await fetch('/api/digest/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      const data = await res.json();
      if (data.success && data.digest) {
        setCurrentDigest(data.digest);
        setDigestArchive((prev) => {
          const updated = [data.digest, ...prev.filter((d) => d.id !== data.digest.id)];
          OfflineStore.saveDigests(updated);
          return updated;
        });
      }
    } catch (e) {
      console.error('Failed to generate digest with Gemini:', e);
    } finally {
      setIsGeneratingDigest(false);
    }
  };

  // Send single article or digest to Telegram
  const handleSendDigestToTelegram = async (digest: DailyDigest) => {
    setIsSendingTelegram(true);
    try {
      await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: user.telegramBotToken,
          chatId: user.telegramChatId,
          text: digest.telegramMarkdown,
          simulate: !user.telegramBotToken || !user.telegramChatId
        })
      });
    } catch (e) {
      console.error('Error sending digest to Telegram:', e);
    } finally {
      setIsSendingTelegram(false);
    }
  };

  const handleSendArticleToTelegram = async (article: NewsArticle) => {
    const text = `⚡ *${article.title}*\n\n${article.summary}\n\n📂 Категория: #${article.category} | Чтение: ${article.readTimeMin} мин\n🔗 [Читать подробнее](${article.url})`;
    try {
      await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: user.telegramBotToken,
          chatId: user.telegramChatId,
          text,
          simulate: !user.telegramBotToken || !user.telegramChatId
        })
      });
      alert(`Новость «${article.title.slice(0, 30)}...» отправлена в Telegram!`);
    } catch {
      alert('Ошибка при отправке в Telegram');
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = (articleId: string) => {
    const isBookmarked = user.bookmarkedIds.includes(articleId);
    const updatedIds = isBookmarked
      ? user.bookmarkedIds.filter((id) => id !== articleId)
      : [...user.bookmarkedIds, articleId];

    savePreferences({ bookmarkedIds: updatedIds });
  };

  // Filtered Articles calculation
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Category filter
      if (selectedCategory !== 'ALL' && art.category !== selectedCategory) {
        return false;
      }
      // Importance filter
      if (selectedImportance !== 'ALL' && art.importance !== selectedImportance) {
        return false;
      }
      // Bookmarks filter
      if (showBookmarksOnly && !user.bookmarkedIds.includes(art.id)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesSummary = art.summary.toLowerCase().includes(q);
        const matchesTag = art.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesTag) return false;
      }
      return true;
    });
  }, [articles, selectedCategory, selectedImportance, showBookmarksOnly, user.bookmarkedIds, searchQuery]);

  // Categories count
  const categoriesCount = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [articles]);

  const allCategoryList: Category[] = [
    'LLM',
    'Agents',
    'OpenSource',
    'Robotics',
    'Hardware',
    'Vision',
    'Ethics'
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans text-neutral-900 transition-colors duration-200 dark:bg-[#0A0A0A] dark:text-[#F0F0F0] flex flex-col">
      {/* Offline Status Warning Banner */}
      <OfflineBanner isOnline={isOnline} language={language} onRefresh={fetchNews} />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onLanguageChange={(lang) => {
          setLanguage(lang);
          savePreferences({ preferredLanguage: lang });
        }}
        theme={theme}
        onToggleTheme={() => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          savePreferences({ theme: next });
        }}
        isOnline={isOnline}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          savePreferences({
            email: undefined,
            name: undefined,
            picture: undefined
          });
        }}
        onOpenDigestModal={() => setIsDigestModalOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {currentTab === 'dashboard' && (
          <NewsDashboard
            articles={filteredArticles}
            categoriesCount={categoriesCount}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedImportance={selectedImportance}
            onSelectImportance={setSelectedImportance}
            showBookmarksOnly={showBookmarksOnly}
            onToggleBookmarksOnly={() => setShowBookmarksOnly((prev) => !prev)}
            bookmarkedIds={user.bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onFetchLatest={fetchNews}
            isFetching={isFetchingNews}
            onSendToTelegram={handleSendArticleToTelegram}
            onOpenDigestModal={() => setIsDigestModalOpen(true)}
            language={language}
            trackedKeywords={user.alertKeywords}
          />
        )}

        {currentTab === 'digest' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-200 dark:border-[#2A2A2A] pb-6 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 dark:text-[#888888] mb-2">
                  Autonomous Intelligence Briefing
                </p>
                <h1 className="text-4xl sm:text-6xl font-serif italic font-bold tracking-tight text-neutral-900 dark:text-[#F0F0F0] leading-none">
                  The AI Observer
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-3xl font-light font-serif text-neutral-900 dark:text-[#F0F0F0]">
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-[#666]">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => setIsDigestModalOpen(true)}
                  className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 dark:bg-[#FFFFFF] dark:text-[#000000] dark:hover:bg-[#E5E5E5] transition-all"
                >
                  Full Document
                </button>
              </div>
            </div>

            {currentDigest && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs dark:border-[#2A2A2A] dark:bg-[#111111] space-y-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-6 dark:border-[#222]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00FF41]">
                      DISPATCH • {currentDigest.dateStr}
                    </span>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-serif italic text-neutral-900 dark:text-[#F0F0F0] leading-snug">
                      {currentDigest.headline}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => handleSendDigestToTelegram(currentDigest)}
                      disabled={isSendingTelegram}
                      className="flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-200 dark:border-[#333] dark:bg-[#1A1A1A] dark:text-[#E0E0E0] dark:hover:bg-[#252525] transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
                      <span>Send to Telegram</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 dark:text-[#777] mb-3">
                    Executive Synopsis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentDigest.executiveSummary.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-4 text-xs text-neutral-700 dark:border-[#222] dark:bg-[#161616] dark:text-[#CCC] flex items-start gap-3"
                      >
                        <span className="font-mono text-xs font-bold text-neutral-400 dark:text-[#666]">
                          0{idx + 1}
                        </span>
                        <span className="leading-relaxed">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 dark:text-[#777] mb-3">
                    Critical Developments
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentDigest.keyHighlights.map((hl, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-neutral-200 p-4 dark:border-[#222] dark:bg-[#141414] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="rounded-sm border border-neutral-300 bg-neutral-200/60 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-neutral-800 dark:border-[#333] dark:bg-[#222] dark:text-[#AAA]">
                              {hl.category}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 dark:text-[#666]">{hl.source}</span>
                          </div>
                          <h4 className="text-sm font-serif font-bold text-neutral-900 dark:text-white leading-snug">
                            {hl.title}
                          </h4>
                          <p className="mt-2 text-xs text-neutral-600 dark:text-[#999] leading-relaxed">
                            {hl.summary}
                          </p>
                        </div>
                        {hl.impact && (
                          <div className="mt-3 border-t border-neutral-100 pt-2 dark:border-[#222]">
                            <span className="text-[10px] font-mono text-neutral-500 dark:text-[#777]">Impact: </span>
                            <span className="text-[11px] text-neutral-700 dark:text-[#BBB]">{hl.impact}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'archive' && (
          <DigestArchive
            digests={digestArchive}
            onOpenDigest={(d) => {
              setCurrentDigest(d);
              setIsDigestModalOpen(true);
            }}
            onSendDigestToTelegram={handleSendDigestToTelegram}
            onGenerateNew={() => setIsDigestModalOpen(true)}
            language={language}
          />
        )}

        {currentTab === 'filters' && (
          <FiltersAndAlertsView
            preferences={user}
            onSavePreferences={savePreferences}
            categoriesCount={categoriesCount}
            language={language}
          />
        )}

        {currentTab === 'telegram' && (
          <TelegramBotHub
            preferences={user}
            onUpdatePreferences={savePreferences}
            latestDigest={currentDigest}
            language={language}
          />
        )}

        {currentTab === 'mobile_api' && <MobileApiExplorer language={language} />}
      </main>

      {/* Editorial Aesthetic Terminal Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-100 dark:border-[#2A2A2A] dark:bg-[#000000] py-4 px-4 sm:px-8 text-neutral-500 dark:text-[#666666] text-xs">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></span>
              <span className="text-neutral-700 dark:text-[#888888]">Live Feed: ONLINE</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-neutral-400 dark:text-[#555555]">|</span>
              <span>Cache: 99.4% Synchronized</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-neutral-400 dark:text-[#555555]">|</span>
              <span>Gemini 3.8 Flash • Latency 14ms</span>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-[#555555] font-mono">
            © 2025 AI/SYNOPSIS TERMINAL
          </div>
        </div>
      </footer>

      {/* Daily Digest Modal */}
      <DigestModal
        isOpen={isDigestModalOpen}
        onClose={() => setIsDigestModalOpen(false)}
        currentDigest={currentDigest}
        onGenerateDigest={handleGenerateDigest}
        isGenerating={isGeneratingDigest}
        onSendDigestToTelegram={handleSendDigestToTelegram}
        isSendingTelegram={isSendingTelegram}
        language={language}
        allCategories={allCategoryList}
        trackedKeywords={user.alertKeywords}
        userChatId={user.telegramChatId}
      />

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onUserAuthenticated={(authUser) => {
          savePreferences(authUser);
        }}
        onLogout={() => {
          savePreferences({
            email: undefined,
            name: undefined,
            picture: undefined
          });
        }}
        language={language}
      />

      {/* Real-time Alerts Toast */}
      <RealtimeAlertsToast
        alerts={alertsQueue}
        onDismiss={(id) => setAlertsQueue((prev) => prev.filter((a) => a.id !== id))}
        onSelectArticle={(articleId) => {
          setSelectedCategory('ALL');
          setSearchQuery('');
          setCurrentTab('dashboard');
        }}
      />
    </div>
  );
}
