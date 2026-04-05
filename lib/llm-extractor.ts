import OpenAI from 'openai'
import { AuthorshipAssessment, CandidateInput, EvidenceCriterion, EvidenceItem, LLMSignals, ScoreReasoning } from '@/types'
import { assessEssayQuality, assessInterviewQuality } from './text-quality'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM = `Ты — опытный аналитик приёмной комиссии inVision U.
Твоя задача — дать осторожную, доказательную и подробную оценку эссе и интервью кандидата.

Правила:
1) Не принимай решение о зачислении.
2) Оцени только по тексту кандидата и предоставленному контексту.
3) Не делай категорических выводов о том, что текст написан ИИ. Вместо этого оцени вероятность помощи ИИ и объясни признаки.
4) Если эссе или интервью содержат бессвязный набор букв, очень короткие фразы или почти не несут смысла, это должно сильно понижать оценки и быть прямо отражено в объяснениях.
5) Все текстовые поля в ответе верни на русском языке.
6) Верни ТОЛЬКО валидный JSON без markdown.
7) Evidence делай максимально близким к исходному тексту: используй короткие почти дословные фрагменты, а не пересказ. Если точной цитаты нет, выбери самый близкий короткий фрагмент из оригинала.
8) Для interview-цитат запрещено брать текст вопроса. Используй только слова кандидата из части после "Ответ:".
9) Для каждого критерия добавь reason, который объясняет, почему именно эта цитата поддерживает оценку.
10) Не выдумывай цитаты. Если в тексте нет опоры, не добавляй evidence по этому критерию.

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
  "evidence": [
    {
      "criterion": "motivation | leadership | experience | growth",
      "quote": "<максимально близкий к исходному тексту фрагмент>",
      "reason": "<почему этот фрагмент подтверждает оценку>",
      "source": "essay | interview | background | achievements | combined"
    }
  ],
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
  motivation: 3,
  leadership: 3,
  experience: 3,
  growth: 3,
  authenticity_score: 3,
  essay_quality: 3,
  interview_quality: 3,
  contradictions: [],
  flags: [],
  strengths: [],
  concerns: ['Недостаточно данных для глубокой автоматической оценки.'],
  evidence: [],
  score_reasoning: {
    motivation: 'Мотивация выражена недостаточно ясно, поэтому оценка сдержанная.',
    leadership: 'По тексту мало проверяемых примеров лидерства.',
    experience: 'Текст даёт ограниченное количество фактов о реальном опыте.',
    growth: 'Рефлексия и выводы раскрыты слабо.',
    overall: 'Итог построен осторожно: в тексте мало надёжных сигналов, поэтому нужен ручной просмотр.',
  },
  essay_review: 'Эссе пока не даёт достаточно осмысленного материала для уверенной оценки.',
  interview_review: 'Ответы интервью пока не дают достаточно осмысленного материала для уверенной оценки.',
  authenticity_review: 'Текст выглядит слишком ограниченным по содержанию, поэтому выводы делаются с осторожностью.',
  authorship_assessment: {
    label: 'недостаточно данных',
    confidence: 0.25,
    explanation: 'Текста недостаточно, чтобы аккуратно судить о степени AI-помощи.',
    signals: [],
  },
  confidence_hint: 0.28,
}

function extractInterviewAnswers(text: string) {
  const matches = [...text.matchAll(/(?:^|\n)Ответ:\s*([\s\S]*?)(?=(?:\n\[[^\]]+\]\nВопрос:)|$)/g)]
    .map((match) => match[1].replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  if (matches.length) return matches.join('\n\n')

  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('Вопрос:') && !/^\[[^\]]+\]$/.test(line))
    .join('\n')
}

export async function extractSignals(inp: CandidateInput): Promise<LLMSignals> {
  const heuristic = buildHeuristicSignals(inp)

  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.1,
      max_tokens: 1800,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content:
            `ЭССЕ:\n${inp.essay}\n\n` +
            `ИНТЕРВЬЮ (ТОЛЬКО ОТВЕТЫ КАНДИДАТА):\n${extractInterviewAnswers(inp.interview_text)}\n\n` +
            `ПОЛНЫЙ ТЕКСТ ИНТЕРВЬЮ ДЛЯ СВЕРКИ СТРУКТУРЫ:\n${inp.interview_text}\n\n` +
            `КОНТЕКСТ:\n` +
            `GPA: ${inp.gpa}\n` +
            `Активности и мотивация: ${inp.extracurriculars}\n` +
            `Достижения: ${inp.achievements}`,
        },
      ],
    })

    const raw = resp.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw) as Partial<LLMSignals>
    const normalized = normalizeSignals(parsed)
    return mergeSignals(normalized, heuristic, false)
  } catch (err) {
    console.error('[LLM extractor]', err)
    return mergeSignals(FALLBACK, heuristic, true)
  }
}

function mergeSignals(llm: LLMSignals, heuristic: LLMSignals, llmFailed: boolean): LLMSignals {
  const essayLow = heuristic.essay_quality <= 3.5
  const interviewLow = heuristic.interview_quality <= 3.5
  const lowInfo = essayLow || interviewLow

  const merged: LLMSignals = {
    motivation: round1(mix(llm.motivation, heuristic.motivation, lowInfo ? 0.75 : 0.35)),
    leadership: round1(mix(llm.leadership, heuristic.leadership, lowInfo ? 0.75 : 0.3)),
    experience: round1(mix(llm.experience, heuristic.experience, lowInfo ? 0.75 : 0.32)),
    growth: round1(mix(llm.growth, heuristic.growth, lowInfo ? 0.75 : 0.35)),
    authenticity_score: round1(mix(llm.authenticity_score, heuristic.authenticity_score, lowInfo ? 0.8 : 0.45)),
    essay_quality: round1(mix(llm.essay_quality, heuristic.essay_quality, 0.8)),
    interview_quality: round1(mix(llm.interview_quality, heuristic.interview_quality, 0.8)),
    contradictions: uniqStrings([...llm.contradictions, ...heuristic.contradictions]),
    flags: uniqStrings([...llm.flags, ...heuristic.flags]),
    strengths: uniqStrings([...llm.strengths, ...heuristic.strengths]),
    concerns: uniqStrings([...llm.concerns, ...heuristic.concerns]),
    evidence: llm.evidence.length ? llm.evidence : heuristic.evidence,
    score_reasoning: mergeReasoning(llm.score_reasoning, heuristic.score_reasoning, lowInfo),
    essay_review: heuristic.essay_review,
    interview_review: heuristic.interview_review,
    authenticity_review: lowInfo ? heuristic.authenticity_review : safeText(llm.authenticity_review, heuristic.authenticity_review),
    authorship_assessment: lowInfo ? heuristic.authorship_assessment : mergeAuthorship(llm.authorship_assessment, heuristic.authorship_assessment),
    confidence_hint: clamp01(mix(llm.confidence_hint, heuristic.confidence_hint, lowInfo ? 0.75 : 0.3)),
  }

  if (llmFailed) {
    merged.score_reasoning.overall = heuristic.score_reasoning.overall
    merged.authenticity_review = heuristic.authenticity_review
  }

  return merged
}

function buildHeuristicSignals(inp: CandidateInput): LLMSignals {
  const essay = assessEssayQuality(inp.essay)
  const interview = assessInterviewQuality(inp.interview_text)
  const lowInfo = essay.likelyLowInformation || interview.likelyLowInformation

  const backgroundWords = countWords(inp.extracurriculars) + countWords(inp.achievements)
  const contextBoost = backgroundWords > 90 ? 1.2 : backgroundWords > 40 ? 0.6 : 0

  const baseFromText = Math.min(essay.score, interview.score)
  const motivation = clamp10((essay.score + interview.score) / 2 + contextBoost * 0.6)
  const leadership = clamp10(baseFromText * 0.72 + contextBoost * 0.9)
  const experience = clamp10(baseFromText * 0.74 + contextBoost)
  const growth = clamp10((essay.score * 0.65 + interview.score * 0.85) / 1.5 + contextBoost * 0.4)
  const authenticity = clamp10(Math.min(essay.score, interview.score) - (lowInfo ? 0.8 : 0))

  const flags: string[] = []
  const concerns: string[] = []
  const strengths: string[] = []

  if (essay.likelyLowInformation) {
    flags.push('Эссе выглядит малосодержательным или случайно заполненным.')
    concerns.push('Эссе не раскрывает мотивацию и почти не даёт фактов для оценки.')
  } else {
    strengths.push('Эссе даёт материал для оценки мотивации и зрелости.')
  }

  if (interview.likelyLowInformation) {
    flags.push('Ответы интервью выглядят слишком слабыми или бессвязными.')
    concerns.push('Интервью не показывает внятную рефлексию, примеры или позицию кандидата.')
  } else {
    strengths.push('В интервью есть достаточно текста для оценки глубины ответов.')
  }

  if (countWords(inp.extracurriculars) < 25) concerns.push('Блок про опыт и активности раскрыт слабо.')
  if (countWords(inp.achievements) < 12) concerns.push('Достижения перечислены кратко и почти без контекста.')

  const scoreReasoning = {
    motivation: essay.likelyLowInformation
      ? 'Мотивация оценена низко, потому что эссе почти не содержит осмысленного объяснения причин и целей.'
      : 'Мотивация в первую очередь оценивалась по тому, насколько связно и конкретно кандидат объясняет свои цели и причины участия.',
    leadership: interview.likelyLowInformation
      ? 'Лидерство оценено низко, потому что в интервью нет развёрнутых ситуаций, где кандидат описывает инициативу или ответственность.'
      : 'Лидерство оценивалось по примерам инициативы, ответственности и умению действовать в сложной ситуации.',
    experience: countWords(inp.extracurriculars) + countWords(inp.achievements) < 35
      ? 'Опыт оценён сдержанно: блоки про активности и достижения раскрыты слишком кратко.'
      : 'Опыт оценивался по конкретике в достижениях, активностях и следам реальной практики.',
    growth: interview.likelyLowInformation
      ? 'Рост оценён низко, потому что в ответах почти нет рефлексии и выводов о собственном развитии.'
      : 'Рост оценивался по глубине рефлексии, честности и способности формулировать выводы из трудностей.',
    overall: lowInfo
      ? 'Итог заметно снижен, потому что эссе и/или интервью содержат мало осмысленного текста: много повторов, коротких фрагментов или случайных букв. При таком качестве текста система не может дать высокий балл.'
      : 'Итог строится на сочетании содержательности эссе, глубины интервью и конкретики в опыте. Чем меньше фактов и рефлексии, тем осторожнее общий балл.',
  }

  const authorship = buildAuthorshipAssessment(essay, interview)

  return {
    motivation,
    leadership,
    experience,
    growth,
    authenticity_score: authenticity,
    essay_quality: essay.score,
    interview_quality: interview.score,
    contradictions: [],
    flags: uniqStrings(flags),
    strengths: uniqStrings(strengths),
    concerns: uniqStrings(concerns),
    evidence: buildEvidence(inp, {
      motivation,
      leadership,
      experience,
      growth,
      score_reasoning: scoreReasoning,
    }),
    score_reasoning: scoreReasoning,
    essay_review: essay.summary,
    interview_review: interview.summary,
    authenticity_review: lowInfo
      ? 'В тексте есть признаки низкой содержательности: повторы, короткие токены или случайные символы. Это больше похоже на слабое или тестовое заполнение, чем на полноценный ответ.'
      : 'Текст выглядит достаточно естественным для содержательной оценки: есть связные предложения и нормальная плотность смысла.',
    authorship_assessment: authorship,
    confidence_hint: lowInfo ? 0.24 : 0.62,
  }
}

function buildAuthorshipAssessment(essay: ReturnType<typeof assessEssayQuality>, interview: ReturnType<typeof assessInterviewQuality>): AuthorshipAssessment {
  const signals = uniqStrings([...essay.reasons, ...interview.reasons]).slice(0, 4)
  const lowInfo = essay.likelyLowInformation || interview.likelyLowInformation

  if (lowInfo) {
    return {
      label: 'недостаточно данных',
      confidence: 0.35,
      explanation:
        'Текст слишком бедный по смыслу, чтобы надёжно судить о том, писал ли его человек сам или использовал AI-помощь. Основная проблема здесь не “AI-стиль”, а низкая содержательность.',
      signals,
    }
  }

  return {
    label: 'скорее человек',
    confidence: 0.55,
    explanation: 'По одной заявке нельзя уверенно определять помощь ИИ, но текст выглядит достаточно естественным и не содержит явных машинных шаблонов.',
    signals,
  }
}

function buildEvidence(
  inp: CandidateInput,
  data: {
    motivation: number
    leadership: number
    experience: number
    growth: number
    score_reasoning: ScoreReasoning
  }
): EvidenceItem[] {
  const items: Array<{
    criterion: EvidenceCriterion
    score: number
    reason: string
    texts: Array<{ source: EvidenceItem['source']; text: string }>
    keywords: string[]
  }> = [
    {
      criterion: 'motivation',
      score: data.motivation,
      reason: data.score_reasoning.motivation,
      texts: [
        { source: 'essay', text: inp.essay },
        { source: 'background', text: inp.extracurriculars },
      ],
      keywords: ['хочу', 'почему', 'цель', 'мечта', 'важно', 'присоедин', 'invision', 'учиться'],
    },
    {
      criterion: 'leadership',
      score: data.leadership,
      reason: data.score_reasoning.leadership,
      texts: [
        { source: 'interview', text: extractInterviewAnswers(inp.interview_text) },
        { source: 'background', text: inp.extracurriculars },
        { source: 'achievements', text: inp.achievements },
      ],
      keywords: ['команд', 'иници', 'организ', 'лидер', 'взял', 'ответствен', 'руковод'],
    },
    {
      criterion: 'experience',
      score: data.experience,
      reason: data.score_reasoning.experience,
      texts: [
        { source: 'achievements', text: inp.achievements },
        { source: 'background', text: inp.extracurriculars },
      ],
      keywords: ['проект', 'олимпи', 'стаж', 'достиж', 'опыт', 'волонт', 'конкурс'],
    },
    {
      criterion: 'growth',
      score: data.growth,
      reason: data.score_reasoning.growth,
      texts: [
        { source: 'interview', text: extractInterviewAnswers(inp.interview_text) },
        { source: 'essay', text: inp.essay },
      ],
      keywords: ['науч', 'понял', 'рост', 'развива', 'вызов', 'ошиб', 'справил'],
    },
  ]

  const evidence: EvidenceItem[] = []

  for (const item of items) {
    const quote = findBestQuote(item.texts, item.keywords)
    if (!quote) continue
    evidence.push({
      criterion: item.criterion,
      quote: quote.quote,
      source: quote.source,
      reason: item.reason,
      score: round1(item.score),
    })
  }

  return evidence
}

function findBestQuote(
  texts: Array<{ source: EvidenceItem['source']; text: string }>,
  keywords: string[]
): { quote: string; source: EvidenceItem['source'] } | null {
  let fallback: { quote: string; source: EvidenceItem['source']; score: number } | null = null

  for (const text of texts) {
    const fragments = splitFragments(text.text)
    for (const fragment of fragments) {
      const quote = sanitizeQuote(fragment, text.source)
      if (!quote) continue

      const normalized = quote.toLowerCase()
      const hitScore = keywords.reduce((acc, keyword) => (normalized.includes(keyword) ? acc + 3 : acc), 0)
      const firstPersonBonus = /(я\b|мы\b|мне\b|мой\b|смог|сделал|организовал|создал|участвовал)/i.test(quote) ? 2 : 0
      const richness = Math.min(quote.length, 130) / 90
      const score = hitScore + firstPersonBonus + richness
      if (!fallback || score > fallback.score) {
        fallback = { quote, source: text.source, score }
      }
    }
  }

  if (!fallback) return null
  if (fallback.score < 2.2) return null
  return { quote: fallback.quote, source: fallback.source }
}

function splitFragments(text: string): string[] {
  return text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter((part) => part.length >= 18)
}

function truncateQuote(text: string) {
  if (text.length <= 160) return text
  return `${text.slice(0, 157).trim()}...`
}

function mergeReasoning(llm: ScoreReasoning, heuristic: ScoreReasoning, lowInfo: boolean): ScoreReasoning {
  if (lowInfo) return heuristic
  return {
    motivation: safeText(llm?.motivation, heuristic.motivation),
    leadership: safeText(llm?.leadership, heuristic.leadership),
    experience: safeText(llm?.experience, heuristic.experience),
    growth: safeText(llm?.growth, heuristic.growth),
    overall: safeText(llm?.overall, heuristic.overall),
  }
}

function mergeAuthorship(llm: AuthorshipAssessment, heuristic: AuthorshipAssessment): AuthorshipAssessment {
  return {
    label: normalizeLabel(llm?.label),
    confidence: clamp01(llm?.confidence),
    explanation: safeText(llm?.explanation, heuristic.explanation),
    signals: uniqStrings([...(llm?.signals ?? []), ...(heuristic.signals ?? [])]),
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
    essay_quality: clamp10(input.essay_quality ?? input.authenticity_score),
    interview_quality: clamp10(input.interview_quality ?? input.authenticity_score),
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
    essay_review: safeText(input.essay_review, FALLBACK.essay_review),
    interview_review: safeText(input.interview_review, FALLBACK.interview_review),
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

function sanitizeEvidence(evidence: unknown): EvidenceItem[] {
  if (!evidence) return []

  if (Array.isArray(evidence)) {
    return evidence
      .map((item) => normalizeEvidenceItem(item))
      .filter((item): item is EvidenceItem => Boolean(item))
  }

  if (typeof evidence === 'object') {
    const legacy = evidence as Record<string, unknown>
    const items: EvidenceItem[] = []
    for (const criterion of ['motivation', 'leadership', 'experience', 'growth'] as EvidenceCriterion[]) {
      const value = legacy[criterion]
      if (typeof value !== 'string' || !value.trim()) continue
      items.push({
        criterion,
        quote: value.trim(),
        reason: FALLBACK.score_reasoning[criterion],
        source: 'combined',
      })
    }
    return items
  }

  return []
}

function normalizeEvidenceItem(value: unknown): EvidenceItem | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  const criterion = normalizeCriterion(item.criterion)
  const quote = sanitizeQuote(safeText(item.quote, ''), normalizeSource(item.source))
  const reason = safeText(item.reason, '')
  if (!criterion || !quote || !reason) return null

  return {
    criterion,
    quote,
    reason,
    source: normalizeSource(item.source),
    score: typeof item.score === 'number' ? round1(clamp10(item.score)) : undefined,
  }
}

function normalizeCriterion(value: unknown): EvidenceCriterion | null {
  if (value === 'motivation' || value === 'leadership' || value === 'experience' || value === 'growth') return value
  return null
}

function sanitizeQuote(value: string, source: EvidenceItem['source']) {
  const trimmed = value.replace(/\s+/g, ' ').trim()
  if (!trimmed) return ''

  if (source === 'interview') {
    if (trimmed.startsWith('Вопрос:')) return ''
    const answerOnly = trimmed.includes('Ответ:') ? trimmed.split('Ответ:').slice(1).join('Ответ:').trim() : trimmed
    if (!answerOnly || isLikelyPromptOrQuestion(answerOnly)) return ''
    return truncateQuote(answerOnly)
  }

  if (isLikelyPromptOrQuestion(trimmed)) return ''
  return truncateQuote(trimmed)
}

function isLikelyPromptOrQuestion(value: string) {
  const lower = value.toLowerCase().trim()
  if (!lower) return true
  if (lower.startsWith('вопрос:')) return true
  if (lower.endsWith('?')) return true
  if (/^(почему|как|что|какой|какова|каков|когда|где|зачем|расскажите|опишите)\b/i.test(lower)) return true
  if (/(ваш ответ|why do you want|tell us|describe)/i.test(lower)) return true
  if (lower.includes('почему вы хотите') || lower.includes('расскажите о ситуации') || lower.includes('опишите значимый вызов')) return true
  return false
}

function normalizeSource(value: unknown): EvidenceItem['source'] {
  if (value === 'essay' || value === 'interview' || value === 'background' || value === 'achievements' || value === 'combined') {
    return value
  }
  return 'combined'
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
  return [...new Set(value.filter((item): item is string => typeof item === 'string').map((v) => v.trim()).filter(Boolean))]
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

function mix(primary: number, secondary: number, secondaryWeight: number) {
  const sw = clamp01(secondaryWeight)
  return primary * (1 - sw) + secondary * sw
}

function round1(value: number) {
  return Math.round(value * 10) / 10
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}
