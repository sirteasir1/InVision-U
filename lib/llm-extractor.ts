import OpenAI from 'openai'
import { AuthorshipAssessment, CandidateInput, LLMSignals, ScoreReasoning } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM = `Ты — опытный аналитик приёмной комиссии inVision U.
Твоя задача — дать осторожную, доказательную и подробную оценку эссе и интервью кандидата.

Правила:
1) Не принимай решение о зачислении.
2) Оцени только по тексту кандидата и предоставленному контексту.
3) Не делай категорических выводов о том, что текст написан ИИ. Вместо этого оцени вероятность помощи ИИ и объясни признаки.
4) Избегай поверхностных оценок по длине текста. Важнее конкретика, последовательность, рефлексия, ответственность, примеры и глубина.
5) Все текстовые поля в ответе верни на русском языке.
6) Верни ТОЛЬКО валидный JSON без markdown.

Формат ответа:
{
  "motivation": <0-10>,
  "leadership": <0-10>,
  "experience": <0-10>,
  "growth": <0-10>,
  "authenticity_score": <0-10>,
  "contradictions": ["..."],
  "flags": ["..."],
  "strengths": ["..."],
  "concerns": ["..."],
  "evidence": {
    "motivation": "<короткая цитата или близкая к тексту формулировка>",
    "leadership": "<короткая цитата или близкая к тексту формулировка>",
    "experience": "<короткая цитата или близкая к тексту формулировка>",
    "growth": "<короткая цитата или близкая к тексту формулировка>"
  },
  "score_reasoning": {
    "motivation": "<почему такая оценка мотивации>",
    "leadership": "<почему такая оценка лидерства>",
    "experience": "<почему такая оценка опыта>",
    "growth": "<почему такая оценка роста>",
    "overall": "<краткое общее объяснение итоговой картины>"
  },
  "authenticity_review": "<1-3 предложения о естественности, конкретности и последовательности текста>",
  "authorship_assessment": {
    "label": "скорее человек | возможна помощь ИИ | выраженные признаки ИИ | недостаточно данных",
    "confidence": <0.0-1.0>,
    "explanation": "<аккуратное пояснение без категоричности>",
    "signals": ["...конкретные признаки..."]
  },
  "confidence_hint": <0.0-1.0>
}`

const FALLBACK: LLMSignals = {
  motivation: 5,
  leadership: 5,
  experience: 5,
  growth: 5,
  authenticity_score: 5,
  contradictions: [],
  flags: ['Автоматический разбор не сработал — нужна ручная проверка.'],
  strengths: [],
  concerns: ['Не удалось получить структурированный ответ модели.'],
  evidence: {},
  score_reasoning: {
    motivation: 'Автоматическая оценка временно недоступна.',
    leadership: 'Автоматическая оценка временно недоступна.',
    experience: 'Автоматическая оценка временно недоступна.',
    growth: 'Автоматическая оценка временно недоступна.',
    overall: 'Итог требует ручного просмотра комиссией.',
  },
  authenticity_review: 'Автоматический анализ недоступен.',
  authorship_assessment: {
    label: 'недостаточно данных',
    confidence: 0.2,
    explanation: 'Недостаточно данных для аккуратной оценки авторства текста.',
    signals: [],
  },
  confidence_hint: 0.2,
}

export async function extractSignals(inp: CandidateInput): Promise<LLMSignals> {
  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.15,
      max_tokens: 1600,
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content:
            `ЭССЕ:\n${inp.essay}\n\n` +
            `ИНТЕРВЬЮ:\n${inp.interview_text}\n\n` +
            `КОНТЕКСТ:\n` +
            `GPA: ${inp.gpa}\n` +
            `Ответы о мотивации и целях: ${inp.extracurriculars}\n` +
            `Достижения: ${inp.achievements}`,
        },
      ],
    })

    const raw = resp.choices[0]?.message?.content ?? '{}'
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as Partial<LLMSignals>
    return normalizeSignals(parsed)
  } catch (err) {
    console.error('[LLM extractor]', err)
    return FALLBACK
  }
}

function normalizeSignals(input: Partial<LLMSignals>): LLMSignals {
  const reasoning: Partial<ScoreReasoning> = input.score_reasoning ?? {}
  const authorship = input.authorship_assessment ?? ({} as Partial<AuthorshipAssessment>)

  return {
    motivation: clamp10(input.motivation),
    leadership: clamp10(input.leadership),
    experience: clamp10(input.experience),
    growth: clamp10(input.growth),
    authenticity_score: clamp10(input.authenticity_score),
    contradictions: uniqStrings(input.contradictions),
    flags: uniqStrings(input.flags),
    strengths: uniqStrings(input.strengths),
    concerns: uniqStrings(input.concerns),
    evidence: sanitizeEvidence(input.evidence),
    score_reasoning: {
      motivation: safeText(reasoning.motivation, FALLBACK.score_reasoning.motivation),
      leadership: safeText(reasoning.leadership, FALLBACK.score_reasoning.leadership),
      experience: safeText(reasoning.experience, FALLBACK.score_reasoning.experience),
      growth: safeText(reasoning.growth, FALLBACK.score_reasoning.growth),
      overall: safeText(reasoning.overall, FALLBACK.score_reasoning.overall),
    },
    authenticity_review: safeText(input.authenticity_review, FALLBACK.authenticity_review),
    authorship_assessment: {
      label: normalizeLabel(authorship.label),
      confidence: clamp01(authorship.confidence),
      explanation: safeText(authorship.explanation, FALLBACK.authorship_assessment.explanation),
      signals: uniqStrings(authorship.signals),
    },
    confidence_hint: clamp01(input.confidence_hint),
  }
}

function sanitizeEvidence(evidence: LLMSignals['evidence'] | undefined): LLMSignals['evidence'] {
  if (!evidence || typeof evidence !== 'object') return {}
  const out: LLMSignals['evidence'] = {}
  for (const key of ['motivation', 'leadership', 'experience', 'growth'] as const) {
    const value = evidence[key]
    if (typeof value === 'string' && value.trim()) out[key] = value.trim()
  }
  return out
}

function normalizeLabel(label: unknown): AuthorshipAssessment['label'] {
  const text = typeof label === 'string' ? label.trim().toLowerCase() : ''
  if (text === 'скорее человек') return 'скорее человек'
  if (text === 'возможна помощь ии') return 'возможна помощь ИИ'
  if (text === 'выраженные признаки ии') return 'выраженные признаки ИИ'
  return 'недостаточно данных'
}

function uniqStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is string => typeof item === 'string').map(v => v.trim()).filter(Boolean))]
}

function safeText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function clamp10(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 5
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10))
}

function clamp01(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 0.2
  return Math.round(Math.max(0, Math.min(1, n)) * 100) / 100
}
