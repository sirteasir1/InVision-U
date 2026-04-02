# inVision U

AI-assisted admissions portal built with Next.js + TypeScript + Supabase + OpenAI.
we also have deployed it:   https://invisionuu.vercel.app
---

## What's inside

```
invisionu/
├── app/
│   ├── page.tsx                        # Home page (Apply / Committee)
│   ├── candidate/page.tsx              # Candidate application form
│   ├── committee/
│   │   ├── page.tsx                    # Committee login
│   │   └── candidates/
│   │       ├── page.tsx                # Candidates list
│   │       └── [id]/page.tsx           # Candidate detail + scoring card
│   └── api/
│       ├── candidates/route.ts         # POST /api/candidates
│       └── committee/
│           ├── route.ts                # GET  /api/committee
│           └── [id]/route.ts           # GET + DELETE /api/committee/:id
├── lib/
│   ├── supabase.ts                     # Supabase server client
│   ├── baseline.ts                     # Step 1: deterministic scoring
│   ├── llm-extractor.ts                # Step 2: GPT-4o signal extraction
│   ├── aggregator.ts                   # Step 3: your rules → final score
│   ├── pipeline.ts                     # Orchestrator (1+2+3)
│   └── auth.ts                         # Committee password check
├── types/index.ts                      # All TypeScript types
├── supabase-schema.sql                 # Run once in Supabase SQL Editor
└── .env.local.example                  # Rename to .env.local and fill in
```

---

## Setup (step by step)

### Step 1 — Install Node.js (one time)
Go to https://nodejs.org → download the LTS version → install it like any Mac app.

To check it worked, open Terminal and type:
```
node -v
```
You should see something like `v20.x.x`.

### Step 2 — Get a Supabase project
1. Go to https://supabase.com → sign up free
2. Click "New project" → choose a name and password → wait ~1 min
3. Go to **SQL Editor** (left sidebar) → New query
4. Open `supabase-schema.sql` from this folder, paste everything → click **Run**
5. Go to **Settings → API** → copy these 3 values:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### Step 3 — Get an OpenAI API key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key" → copy it

### Step 4 — Configure environment
In the project folder, copy `.env.local.example` to `.env.local`:
```
cp .env.local.example .env.local
```
Open `.env.local` in VS Code and fill in all 5 values.

### Step 5 — Install and run
Open Terminal, go to the project folder:
```bash
cd path/to/invisionu   # drag the folder onto Terminal to get the path
npm install            # installs everything (takes ~1 min first time)
npm run dev            # starts the app
```

Open your browser at: **http://localhost:3000**

---

## How to use

### As a candidate
1. Go to http://localhost:3000/candidate
2. Fill in the form → submit
3. You'll get a confirmation with your application ID
4. Scoring runs in the background (takes ~15-20 seconds via GPT-4o)

### As committee
1. Go to http://localhost:3000/committee
2. Enter the `COMMITTEE_PASSWORD` you set in `.env.local`
3. Browse the candidates list
4. Click any candidate to see:
   - Overall score (0-100)
   - Sub-scores: motivation, leadership, experience, growth mindset
   - AI confidence rating
   - Flags and contradictions detected
   - Evidence quotes from the text
   - Authenticity review
   - Full essay and interview (expandable)

---

## Customising scoring weights

Open `lib/aggregator.ts` and change the weights:

```typescript
const raw =
  motivation_final * 0.30  // ← change these
  + leadership_final * 0.20
  + experience_final * 0.25
  + growth_final * 0.15
  + signals.authenticity_score * 0.10
```

Bump the `VERSION` string when you change weights — it's stored in the DB for audit trail.
