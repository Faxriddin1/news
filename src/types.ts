export type Category = 'LLM' | 'Vision' | 'Robotics' | 'OpenSource' | 'Hardware' | 'Ethics' | 'Agents';

export type Importance = 'critical' | 'high' | 'medium';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: Category;
  source: string;
  url: string;
  publishedAt: string;
  importance: Importance;
  tags: string[];
  readTimeMin: number;
}

export interface DigestHighlight {
  category: string;
  title: string;
  summary: string;
  source: string;
  impact: string;
}

export interface DailyDigest {
  id: string;
  generatedAt: string;
  dateStr: string;
  headline: string;
  executiveSummary: string[];
  keyHighlights: DigestHighlight[];
  telegramMarkdown: string;
  articleIds: string[];
  language: string;
  filtersUsed: {
    categories: string[];
    keywords: string[];
  };
}

export interface UserPreferences {
  userId: string;
  email?: string;
  name?: string;
  picture?: string;
  telegramChatId: string;
  telegramBotToken: string;
  autoSendTelegram: boolean;
  dispatchTime: string;
  selectedCategories: string[];
  alertKeywords: string[];
  preferredLanguage: string;
  theme: 'dark' | 'light' | 'system';
  realtimeAlertsEnabled: boolean;
  bookmarkedIds: string[];
}

export type LanguageCode = 'ru' | 'en' | 'es' | 'de' | 'zh';

export interface AlertNotification {
  id: string;
  title: string;
  summary: string;
  category: Category;
  keywordMatch?: string;
  timestamp: string;
  read: boolean;
}
