import React, { useEffect, useState, useRef } from 'react';
import { X, CheckCircle2, Shield, User, LogOut, Sparkles } from 'lucide-react';
import { UserPreferences, LanguageCode } from '../types.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserPreferences | null;
  onUserAuthenticated: (user: Partial<UserPreferences>) => void;
  onLogout: () => void;
  language: LanguageCode;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserAuthenticated,
  onLogout,
  language
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  const gsiRef = useRef<HTMLDivElement>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if google.accounts.id is available from index.html script
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && gsiRef.current) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: '915569913007-demo.apps.googleusercontent.com', // Safe demo or user client ID
          callback: async (response: any) => {
            if (response.credential) {
              setIsLoading(true);
              try {
                const res = await fetch('/api/auth/google-verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ credential: response.credential })
                });
                const data = await res.json();
                if (data.success && data.user) {
                  onUserAuthenticated({
                    userId: data.user.userId,
                    email: data.user.email,
                    name: data.user.name,
                    picture: data.user.picture
                  });
                  onClose();
                }
              } catch (err) {
                console.error('Google token verification error:', err);
              } finally {
                setIsLoading(false);
              }
            }
          }
        });

        (window as any).google.accounts.id.renderButton(gsiRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'rectangular'
        });
      } catch (e) {
        console.warn('GSI init notice:', e);
      }
    }
  }, [isOpen]);

  const handleQuickSignIn = (email: string, name: string) => {
    onUserAuthenticated({
      userId: `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      name,
      picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
    });
    onClose();
  };

  const handleCustomSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;
    const name = manualName.trim() || manualEmail.split('@')[0];
    handleQuickSignIn(manualEmail.trim(), name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-7 shadow-2xl dark:border-[#2A2A2A] dark:bg-[#0E0E0E] text-neutral-900 dark:text-[#F0F0F0]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#222] dark:hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
            <Shield className="h-5 w-5" />
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] font-mono text-neutral-500 dark:text-[#777]">
            CREDENTIAL SYNC
          </p>
          <h3 className="mt-1 text-2xl font-serif italic font-bold text-neutral-900 dark:text-white">
            {currentUser?.email ? 'Subscriber Profile' : 'Google Identity Sync'}
          </h3>
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-[#888]">
            Persistent storage of custom AI vectors, alert keywords, and Telegram channel bindings.
          </p>
        </div>

        {currentUser?.email ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3.5 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-[#222] dark:bg-[#141414]">
              {currentUser.picture ? (
                <img
                  src={currentUser.picture}
                  alt={currentUser.name || 'User'}
                  className="h-11 w-11 rounded-full object-cover border border-neutral-300 dark:border-[#333]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-white font-mono font-bold text-base dark:bg-white dark:text-black">
                  {(currentUser.name || currentUser.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="text-sm font-serif font-bold text-neutral-900 dark:text-white truncate">
                  {currentUser.name || 'Subscriber'}
                </h4>
                <p className="text-xs font-mono text-neutral-500 dark:text-[#888] truncate">
                  {currentUser.email}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-[#00FF41]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>SYNC STATE: SYNCHRONIZED</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-neutral-600 dark:text-[#AAA] rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-[#222] dark:bg-[#141414]">
              <div className="flex justify-between">
                <span>Active Triggers:</span>
                <strong className="text-neutral-900 dark:text-white">{currentUser.alertKeywords?.length || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span>Telegram Chat ID:</span>
                <strong className="text-neutral-900 dark:text-white">{currentUser.telegramChatId || 'Not Configured'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Subscribed Vectors:</span>
                <strong className="text-neutral-900 dark:text-white">{currentUser.selectedCategories?.length || 0}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 py-2.5 text-xs font-mono uppercase text-neutral-700 hover:bg-neutral-100 dark:border-[#333] dark:text-[#CCC] dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Google Identity Services Container */}
            <div className="flex justify-center" ref={gsiRef}></div>

            {/* Quick 1-Click Login options */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-[#222]"></div>
              </div>
              <span className="relative bg-white px-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:bg-[#0E0E0E] dark:text-[#666]">
                or fast dev identity
              </span>
            </div>

            <button
              onClick={() => handleQuickSignIn('iamfakhriddin@gmail.com', 'Fakhriddin')}
              className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-left hover:border-black dark:border-[#222] dark:bg-[#141414] dark:hover:border-white transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white font-serif font-bold text-xs dark:bg-white dark:text-black">
                  F
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                    iamfakhriddin@gmail.com
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 dark:text-[#777]">
                    Developer Profile
                  </div>
                </div>
              </div>
              <Sparkles className="h-4 w-4 text-[#00FF41]" />
            </button>

            {/* Custom email form */}
            <form onSubmit={handleCustomSignIn} className="space-y-2 border-t border-neutral-200 pt-3 dark:border-[#222]">
              <input
                type="email"
                required
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="Or enter any Google Workspace email"
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 focus:border-black focus:outline-none dark:border-[#333] dark:bg-[#141414] dark:text-white font-mono"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-black py-2.5 text-xs font-mono uppercase font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5] transition-colors"
              >
                Authenticate & Sync
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
