import React, { useState } from 'react';
import {
  Smartphone,
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  ExternalLink,
  Zap,
  Globe
} from 'lucide-react';
import { LanguageCode } from '../types.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface MobileApiExplorerProps {
  language: LanguageCode;
}

export const MobileApiExplorer: React.FC<MobileApiExplorerProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('news');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const endpoints = [
    {
      id: 'news',
      method: 'GET',
      path: '/api/v1/news',
      name: 'Получить ленту новостей',
      desc: 'Возвращает структурированный список новостей с фильтрами по категориям, важности и лимиту.'
    },
    {
      id: 'summary',
      method: 'GET',
      path: '/api/v1/summary/daily',
      name: 'Получить ежедневную сводку',
      desc: 'Возвращает актуальный AI-дайджест за 24 часа с выводами и краткими тезисами.'
    },
    {
      id: 'prefs',
      method: 'GET',
      path: '/api/v1/user/preferences',
      name: 'Получить настройки пользователя',
      desc: 'Синхронизирует активные ключевые слова и категории для мобильного клиента.'
    },
    {
      id: 'health',
      method: 'GET',
      path: '/api/v1/health',
      name: 'Проверка здоровья API',
      desc: 'Статус доступности сервера и агрегатора.'
    }
  ];

  const handleExecute = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      let url = '/api/v1/health';
      if (selectedEndpoint === 'news') {
        url = `/api/v1/news?limit=${limit}${categoryFilter !== 'ALL' ? `&category=${categoryFilter}` : ''}`;
      } else if (selectedEndpoint === 'summary') {
        url = '/api/v1/summary/daily';
      } else if (selectedEndpoint === 'prefs') {
        url = '/api/v1/user/preferences';
      }

      const res = await fetch(url);
      const data = await res.json();
      setResponseTime(Math.round(performance.now() - start));
      setResponseStatus(res.status);
      setResponseOutput(data);
    } catch (e: any) {
      setResponseTime(Math.round(performance.now() - start));
      setResponseStatus(500);
      setResponseOutput({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const getCurlSnippet = () => {
    const origin = window.location.origin;
    let url = `${origin}/api/v1/health`;
    if (selectedEndpoint === 'news') {
      url = `${origin}/api/v1/news?limit=${limit}${categoryFilter !== 'ALL' ? `&category=${categoryFilter}` : ''}`;
    } else if (selectedEndpoint === 'summary') {
      url = `${origin}/api/v1/summary/daily`;
    } else if (selectedEndpoint === 'prefs') {
      url = `${origin}/api/v1/user/preferences`;
    }
    return `curl -X GET "${url}" \\\n  -H "Accept: application/json" \\\n  -H "X-Client: AIPulse-iOS-v1"`;
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(getCurlSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-neutral-200 dark:border-[#2A2A2A] pb-6 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 dark:text-[#888888] mb-2 font-mono">
            HEADLESS PROTOCOL & TELEMETRY
          </p>
          <h1 className="text-4xl sm:text-6xl font-serif italic text-neutral-900 dark:text-[#F0F0F0] leading-none">
            {t.apiTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#00FF41]"></span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-[#888]">
            REST/JSON API v1.2 LIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Endpoint Selector (4 cols) */}
        <div className="space-y-3 lg:col-span-4">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 dark:text-[#888]">
            ENDPOINTS SPECIFICATION
          </h3>

          <div className="space-y-2.5">
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint === ep.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => {
                    setSelectedEndpoint(ep.id);
                    setResponseOutput(null);
                  }}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-black bg-neutral-100 dark:border-white dark:bg-[#1C1C1C]'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50 dark:border-[#222] dark:bg-[#111] dark:hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-sm border border-neutral-300 dark:border-[#333] px-1.5 py-0.5 font-mono text-[9px] font-bold text-neutral-900 dark:text-[#00FF41] bg-neutral-50 dark:bg-[#1F1F1F]">
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-[#EEE] truncate">
                      {ep.path}
                    </span>
                  </div>
                  <h4 className="mt-2 text-xs font-serif font-bold text-neutral-900 dark:text-white">
                    {ep.name}
                  </h4>
                  <p className="mt-1 text-[11px] text-neutral-500 dark:text-[#777] leading-snug font-sans">
                    {ep.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sandbox & Response Viewer (8 cols) */}
        <div className="space-y-5 lg:col-span-8">
          {/* Query Parameters Box */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-[#222] dark:bg-[#111111]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-neutral-600 dark:text-[#AAA]" />
                <span>Request Inspector & Terminal Dispatch</span>
              </h3>
              <button
                onClick={handleExecute}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-xs font-mono uppercase font-bold text-white shadow-xs hover:bg-neutral-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5] transition-all"
              >
                <Play className={`h-3 w-3 ${loading ? 'animate-spin' : 'fill-current'}`} />
                <span>{loading ? 'Dispatching...' : 'Execute Request'}</span>
              </button>
            </div>

            {selectedEndpoint === 'news' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-200 pt-4 dark:border-[#222]">
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-[#AAA]">
                    Category (query: category)
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs font-mono dark:border-[#333] dark:bg-[#161616] dark:text-white"
                  >
                    <option value="ALL">ALL CATEGORIES</option>
                    <option value="LLM">LLM</option>
                    <option value="Agents">Agents</option>
                    <option value="OpenSource">OpenSource</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-[#AAA]">
                    Batch Size (query: limit)
                  </label>
                  <input
                    type="number"
                    value={limit}
                    min={1}
                    max={50}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs font-mono dark:border-[#333] dark:bg-[#161616] dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* cURL Snippet */}
            <div className="mt-5 rounded-xl border border-neutral-300 dark:border-[#262626] bg-[#0A0A0A] p-4 text-neutral-300 font-mono text-[11px] relative overflow-x-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#222] mb-2">
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">cURL SYNTAX</span>
                <button
                  onClick={copyCurl}
                  className="flex items-center gap-1 text-[10px] font-mono uppercase text-neutral-400 hover:text-white"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-[#00FF41]" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-[#CCC]">{getCurlSnippet()}</pre>
            </div>
          </div>

          {/* Response payload viewer */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-[#222] dark:bg-[#111111]">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-[#222]">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                <Code2 className="h-4 w-4 text-neutral-600 dark:text-[#AAA]" />
                <span>HTTP Response Stream</span>
              </h4>

              {responseStatus !== null && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span
                    className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold ${
                      responseStatus === 200
                        ? 'bg-[#00FF41]/20 text-[#00FF41]'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    STATUS {responseStatus}
                  </span>
                  {responseTime !== null && (
                    <span className="text-neutral-500 text-[10px]">
                      {responseTime}ms
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto rounded-xl border border-neutral-300 dark:border-[#222] bg-[#080808] p-4 font-mono text-xs text-[#00FF41] scrollbar-thin">
              {responseOutput ? (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(responseOutput, null, 2)}
                </pre>
              ) : (
                <div className="text-neutral-500 text-center py-10 font-mono text-xs">
                  Awaiting dispatch. Click "Execute Request" to stream live JSON payload.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
