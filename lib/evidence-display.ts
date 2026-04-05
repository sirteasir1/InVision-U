import { CandidateDetail, EvidenceCriterion, EvidenceItem, ScoreReasoning } from '@/types'

type RawSource = EvidenceItem['source']

type CandidateLike = Pick<CandidateDetail, 'essay' | 'interview_text' | 'extracurriculars' | 'achievements'> & {
  scoring?: {
    evidence?: EvidenceItem[]
    score_reasoning?: ScoreReasoning
    motivation_final?: number
    leadership_final?: number
    experience_final?: number
    growth_final?: number
  } | null
}

const FALLBACK_REASONING: ScoreReasoning = {
  motivation: 'Недостаточно данных для уверенного объяснения мотивации.',
  leadership: 'Недостаточно данных для уверенного объяснения лидерства.',
  experience: 'Недостаточно данных для уверенного объяснения опыта.',
  growth: 'Недостаточно данных для уверенного объяснения роста.',
  overall: 'Недостаточно данных для уверенного общего вывода.',
}

export function getDisplayEvidence(candidate: CandidateLike): EvidenceItem[] {
  const reasoning = { ...FALLBACK_REASONING, ...(candidate.scoring?.score_reasoning ?? {}) }
  const existing = (candidate.scoring?.evidence ?? [])
    .map((item) => sanitizeEvidenceItem(item))
    .filter((item): item is EvidenceItem => Boolean(item))

  const fallback = buildFallbackEvidence(candidate, reasoning, existing)
  const merged = dedupeEvidence([...existing, ...fallback])

  return merged.slice(0, 6)
}

function buildFallbackEvidence(candidate: CandidateLike, reasoning: ScoreReasoning, existing: EvidenceItem[]): EvidenceItem[] {
  const have = new Set(existing.map((item) => item.criterion))
  const interviewAnswers = extractInterviewAnswers(candidate.interview_text)

  const configs: Array<{
    criterion: EvidenceCriterion
    sourceTexts: Array<{ source: RawSource; text: string }>
    keywords: string[]
    score?: number
    reason: string
  }> = [
    {
      criterion: 'motivation',
      sourceTexts: [
        { source: 'essay', text: candidate.essay },
        { source: 'background', text: candidate.extracurriculars },
      ],
      keywords: ['хочу', 'цель', 'мечта', 'интерес', 'важно', 'почему', 'invision', 'учиться', 'помочь', 'буду'],
      score: candidate.scoring?.motivation_final,
      reason: reasoning.motivation,
    },
    {
      criterion: 'leadership',
      sourceTexts: [
        { source: 'interview', text: interviewAnswers },
        { source: 'background', text: candidate.extracurriculars },
        { source: 'achievements', text: candidate.achievements },
      ],
      keywords: ['команд', 'иници', 'организ', 'лидер', 'ответствен', 'создал', 'руковод', 'взял', 'решил'],
      score: candidate.scoring?.leadership_final,
      reason: reasoning.leadership,
    },
    {
      criterion: 'experience',
      sourceTexts: [
        { source: 'achievements', text: candidate.achievements },
        { source: 'background', text: candidate.extracurriculars },
      ],
      keywords: ['проект', 'олимпи', 'стаж', 'достиж', 'опыт', 'волонт', 'конкурс', 'курс', 'создал', 'разработ'],
      score: candidate.scoring?.experience_final,
      reason: reasoning.experience,
    },
    {
      criterion: 'growth',
      sourceTexts: [
        { source: 'interview', text: interviewAnswers },
        { source: 'essay', text: candidate.essay },
      ],
      keywords: ['понял', 'науч', 'ошиб', 'рост', 'развива', 'вызов', 'смог', 'преодол', 'узнал', 'стал'],
      score: candidate.scoring?.growth_final,
      reason: reasoning.growth,
    },
  ]

  return configs
    .filter((config) => !have.has(config.criterion))
    .map((config) => {
      const match = findBestFragment(config.sourceTexts, config.keywords)
      if (!match) return null
      return {
        criterion: config.criterion,
        quote: match.quote,
        source: match.source,
        reason: config.reason,
        score: typeof config.score === 'number' ? Math.round(config.score * 10) / 10 : undefined,
      } as EvidenceItem
    })
    .filter((item): item is EvidenceItem => Boolean(item))
}

function sanitizeEvidenceItem(item: EvidenceItem): EvidenceItem | null {
  const quote = sanitizeQuote(item.quote)
  if (!quote) return null
  return { ...item, quote }
}

function dedupeEvidence(items: EvidenceItem[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.criterion}:${item.quote.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
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

function splitFragments(text: string) {
  return text
    .replace(/\r/g, '')
    .split(/\n+|(?<=[.!?])\s+/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter((part) => part.length >= 18)
}

function sanitizeQuote(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim().replace(/^['"“”]+|['"“”]+$/g, '')
  if (!clean) return ''
  if (isLikelyQuestionOrPrompt(clean)) return ''
  if (clean.length > 180) return `${clean.slice(0, 177).trim()}...`
  return clean
}

function isLikelyQuestionOrPrompt(text: string) {
  const lower = text.toLowerCase().trim()
  if (!lower) return true
  if (lower.startsWith('вопрос:')) return true
  if (lower.startsWith('ответ:')) return false
  if (lower.endsWith('?')) return true
  if (/^(почему|как|что|какой|какова|каков|когда|где|зачем|расскажите|опишите)\b/i.test(lower)) return true
  if (/(ваш ответ|write about|tell us|describe|why do you want)/i.test(lower)) return true
  if (lower.includes('почему вы хотите') || lower.includes('расскажите о ситуации') || lower.includes('опишите значимый вызов')) return true
  return false
}

function findBestFragment(texts: Array<{ source: RawSource; text: string }>, keywords: string[]) {
  let best: { quote: string; source: RawSource; score: number } | null = null

  for (const sourceText of texts) {
    for (const fragment of splitFragments(sourceText.text)) {
      const quote = sanitizeQuote(fragment)
      if (!quote) continue

      const lower = quote.toLowerCase()
      const keywordHits = keywords.reduce((acc, keyword) => acc + (lower.includes(keyword) ? 1 : 0), 0)
      const firstPersonBonus = /(я\b|мы\b|мне\b|мой\b|наша\b|смог|сделал|организовал|создал|участвовал)/i.test(quote) ? 2 : 0
      const richness = Math.min(quote.length, 150) / 75
      const score = keywordHits * 3 + firstPersonBonus + richness

      if (!best || score > best.score) best = { quote, source: sourceText.source, score }
    }
  }

  if (!best || best.score < 2.5) return null
  return { quote: best.quote, source: best.source }
}
