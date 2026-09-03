import React, { useState } from 'react';
import {
  Activity,
  Layers,
  FileText,
  Archive,
  Filter,
  Send,
  Smartphone,
  Sun,
  Moon,
  Globe,
  Download,
  Wifi,
  WifiOff,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';
import { LanguageCode, UserPreferences } from '../types.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isOnline: boolean;
  user: UserPreferences | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenDigestModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange,
  theme,
  onToggleTheme,
  isOnline,
  user,
  onOpenAuth,
  onLogout,
  onOpenDigestModal
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  const { isInstallable, install } = usePWAInstall();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: Layers },
    { id: 'digest', label: t.navDigest, icon: FileText },
    { id: 'archive', label: t.navArchive, icon: Archive },
    { id: 'filters', label: t.navFilters, icon: Filter },
    { id: 'telegram', label: t.navTelegram, icon: Send },
    { id: 'mobile_api', label: t.navMobileApi, icon: Smartphone }
  ];

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-[#FAFAFA]/95 backdrop-blur-md dark:border-[#2A2A2A] dark:bg-[#0A0A0A]/95 transition-colors">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand with Editorial Serif Italic styling */}
        <div className="flex items-center gap-8 lg:gap-12">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none group"
            id="brand-logo-btn"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-[#1A1A1A] dark:text-[#F0F0F0] border border-neutral-300 dark:border-[#333] transition-transform group-hover:scale-105">
              <span className="font-serif italic font-bold text-base tracking-tight">AI</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-serif italic tracking-tight font-bold text-neutral-900 dark:text-[#F0F0F0]">
                  AI / SYNOPSIS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" title="Live editorial feed"></span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-500 dark:text-[#777]">
                Autonomous Observer
              </p>
            </div>
          </button>

          {/* Primary Navigation Tabs - Editorial Tracked Uppercase */}
          <nav className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.2em]">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-1 transition-colors font-medium ${
                    isActive
                      ? 'text-neutral-900 dark:text-[#FFFFFF] border-b-2 border-neutral-900 dark:border-[#FFFFFF]'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-[#888888] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick AI Digest / Briefing Trigger Button - Editorial High-Contrast Pill */}
          <button
            onClick={onOpenDigestModal}
            id="quick-digest-btn"
            className="flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[#FFFFFF] dark:text-[#000000] dark:hover:bg-[#E5E5E5] px-4 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs"
            title="Generate or view today's AI summary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] sm:text-xs tracking-wider">{t.navDigest}</span>
          </button>

          {/* Online / System Signal status */}
          <div
            title={isOnline ? t.onlineBadge : t.offlineBadge}
            className="hidden sm:flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100/70 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-600 dark:border-[#2A2A2A] dark:bg-[#141414] dark:text-[#888888]"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-[#00FF41] shadow-[0_0_8px_#00FF41]' : 'bg-amber-500 animate-pulse'
              }`}
            ></span>
            <span>{isOnline ? 'SYS: ONLINE' : 'SYS: CACHED'}</span>
          </div>

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={install}
              id="pwa-install-nav-btn"
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 dark:border-[#333] dark:bg-[#141414] dark:text-[#CCC] dark:hover:bg-[#1E1E1E]"
            >
              <Download className="h-3 w-3" />
              <span>{t.installApp}</span>
            </button>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button
              id="lang-selector-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-mono text-neutral-700 hover:bg-neutral-50 dark:border-[#333] dark:bg-[#141414] dark:text-[#AAA] dark:hover:bg-[#1E1E1E]"
            >
              <Globe className="h-3 w-3 text-neutral-400 dark:text-[#777]" />
              <span className="uppercase text-[11px] font-semibold">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-[#333] dark:bg-[#141414] z-50 animate-in fade-in">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                      language === lang.code
                        ? 'bg-neutral-100 text-black dark:bg-[#222] dark:text-white font-bold'
                        : 'text-neutral-700 hover:bg-neutral-50 dark:text-[#AAA] dark:hover:bg-[#1A1A1A]'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 hover:bg-neutral-50 dark:border-[#333] dark:bg-[#141414] dark:text-[#AAA] dark:hover:bg-[#1E1E1E]"
            title={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-amber-300" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-neutral-700" />
            )}
          </button>

          {/* Google Auth / Profile - Editorial Pill */}
          <div className="relative">
            {user && user.email ? (
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1.5 dark:border-[#333] dark:bg-[#1A1A1A] hover:border-neutral-400 dark:hover:border-[#555] transition-colors"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="h-5 w-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white dark:bg-[#4285F4]">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-medium text-neutral-800 dark:text-[#E0E0E0] max-w-[130px] truncate">
                  {user.email}
                </span>
              </button>
            ) : (
              <button
                id="google-signin-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 dark:border-[#333] dark:bg-[#1A1A1A] dark:text-[#E0E0E0] dark:hover:bg-[#222] transition-colors"
              >
                <div className="w-4 h-4 bg-[#4285F4] rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                  G
                </div>
                <span className="hidden sm:inline text-xs font-medium">{t.googleLogin}</span>
              </button>
            )}

            {showUserMenu && user && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-[#333] dark:bg-[#141414] z-50">
                <div className="border-b border-neutral-100 px-3 py-2 dark:border-[#222]">
                  <p className="text-xs font-serif italic font-bold text-neutral-900 dark:text-white truncate">
                    {user.name || 'Subscriber'}
                  </p>
                  <p className="text-[11px] font-mono text-neutral-500 dark:text-[#777] truncate">
                    {user.email}
                  </p>
                  {user.telegramChatId && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-[#00FF41]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
                      <span>TG: {user.telegramChatId}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    onSelectTab('filters');
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-[#CCC] dark:hover:bg-[#222] mt-1"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>{t.navFilters}</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:text-rose-400 dark:hover:bg-rose-950/30 mt-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t.logout}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation Bar - Tracked Uppercase Editorial */}
      <div className="flex md:hidden overflow-x-auto border-t border-neutral-200 px-4 py-2 dark:border-[#2A2A2A] gap-4 scrollbar-none text-[10px] uppercase tracking-[0.15em]">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`shrink-0 py-1 font-medium transition-colors ${
                isActive
                  ? 'text-neutral-900 dark:text-white border-b border-neutral-900 dark:border-white'
                  : 'text-neutral-500 dark:text-[#777]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
