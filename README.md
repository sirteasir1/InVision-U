inVision U
Портал поступления с AI-поддержкой, созданный на Next.js + TypeScript + Supabase + OpenAI.
Также у нас есть уже задеплоенная версия: https://invisionuu.vercel.app
Что внутри
invisionu/
├── app/
│   ├── page.tsx                        # Главная страница (Подать заявку / Комиссия)
│   ├── candidate/page.tsx              # Форма заявки кандидата
│   ├── committee/
│   │   ├── page.tsx                    # Вход для комиссии
│   │   └── candidates/
│   │       ├── page.tsx                # Список кандидатов
│   │       └── [id]/page.tsx           # Карточка кандидата + форма оценки
│   └── api/
│       ├── candidates/route.ts         # POST /api/candidates
│       └── committee/
│           ├── route.ts                # GET  /api/committee
│           └── [id]/route.ts           # GET + DELETE /api/committee/:id
├── lib/
│   ├── supabase.ts                     # Серверный клиент Supabase
│   ├── baseline.ts                     # Шаг 1: детерминированная оценка
│   ├── llm-extractor.ts                # Шаг 2: извлечение сигналов через GPT-4o
│   ├── aggregator.ts                   # Шаг 3: ваши правила → итоговая оценка
│   ├── pipeline.ts                     # Оркестрация (1+2+3)
│   └── auth.ts                         # Проверка пароля комиссии
├── types/index.ts                      # Все TypeScript-типы
├── supabase-schema.sql                 # Запустить один раз в SQL Editor Supabase
└── .env.local.example                  # Переименовать в .env.local и заполнить
Настройка (пошагово)
Шаг 1 — Установите Node.js (один раз)
Перейдите на https://nodejs.org → скачайте версию LTS → установите её как обычное приложение на Mac.
Чтобы проверить, что всё установилось, откройте Terminal и введите:
node -v
Вы должны увидеть что-то вроде v20.x.x.
Шаг 2 — Создайте проект в Supabase
Перейдите на https://supabase.com → зарегистрируйтесь бесплатно
Нажмите New project → выберите название и пароль → подождите около 1 минуты
Перейдите в SQL Editor (в левом меню) → New query
Откройте файл supabase-schema.sql из этой папки, вставьте весь код → нажмите Run
Перейдите в Settings → API и скопируйте эти 3 значения:
Project URL
anon public key
service_role secret key
Шаг 3 — Получите OpenAI API key
Перейдите на https://platform.openai.com/api-keys
Нажмите Create new secret key
Скопируйте ключ
Шаг 4 — Настройте переменные окружения
В папке проекта скопируйте .env.local.example в .env.local:
cp .env.local.example .env.local
Откройте .env.local в VS Code и заполните все 5 значений.
Шаг 5 — Установите зависимости и запустите проект
Откройте Terminal, перейдите в папку проекта:
cd path/to/invisionu   # можно перетащить папку в Terminal, чтобы вставился путь
npm install            # установит все зависимости (в первый раз ~1 минута)
npm run dev            # запустит приложение
Откройте браузер и перейдите по адресу:
http://localhost:3000
Как пользоваться
Для кандидата
Перейдите на http://localhost:3000/candidate
Заполните форму и отправьте заявку
Вы получите подтверждение с ID вашей заявки
Оценка запускается в фоне и занимает примерно 15–20 секунд через GPT-4o
Для комиссии
Перейдите на http://localhost:3000/committee
Введите COMMITTEE_PASSWORD, который вы указали в .env.local
Просматривайте список кандидатов
Нажмите на любого кандидата, чтобы увидеть:
общий балл (0–100)
подоценки: мотивация, лидерство, опыт, mindset роста
рейтинг уверенности AI
обнаруженные флаги и противоречия
цитаты-доказательства из текста
проверку на аутентичность
полное эссе и интервью (в раскрывающемся виде)
Как изменить веса оценки
Откройте lib/aggregator.ts и измените веса:
const raw =
  motivation_final * 0.30  // ← меняйте эти значения
  + leadership_final * 0.20
  + experience_final * 0.25
  + growth_final * 0.15
  + signals.authenticity_score * 0.10
После изменения весов увеличьте строку VERSION — она сохраняется в базе данных для аудита и отслеживания изменений.
