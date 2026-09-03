import { NewsArticle, DailyDigest, UserPreferences } from '../types.ts';

const NEWS_CACHE_KEY = 'aipulse_cached_news_v1';
const DIGESTS_CACHE_KEY = 'aipulse_cached_digests_v1';
const PREFS_CACHE_KEY = 'aipulse_user_preferences_v1';
const LAST_SYNC_KEY = 'aipulse_last_sync_time';

export const OfflineStore = {
  saveNews(articles: NewsArticle[]) {
    try {
      localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(articles));
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch (e) {
      console.warn('LocalStorage saveNews error:', e);
    }
  },

  loadNews(): NewsArticle[] | null {
    try {
      const data = localStorage.getItem(NEWS_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('LocalStorage loadNews error:', e);
      return null;
    }
  },

  saveDigests(digests: DailyDigest[]) {
    try {
      localStorage.setItem(DIGESTS_CACHE_KEY, JSON.stringify(digests));
    } catch (e) {
      console.warn('LocalStorage saveDigests error:', e);
    }
  },

  loadDigests(): DailyDigest[] | null {
    try {
      const data = localStorage.getItem(DIGESTS_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('LocalStorage loadDigests error:', e);
      return null;
    }
  },

  savePreferences(prefs: UserPreferences) {
    try {
      localStorage.setItem(PREFS_CACHE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('LocalStorage savePreferences error:', e);
    }
  },

  loadPreferences(): UserPreferences | null {
    try {
      const data = localStorage.getItem(PREFS_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('LocalStorage loadPreferences error:', e);
      return null;
    }
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem(LAST_SYNC_KEY);
  }
};
