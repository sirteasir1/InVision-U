[README_RU_inVision_U.md](https://github.com/user-attachments/files/26488173/README_RU_inVision_U.md)
# inVision U

Портал поступления с AI-поддержкой, созданный на **Next.js + TypeScript + Supabase + OpenAI**.  
Также у нас есть уже задеплоенная версия:  
**https://invisionuu.vercel.app**

## Что внутри

```text
invisionu/
├── app/
│   ├── page.tsx
│   │   Главная страница (Подать заявку / Комиссия)
│   ├── candidate/page.tsx
│   │   Форма заявки кандидата
│   ├── committee/
│   │   ├── page.tsx
│   │   │   Вход для комиссии
│   │   └── candidates/
│   │       ├── page.tsx
│   │       │   Список кандидатов
│   │       └── [id]/page.tsx
│   │           Карточка кандидата + форма оценки
│   └── api/
│       ├── candidates/route.ts
│       │   POST /api/candidates
│       └── committee/
│           ├── route.ts
│           │   GET /api/committee
│           └── [id]/route.ts
│               GET + DELETE /api/committee/:id
├── lib/
│   ├── supabase.ts
│   │   Серверный клиент Supabase
│   ├── baseline.ts
│   │   Шаг 1: детерминированная оценка
│   ├── llm-extractor.ts
│   │   Шаг 2: извлечение сигналов через GPT-4o
│   ├── aggregator.ts
│   │   Шаг 3: ваши правила -> итоговая оценка
│   ├── pipeline.ts
│   │   Оркестрация (1+2+3)
│   └── auth.ts
│       Проверка пароля комиссии
├── types/index.ts
│   Все TypeScript-типы
├── supabase-schema.sql
│   Запустить один раз в SQL Editor Supabase
└── .env.local.example
    Переименовать в .env.local и заполнить
```

## Настройка (пошагово)

### Шаг 1 — Установите Node.js

Перейдите на **https://nodejs.org** -> скачайте версию **LTS** -> установите её как обычное приложение.

Чтобы проверить, что всё установилось, откройте **Terminal** и введите:

```bash
node -v
```

Вы должны увидеть что-то вроде `v20.x.x`.

### Шаг 2 — Создайте проект в Supabase

1. Перейдите на **https://supabase.com** и зарегистрируйтесь.
2. Нажмите **New project**.
3. Укажите название проекта и пароль.
4. Подождите около 1 минуты, пока проект создастся.
5. Откройте **SQL Editor** -> **New query**.
6. Откройте файл `supabase-schema.sql`, вставьте весь код и нажмите **Run**.
7. Перейдите в **Settings -> API** и скопируйте:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

### Шаг 3 — Получите OpenAI API key

1. Перейдите на **https://platform.openai.com/api-keys**
2. Нажмите **Create new secret key**
3. Скопируйте ключ

### Шаг 4 — Настройте переменные окружения

В папке проекта скопируйте `.env.local.example` в `.env.local`:

```bash
cp .env.local.example .env.local
```

Откройте `.env.local` в VS Code и заполните все 5 значений.

### Шаг 5 — Установите зависимости и запустите проект

Откройте **Terminal**, перейдите в папку проекта:

```bash
cd path/to/invisionu
npm install
npm run dev
```

После этого откройте в браузере:

```text
http://localhost:3000
```

## Как пользоваться

### Для кандидата

1. Перейдите на `http://localhost:3000/candidate`
2. Заполните форму и отправьте заявку
3. Получите подтверждение с ID заявки
4. Оценка запускается в фоне и занимает примерно **15–20 секунд** через GPT-4o

### Для комиссии

1. Перейдите на `http://localhost:3000/committee`
2. Введите `COMMITTEE_PASSWORD`, который вы указали в `.env.local`
3. Откройте список кандидатов
4. Нажмите на любого кандидата, чтобы увидеть:
   - общий балл (**0–100**)
   - подоценки: **мотивация, лидерство, опыт, growth mindset**
   - рейтинг уверенности AI
   - найденные флаги и противоречия
   - цитаты-доказательства из текста
   - проверку на аутентичность
   - полное эссе и интервью в раскрывающемся виде

## Как изменить веса оценки

Откройте файл `lib/aggregator.ts` и измените веса:

```ts
const raw =
  motivation_final * 0.30
  + leadership_final * 0.20
  + experience_final * 0.25
  + growth_final * 0.15
  + signals.authenticity_score * 0.10
```

После изменения весов увеличьте строку `VERSION` — она сохраняется в базе данных для аудита и отслеживания изменений.
