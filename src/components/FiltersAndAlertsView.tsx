import React, { useState } from 'react';
import {
  Filter,
  Bell,
  Plus,
  X,
  CheckCircle2,
  Sliders,
  Shield,
  Tag,
  Volume2,
  VolumeX,
  Sparkles,
  Smartphone,
  Save
} from 'lucide-react';
import { UserPreferences, LanguageCode, Category } from '../types.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface FiltersAndAlertsViewProps {
  preferences: UserPreferences;
  onSavePreferences: (updated: Partial<UserPreferences>) => Promise<void>;
  categoriesCount: Record<string, number>;
  language: LanguageCode;
}

export const FiltersAndAlertsView: React.FC<FiltersAndAlertsViewProps> = ({
  preferences,
  onSavePreferences,
  categoriesCount,
  language
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  const [selectedCats, setSelectedCats] = useState<string[]>(preferences.selectedCategories || ['LLM', 'OpenSource', 'Robotics', 'Agents']);
  const [keywords, setKeywords] = useState<string[]>(preferences.alertKeywords || ['DeepSeek', 'Claude 3.7', 'Gemini', 'Nvidia', 'Robot']);
  const [newKeyword, setNewKeyword] = useState('');
  const [realtimeAlerts, setRealtimeAlerts] = useState(preferences.realtimeAlertsEnabled ?? true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const allCategories: { id: Category; label: string; desc: string }[] = [
    { id: 'LLM', label: t.categoryLLM, desc: 'Архитектуры, веса, квантование и бенчмарки языковых моделей' },
    { id: 'Agents', label: t.categoryAgents, desc: 'Автономные агенты, вызов инструментов, MCP и рассуждения' },
    { id: 'OpenSource', label: t.categoryOpenSource, desc: 'Открытые модели, веса на HuggingFace, лицензии и fine-tuning' },
    { id: 'Robotics', label: t.categoryRobotics, desc: 'Гуманоиды, манипуляторы, VLA модели и пространственный интеллект' },
    { id: 'Hardware', label: t.categoryHardware, desc: 'Ускорители, HBM память, кремний, TPU, Blackwell и энергоэффективность' },
    { id: 'Vision', label: t.categoryVision, desc: 'Мультимодальные модели, видеогенерация и диффузия' },
    { id: 'Ethics', label: t.categoryEthics, desc: 'Регулирование, копирайт, авторские права и безопасность ИИ' }
  ];

  const toggleCategory = (id: string) => {
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleAddKeyword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newKeyword.trim().replace(/^#/, '');
    if (!clean) return;
    if (!keywords.includes(clean)) {
      setKeywords(prev => [...prev, clean]);
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(prev => prev.filter(k => k !== kw));
  };

  const handleSave = async () => {
    await onSavePreferences({
      selectedCategories: selectedCats,
      alertKeywords: keywords,
      realtimeAlertsEnabled: realtimeAlerts
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const requestBrowserNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('AI Pulse', {
          body: 'Уведомления по ключевым словам активированы!',
          icon: '/icon.svg'
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-neutral-200 dark:border-[#2A2A2A] pb-6 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 dark:text-[#888888] mb-2 font-mono">
            SIGNAL ROUTING & KEYWORD FILTERS
          </p>
          <h1 className="text-4xl sm:text-6xl font-serif italic text-neutral-900 dark:text-[#F0F0F0] leading-none">
            {t.navFilters}
          </h1>
        </div>

        <button
          onClick={handleSave}
          id="save-preferences-top-btn"
          className="flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5] transition-all self-start sm:self-auto"
        >
          <Save className="h-3 w-3" />
          <span>{t.savePreferences}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Keyword Alert Management (6 cols) */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-[#222] dark:bg-[#111111]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-neutral-700 dark:text-[#AAA]" />
                <h3 className="text-sm font-serif font-bold text-neutral-900 dark:text-white">
                  {t.keywordAlertsTitle}
                </h3>
              </div>
              <span className="rounded-full border border-neutral-300 dark:border-[#333] bg-neutral-100 px-2.5 py-0.5 text-[10px] font-mono uppercase text-neutral-700 dark:bg-[#1A1A1A] dark:text-[#CCC]">
                {keywords.length} ACTIVE TRIGGERS
              </span>
            </div>

            <p className="mt-2 text-xs text-neutral-500 dark:text-[#888]">
              Articles matching any monitored keyword receive high editorial priority and generate instant event dispatches.
            </p>

            {/* Keyword Input */}
            <form onSubmit={handleAddKeyword} className="mt-4 flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g. GPT-5, Groq, Whisper, Qwen, Sora, Claude..."
                className="flex-1 rounded-lg border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 focus:border-black focus:outline-none dark:border-[#333] dark:bg-[#161616] dark:text-white"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-xs font-mono uppercase font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5]"
              >
                <Plus className="h-3 w-3" />
                <span>{t.addKeyword}</span>
              </button>
            </form>

            {/* Keywords Tag Cloud */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-neutral-300 bg-neutral-100 px-2.5 py-1 text-[11px] font-mono uppercase text-neutral-800 dark:border-[#333] dark:bg-[#1A1A1A] dark:text-[#CCC]"
                >
                  <span>#{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="rounded-full p-0.5 text-neutral-500 hover:text-red-500 dark:text-[#777] dark:hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Preset Suggestions */}
            <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-[#222]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-[#666]">
                Quick Vector Suggestions:
              </span>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {['DeepSeek-R1', 'Blackwell', 'Llama-4', 'Claude-3.7', 'AGI', 'Figure-02', 'Groq LPU', 'Reasoning'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    disabled={keywords.includes(tag)}
                    onClick={() => {
                      if (!keywords.includes(tag)) setKeywords(p => [...p, tag]);
                    }}
                    className="rounded-sm border border-neutral-300 bg-neutral-50 px-2.5 py-0.5 text-[10px] font-mono text-neutral-700 hover:bg-neutral-200 disabled:opacity-30 dark:border-[#333] dark:bg-[#181818] dark:text-[#AAA] dark:hover:bg-[#252525]"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time notifications and sound */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-[#222] dark:bg-[#111111] space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-neutral-700 dark:text-[#AAA]" />
              <h3 className="text-sm font-serif font-bold text-neutral-900 dark:text-white">
                Dispatch Broadcast Channels
              </h3>
            </div>

            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-[#222]">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-800 dark:text-[#CCC]">
                  Live SSE Toast Stream
                </h4>
                <p className="text-[11px] text-neutral-500 font-sans">
                  Real-time notification toast when high-priority intelligence arrives
                </p>
              </div>
              <input
                type="checkbox"
                checked={realtimeAlerts}
                onChange={(e) => setRealtimeAlerts(e.target.checked)}
                className="h-4 w-4 rounded accent-black dark:accent-[#00FF41]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-800 dark:text-[#CCC]">
                  Browser System Push
                </h4>
                <p className="text-[11px] text-neutral-500 font-sans">
                  Native OS notification channel even when the tab is backgrounded
                </p>
              </div>
              <button
                type="button"
                onClick={requestBrowserNotifications}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-[11px] font-mono uppercase text-neutral-700 hover:bg-neutral-100 dark:border-[#333] dark:bg-[#1A1A1A] dark:text-[#CCC]"
              >
                Permit
              </button>
            </div>
          </div>
        </div>

        {/* Thematic Category Toggles (6 cols) */}
        <div className="space-y-4 lg:col-span-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-[#222] dark:bg-[#111111]">
            <h3 className="text-sm font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-neutral-700 dark:text-[#AAA]" />
              <span>Thematic Subscriptions</span>
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-[#888]">
              Toggle core AI domains to calibrate your daily briefing radar:
            </p>

            <div className="mt-4 space-y-2.5">
              {allCategories.map((cat) => {
                const isChecked = selectedCats.includes(cat.id);
                const count = categoriesCount[cat.id] || 0;

                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center justify-between rounded-lg border p-3.5 cursor-pointer transition-all ${
                      isChecked
                        ? 'border-neutral-900 bg-neutral-100 dark:border-white dark:bg-[#1C1C1C]'
                        : 'border-neutral-200 bg-white dark:border-[#222] dark:bg-[#141414] hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="h-4 w-4 rounded accent-black dark:accent-[#00FF41]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                            {cat.label}
                          </span>
                          <span className="rounded-sm border border-neutral-300 dark:border-[#333] bg-neutral-200/60 dark:bg-[#252525] px-1.5 py-0.2 text-[9px] font-mono text-neutral-600 dark:text-[#888]">
                            {count} Items
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-[#777] line-clamp-1 font-sans">
                          {cat.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Confirmation Button */}
            <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-[#222] flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-500">
                {saveSuccess ? (
                  <span className="flex items-center gap-1.5 text-[#00FF41] font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    {t.preferencesSaved}
                  </span>
                ) : (
                  'Synced with account preferences'
                )}
              </span>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5] transition-all"
              >
                <Save className="h-3 w-3" />
                <span>{t.savePreferences}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
