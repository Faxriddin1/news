import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Bot,
  MessageSquare,
  Key,
  Hash,
  Shield,
  Zap,
  Terminal
} from 'lucide-react';
import { UserPreferences, LanguageCode, DailyDigest } from '../types.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface TelegramBotHubProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => Promise<void>;
  latestDigest: DailyDigest | null;
  language: LanguageCode;
}

export const TelegramBotHub: React.FC<TelegramBotHubProps> = ({
  preferences,
  onUpdatePreferences,
  latestDigest,
  language
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  const [botToken, setBotToken] = useState(preferences.telegramBotToken || '');
  const [chatId, setChatId] = useState(preferences.telegramChatId || '');
  const [autoSend, setAutoSend] = useState(preferences.autoSendTelegram ?? false);
  const [dispatchTime, setDispatchTime] = useState(preferences.dispatchTime || '09:00');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    bot?: any;
  } | null>(null);

  const [isSendingTestDigest, setIsSendingTestDigest] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Interactive Telegram Chat Simulator
  const [chatHistory, setChatHistory] = useState<{
    sender: 'user' | 'bot';
    text: string;
    time: string;
  }[]>([
    {
      sender: 'bot',
      text: '👋 Привет! Я бот AI Pulse. Я готов присылать ежедневные сводки важнейших событий в мире искусственного интеллекта.',
      time: '09:00'
    },
    {
      sender: 'bot',
      text: 'Используйте /summary чтобы получить свежую сводку, или настройте ключевые слова в веб-дашборде.',
      time: '09:00'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `Ошибка запроса к серверу: ${e.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSettings = async () => {
    await onUpdatePreferences({
      telegramBotToken: botToken,
      telegramChatId: chatId,
      autoSendTelegram: autoSend,
      dispatchTime
    });
    setTestResult({
      success: true,
      message: t.preferencesSaved
    });
  };

  const handleSendDigestNow = async () => {
    if (!latestDigest) return;
    setIsSendingTestDigest(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken,
          chatId,
          text: latestDigest.telegramMarkdown,
          simulate: !botToken || !chatId
        })
      });
      const data = await res.json();
      setSendResult({
        success: data.success,
        message: data.message || (data.success ? 'Успешно отправлено!' : data.error)
      });

      // Add to simulator
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'bot',
          text: latestDigest.telegramMarkdown,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e: any) {
      setSendResult({
        success: false,
        message: `Ошибка отправки: ${e.message}`
      });
    } finally {
      setIsSendingTestDigest(false);
    }
  };

  const handleSendSimulatorMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text, time };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');

    // Send to webhook simulation
    try {
      const res = await fetch('/api/telegram/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            text,
            chat: { id: chatId || '123456789' }
          }
        })
      });
      const data = await res.json();
      if (data.simulatedReply) {
        setTimeout(() => {
          setChatHistory(prev => [
            ...prev,
            {
              sender: 'bot',
              text: data.simulatedReply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 500);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-neutral-200 dark:border-[#2A2A2A] pb-6 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 dark:text-[#888888] mb-2 font-mono">
            DISPATCH RELAY & TELEGRAM PROTOCOL
          </p>
          <h1 className="text-4xl sm:text-6xl font-serif italic text-neutral-900 dark:text-[#F0F0F0] leading-none">
            {t.telegramSettingsTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#00FF41]"></span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-[#888]">
            TELEGRAM WEBHOOK ONLINE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Col: Setup & Credentials (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-[#222] dark:bg-[#111111]">
            <h3 className="text-sm font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-neutral-700 dark:text-[#AAA]" />
              <span>Bot Identity & Channel Authentication</span>
            </h3>

            <div className="mt-4 space-y-4">
              {/* Token Input */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 dark:text-[#AAA]">
                  {t.telegramTokenLabel}
                </label>
                <div className="mt-1.5 relative">
                  <input
                    type="password"
                    id="telegram-bot-token-input"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRstuVWXyz..."
                    className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-xs text-neutral-900 focus:border-black focus:outline-none dark:border-[#333] dark:bg-[#161616] dark:text-white font-mono"
                  />
                </div>
                <p className="mt-1.5 text-[11px] font-mono text-neutral-500 dark:text-[#777]">
                  Generate token instantly via <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="underline text-neutral-800 dark:text-white inline-flex items-center gap-0.5">@BotFather <ExternalLink className="h-2.5 w-2.5" /></a>
                </p>
              </div>

              {/* Chat ID Input */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 dark:text-[#AAA]">
                  {t.telegramChatIdLabel}
                </label>
                <div className="mt-1.5">
                  <input
                    type="text"
                    id="telegram-chat-id-input"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="e.g. 987654321 or @ai_pulse_channel"
                    className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-xs text-neutral-900 focus:border-black focus:outline-none dark:border-[#333] dark:bg-[#161616] dark:text-white font-mono"
                  />
                </div>
                <p className="mt-1.5 text-[11px] font-mono text-neutral-500 dark:text-[#777]">
                  Find your numeric ID by messaging <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="underline text-neutral-800 dark:text-white inline-flex items-center gap-0.5">@userinfobot <ExternalLink className="h-2.5 w-2.5" /></a>
                </p>
              </div>

              {/* Schedule & Auto dispatch */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-[#222] dark:bg-[#161616] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-neutral-700 dark:text-[#AAA]" />
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-900 dark:text-white">
                        Autonomous Scheduled Dispatch
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-sans">
                        Auto-synthesize 24h intelligence digest and broadcast to Telegram
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSend}
                    onChange={(e) => setAutoSend(e.target.checked)}
                    className="h-4 w-4 rounded accent-black dark:accent-[#00FF41]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2 text-xs font-mono">
                  <span className="text-neutral-600 dark:text-[#AAA]">{t.telegramScheduleLabel}</span>
                  <input
                    type="time"
                    value={dispatchTime}
                    onChange={(e) => setDispatchTime(e.target.value)}
                    className="rounded-sm border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 dark:border-[#333] dark:bg-[#202020] dark:text-neutral-200 font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-100 px-4 py-2 text-xs font-mono uppercase text-neutral-800 hover:bg-neutral-200 dark:border-[#333] dark:bg-[#1A1A1A] dark:text-[#CCC] dark:hover:bg-[#252525] disabled:opacity-50"
                >
                  <Zap className={`h-3.5 w-3.5 ${testing ? 'animate-bounce text-[#00FF41]' : ''}`} />
                  <span>{testing ? 'Testing...' : t.telegramTestBtn}</span>
                </button>

                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2 text-xs font-mono uppercase font-bold text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5] transition-all"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t.savePreferences}</span>
                </button>

                <button
                  onClick={handleSendDigestNow}
                  disabled={isSendingTestDigest}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2 text-xs font-mono uppercase text-neutral-700 hover:bg-neutral-100 dark:border-[#333] dark:text-[#CCC] dark:hover:bg-[#202020] disabled:opacity-50"
                >
                  <Send className={`h-3 w-3 ${isSendingTestDigest ? 'animate-spin' : ''}`} />
                  <span>{isSendingTestDigest ? 'Transmitting...' : 'Transmit Now'}</span>
                </button>
              </div>

              {/* Status Results */}
              {testResult && (
                <div
                  className={`mt-3 rounded-xl p-4 text-xs font-mono border animate-in fade-in ${
                    testResult.success
                      ? 'border-[#00FF41]/40 bg-[#00FF41]/10 text-neutral-900 dark:text-[#00FF41]'
                      : 'border-neutral-300 bg-neutral-100 text-neutral-900 dark:border-[#444] dark:bg-[#222] dark:text-[#DDD]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4 text-[#00FF41] shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{testResult.message}</p>
                      {testResult.bot && (
                        <p className="mt-1 text-[11px] opacity-80 font-mono">
                          BOT: @{testResult.bot.username} | NAME: {testResult.bot.first_name} | ID: {testResult.bot.id}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {sendResult && (
                <div
                  className={`rounded-xl p-3.5 text-xs font-mono border animate-in fade-in ${
                    sendResult.success
                      ? 'border-[#00FF41]/40 bg-[#00FF41]/10 text-neutral-900 dark:text-[#00FF41]'
                      : 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                  }`}
                >
                  {sendResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Quick Guide */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-xs dark:border-[#222] dark:bg-[#141414]">
            <h4 className="font-mono uppercase tracking-wider font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-neutral-700 dark:text-[#AAA]" />
              <span>Step-by-Step Setup Protocol:</span>
            </h4>
            <ol className="mt-3 list-decimal pl-4 space-y-1.5 text-neutral-600 dark:text-[#888] leading-relaxed font-sans text-xs">
              <li>Open Telegram and start a chat with <strong>@BotFather</strong>.</li>
              <li>Send command <code>/newbot</code>, choose a display name and unique username ending in <em>bot</em>.</li>
              <li>Copy the issued <strong>HTTP API Token</strong> into the credentials box above.</li>
              <li>Start your created bot directly in Telegram by pressing <strong>/start</strong> to authorize message reception.</li>
              <li>Specify your <strong>Chat ID</strong> and run connection diagnostics.</li>
            </ol>
          </div>
        </div>

        {/* Right Col: Live Interactive Telegram Simulator (5 cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-neutral-300 bg-[#0C0C0C] text-white shadow-xl dark:border-[#2A2A2A] overflow-hidden flex flex-col h-[580px]">
            {/* Simulator Header */}
            <div className="flex items-center justify-between border-b border-[#222] bg-[#141414] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black font-serif italic font-bold text-xs">
                  AI
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-white leading-tight">
                    AI Pulse Digest Bot
                  </h4>
                  <p className="text-[10px] font-mono text-[#00FF41]">
                    ● ONLINE RELAY
                  </p>
                </div>
              </div>
              <span className="rounded-sm border border-[#333] bg-[#222] px-2 py-0.5 text-[9px] font-mono uppercase text-[#AAA]">
                Simulator
              </span>
            </div>

            {/* Simulator Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans scrollbar-thin">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3.5 text-xs shadow-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#222] text-white border border-[#333]'
                        : 'bg-[#161616] text-[#CCC] border border-[#262626]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-xs">
                      {msg.text}
                    </div>
                    <div className="mt-1.5 text-right text-[9px] font-mono text-[#666]">
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Command Buttons */}
            <div className="border-t border-[#222] bg-[#141414] px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => handleSendSimulatorMessage('/start')}
                className="rounded-full border border-[#333] bg-[#202020] px-3 py-1 text-[10px] font-mono uppercase text-[#CCC] hover:bg-[#282828] transition-colors shrink-0"
              >
                /start
              </button>
              <button
                onClick={() => handleSendSimulatorMessage('/summary')}
                className="rounded-full border border-[#333] bg-[#202020] px-3 py-1 text-[10px] font-mono uppercase text-[#00FF41] hover:bg-[#282828] transition-colors shrink-0"
              >
                /summary
              </button>
              <button
                onClick={() => handleSendSimulatorMessage('/filters')}
                className="rounded-full border border-[#333] bg-[#202020] px-3 py-1 text-[10px] font-mono uppercase text-[#CCC] hover:bg-[#282828] transition-colors shrink-0"
              >
                /filters
              </button>
            </div>

            {/* Simulator Input */}
            <div className="border-t border-[#222] bg-[#141414] p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendSimulatorMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Send command to bot..."
                  className="flex-1 rounded-full border border-[#333] bg-[#0A0A0A] px-4 py-2 text-xs text-white placeholder-[#666] focus:border-white focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="rounded-full bg-white p-2 text-black hover:bg-[#E5E5E5] transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
