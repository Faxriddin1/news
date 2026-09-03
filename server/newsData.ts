export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'LLM' | 'Vision' | 'Robotics' | 'OpenSource' | 'Hardware' | 'Ethics' | 'Agents';
  source: string;
  url: string;
  publishedAt: string;
  importance: 'critical' | 'high' | 'medium';
  tags: string[];
  readTimeMin: number;
}

export const INITIAL_NEWS_ARCHIVE: NewsArticle[] = [
  {
    id: 'ai-news-101',
    title: 'Gemini 3.8 Flash & Deep Reasoning Breakthrough Announced',
    summary: 'Новейшая модель обеспечивает сверхбыстрое контекстное мышление с 1М токенов контекста и глубокую интеграцию мультимодальных агентов.',
    content: 'Исследовательская группа представила Gemini 3.8 Flash с оптимизированным ядром рассуждений (thinking engine). Модель демонстрирует рекордную скорость инференса и сниженное энергопотребление при решении сложных математических задач и программирования. Встроенный гибридный режим вызова функций и инструментов позволяет агентам автоматически планировать цепочки действий в реальном времени.',
    category: 'LLM',
    source: 'Google DeepMind Blog',
    url: 'https://deepmind.google/technologies/gemini/',
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    importance: 'critical',
    tags: ['Gemini', 'LLM', 'Reasoning', 'Speed', 'Multimodal'],
    readTimeMin: 3
  },
  {
    id: 'ai-news-102',
    title: 'Открытый релиз DeepSeek-V3.5: Архитектура MoE нового поколения',
    summary: 'Новая открытая модель с 671 млрд параметров и активными 37 млрд на токен показывает сопоставимые результаты с топовыми проприетарными решениями.',
    content: 'Сообщество открытого ИИ получило доступ к исходным весам и коду инференса DeepSeek-V3.5. Архитектура Multi-Head Latent Attention (MLA) в сочетании с DeepSeekMoE позволяет эффективно запускать модель на распределенных кластерах серверов. Модель превосходит предыдущие открытые ориентиры в кодогенерации и математическом анализе.',
    category: 'OpenSource',
    source: 'Hugging Face Hub',
    url: 'https://huggingface.co/blog',
    publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    importance: 'high',
    tags: ['DeepSeek', 'OpenSource', 'MoE', 'Weights', 'HuggingFace'],
    readTimeMin: 4
  },
  {
    id: 'ai-news-103',
    title: 'Антропоморфные роботы с автономным ИИ выходят на заводы сборки электроники',
    summary: 'Компания Figure и Boston Dynamics внедрили мультимодальные модели зрения-действия (VLA) для манипуляций с субмиллиметровой точностью.',
    content: 'Новое поколение гуманоидных роботов научилось переобучаться новым производственным операциям всего за 4 часа цифровых симуляций в средах Isaac Sim. Модели Vision-Language-Action преобразуют визуальные потоки с камер непосредственно в крутящие моменты приводов пальцев, позволяя бережно манипулировать тонкими шлейфами и микросхемами.',
    category: 'Robotics',
    source: 'MIT Technology Review',
    url: 'https://technologyreview.com',
    publishedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    importance: 'high',
    tags: ['Robotics', 'VLA', 'Hardware', 'Automation', 'EmbodiedAI'],
    readTimeMin: 5
  },
  {
    id: 'ai-news-104',
    title: 'Европейский комитет по ИИ утвердил стандарты аудита суверенных нейросетей',
    summary: 'Регуляторы опубликовали обязательные протоколы верификации обучающих датасетов на авторские права и отсутствие критических уязвимостей.',
    content: 'В рамках исполнения положений EU AI Act приняты строгие критерии для систем ИИ общего назначения (GPAI). Компании, разрабатывающие модели с вычислительным бюджетом выше 10^25 FLOPs, обязаны проходить сторонний бенчмаркинг безопасности и предоставлять документацию по потреблению энергии.',
    category: 'Ethics',
    source: 'EU AI Observatory',
    url: 'https://artificialintelligenceact.eu',
    publishedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    importance: 'medium',
    tags: ['Regulation', 'EU', 'Safety', 'Copyright', 'Standards'],
    readTimeMin: 4
  },
  {
    id: 'ai-news-105',
    title: 'Революция в фотонных процессорах: оптический инференс со снижением энергопотребления на 90%',
    summary: 'Стартапы продемонстрировали кристаллы с оптической матричной интерференцией, выполняющие тензорные вычисления со скоростью света.',
    content: 'Потребление энергии центрами обработки данных для задач инференса генеративных моделей подошло к пределу электрических сетей. Новые кремниево-фотонные чипы используют лазерные волноводы вместо медных проводников, обеспечивая терафлопсы вычислений на милливатт затраченной мощности при нулевом тепловом троттлинге.',
    category: 'Hardware',
    source: 'IEEE Spectrum',
    url: 'https://spectrum.ieee.org',
    publishedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    importance: 'high',
    tags: ['Hardware', 'Photonics', 'Inference', 'Efficiency', 'Chips'],
    readTimeMin: 3
  },
  {
    id: 'ai-news-106',
    title: 'Автономные мультиагентные системы берут на себя полный цикл разработки ПО',
    summary: 'Платформы вроде SWE-Bench зафиксировали преодоление барьера в 65% успешно решенных реальных issue в GitHub без участия человека.',
    content: 'Вместо простых помощников по автодополнению кода инженеры получают автономные команды агентов: архитектор, кодер, тестировщик и ревьюер безопасности. Агенты воспроизводят ошибки, пишут юнит-тесты, оптимизируют профили памяти и формируют pull request со всеми согласованиями.',
    category: 'Agents',
    source: 'ArXiv AI & Software Engineering',
    url: 'https://arxiv.org',
    publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    importance: 'critical',
    tags: ['Agents', 'Coding', 'DevOps', 'SWE-bench', 'Autonomous'],
    readTimeMin: 5
  },
  {
    id: 'ai-news-107',
    title: 'Новые генеративные видеомодели Veo 3 и Sora 2 генерируют связные 60fps сцены',
    summary: 'Разрешение 4K, реалистичная физика жидкостей и деформаций, а также синхронная генерация многоканального звука и речи.',
    content: 'Видеогенерация перешла от разрозненных коротких клипов к созданию многоплановых сцен с сохранением консистентности персонажей, освещения и кинематографических траекторий камер. Встроенные нейросетевые синтезаторы фоли-эффектов генерируют шаги, шелест ветра и пространственную акустику помещений.',
    category: 'Vision',
    source: 'Computer Vision & Pattern Recognition',
    url: 'https://cvpr.thecvf.com',
    publishedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    importance: 'high',
    tags: ['Vision', 'Video', 'Sora', 'Veo', 'AudioGen'],
    readTimeMin: 4
  },
  {
    id: 'ai-news-108',
    title: 'Meta выпустила Llama 4 с мультимодальностью и нативной поддержкой 128 языков',
    summary: 'Модель получила расширенное окно внимания и оптимизирована для запуска на локальных рабочих станциях с квантованием FP4.',
    content: 'Архитектура Llama 4 внедряет механизм разреженного внимания и прямой поддержки аудио/изображений. Сообщество открытого ПО уже подготовило адаптеры LoRA для медицинских и юридических баз знаний, а также сборки для мобильных чипсетов Apple Silicon и Snapdragon.',
    category: 'OpenSource',
    source: 'Meta AI Research',
    url: 'https://ai.meta.com',
    publishedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    importance: 'critical',
    tags: ['Llama', 'Meta', 'OpenSource', 'Multilingual', 'Quantization'],
    readTimeMin: 4
  }
];

export const LIVE_NEWS_POOL: NewsArticle[] = [
  {
    id: 'ai-news-live-1',
    title: 'OpenAI анонсировала интерфейс оператора для прямого управления браузером и приложениями',
    summary: 'Компьютерные агенты получают способность кликать, заполнять формы и взаимодействовать с любым десктопным софтом.',
    content: 'Инструмент визуального анализа интерфейсов переводит намерения пользователя в точные координаты курсора и нажатия клавиш. Система прошла валидацию безопасности на предотвращение фишинга и несанкционированных платежей.',
    category: 'Agents',
    source: 'OpenAI Announcement',
    url: 'https://openai.com/blog',
    publishedAt: new Date().toISOString(),
    importance: 'critical',
    tags: ['OpenAI', 'ComputerUse', 'Agents', 'Workflow'],
    readTimeMin: 3
  },
  {
    id: 'ai-news-live-2',
    title: 'Anthropic представила обновление Claude 3.7 Sonnet с расширенным гибридным мышлением',
    summary: 'Пользователи теперь могут плавно переключать уровень рассуждений модели от мгновенного ответа до многоминутного детального планирования.',
    content: 'Claude 3.7 Sonnet сочетает скорость классического текстового инференса с контролируемой глубиной цепи размышлений (CoT). Модель показывает выдающиеся результаты в архитектурном проектировании и аудите смарт-контрактов.',
    category: 'LLM',
    source: 'Anthropic News',
    url: 'https://anthropic.com/news',
    publishedAt: new Date().toISOString(),
    importance: 'high',
    tags: ['Claude', 'Anthropic', 'Reasoning', 'LLM'],
    readTimeMin: 3
  },
  {
    id: 'ai-news-live-3',
    title: 'Groq представила LPUs второго поколения с рекордной пропускной способностью 1500 токенов/сек',
    summary: 'Чипы на базе тензорных потоков позволяют взаимодействовать с моделями в режиме живой речи без задержек восприятия.',
    content: 'Архитектура Language Processing Unit (LPU) устраняет задержки памяти HBM за счет распределенной статической памяти SRAM прямо на кристалле, делая голосовые диалоги с ИИ неотличимыми от общения с живым собеседником.',
    category: 'Hardware',
    source: 'Groq Hardware Blog',
    url: 'https://groq.com',
    publishedAt: new Date().toISOString(),
    importance: 'medium',
    tags: ['Groq', 'LPU', 'UltraFast', 'Hardware', 'Latency'],
    readTimeMin: 2
  }
];

export const INITIAL_ARTICLES: NewsArticle[] = INITIAL_NEWS_ARCHIVE;

export const SAMPLE_DIGEST = {
  id: 'digest-sample-today',
  generatedAt: new Date().toISOString(),
  dateStr: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
  headline: 'Революция открытых MoE-моделей, сверхбыстрый Gemini 3.8 Flash и прорыв в промышленной робототехнике',
  executiveSummary: [
    'DeepSeek выпустила открытые веса и код инференса V3.5 (671B), продемонстрировав паритет с ведущими закрытыми моделями в математике и кодинге.',
    'Google DeepMind анонсировала Gemini 3.8 Flash с оптимизированным движком рассуждений и контекстным окном в 1 миллион токенов.',
    'Ведущие производители гуманоидных роботов внедрили VLA-модели машинного зрения на сборочных линиях электроники.',
    'Комитет ЕС по искусственному интеллекту опубликовал финальный регламент комплаенса для генеративных систем общего назначения.'
  ],
  keyHighlights: [
    {
      category: 'LLM & Reasoning',
      title: 'Gemini 3.8 Flash & Deep Reasoning',
      summary: 'Сверхбыстрый инференс с нулевой потерей качества математических рассуждений.',
      source: 'Google DeepMind Blog',
      impact: 'Существенное снижение себестоимости агентных цепочек для бизнеса.'
    },
    {
      category: 'Open Source',
      title: 'DeepSeek-V3.5 MoE Release',
      summary: 'Открытые веса новой флагманской модели стали доступны разработчикам.',
      source: 'Hugging Face',
      impact: 'Ускорение локальных корпоративных развертываний без вендор-лока.'
    },
    {
      category: 'Robotics',
      title: 'Антропоморфные роботы на фабриках',
      summary: 'Мультимодальные модели VLA научили роботов сборке сложных плат.',
      source: 'MIT Technology Review',
      impact: 'Переход от прототипов к промышленной эксплуатации на сборочных линиях.'
    }
  ],
  telegramMarkdown: `🤖 *AI PULSE — ЕЖЕДНЕВНЫЙ ДАЙДЖЕСТ ИИ* 🌐\n📅 *${new Date().toLocaleDateString('ru-RU')}*\n\n🔥 *Главное за сутки:*\n• *Gemini 3.8 Flash*: Новый эталон скорости и рассуждений с контекстом 1М токенов.\n• *DeepSeek-V3.5*: Топовая открытая MoE-модель (671B) выложена в открытый доступ.\n• *Figure & Boston Dynamics*: Гуманоиды вышли на сборку микроэлектроники.\n• *EU AI Act*: Утверждены стандарты аудита обучающих выборок GPAI.\n\n💡 *Вывод эксперта:* Гонка сместилась от простого масштабирования параметров к контролю глубины рассуждений и воплощенному ИИ.\n\n🔗 Читать подробнее в веб-дашборде AI Pulse`,
  articleIds: ['ai-news-101', 'ai-news-102', 'ai-news-103', 'ai-news-104'],
  language: 'ru',
  filtersUsed: {
    categories: ['LLM', 'OpenSource', 'Robotics', 'Ethics'],
    keywords: ['Gemini', 'DeepSeek', 'Robotics']
  }
};
