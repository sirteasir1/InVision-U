export interface TextQualityReport {
  score: number
  likelyLowInformation: boolean
  summary: string
  reasons: string[]
}

const WORD_RE = /[\p{L}\p{N}-]+/gu

export function assessEssayQuality(text: string): TextQualityReport {
  return assessTextQuality(text, { kind: 'essay', minWords: 90, goodWords: 180 })
}

export function assessInterviewQuality(text: string): TextQualityReport {
  const extractedAnswers = extractInterviewAnswers(text)
  return assessTextQuality(extractedAnswers || text, { kind: 'interview', minWords: 120, goodWords: 220 })
}

function assessTextQuality(text: string, opts: { kind: 'essay' | 'interview'; minWords: number; goodWords: number }): TextQualityReport {
  const normalized = normalize(text)
  const tokens = normalized.match(WORD_RE) ?? []
  const words = tokens.length
  const sentences = text.split(/[.!?\n]+/).map((v) => v.trim()).filter(Boolean)
  const uniqueRatio = words ? new Set(tokens).size / words : 0
  const shortTokenRatio = words ? tokens.filter((w) => w.length <= 2).length / words : 1
  const longTokenRatio = words ? tokens.filter((w) => w.length >= 5).length / words : 0
  const averageTokenLength = words ? tokens.reduce((sum, token) => sum + token.length, 0) / words : 0
  const topShare = topTokenShare(tokens)
  const repeatedChars = /(.)\1{4,}/u.test(normalized)
  const lineNoise = /(\b[\p{L}]{1,2}\b(?:\s+|$)){6,}/u.test(text)
  const repeatedShortBurst = /\b([\p{L}\p{N}]{1,3})\b(?:\s+\1\b){2,}/u.test(normalized)

  let score = 6
  const reasons: string[] = []

  if (words < opts.minWords) {
    score -= 2.6
    reasons.push(`${labelFor(opts.kind)} слишком корот${opts.kind === 'essay' ? 'ое' : 'ие'} и не раскрыва${opts.kind === 'essay' ? 'ет' : 'ют'} мысль.`)
  } else if (words >= opts.goodWords) {
    score += 1.2
    reasons.push(`${capitalize(labelFor(opts.kind))} да${opts.kind === 'essay' ? 'ёт' : 'ют'} достаточно материала для оценки.`)
  }

  if (uniqueRatio < 0.36) {
    score -= 2.2
    reasons.push('Слишком много повторов одних и тех же слов или конструкций.')
  } else if (uniqueRatio > 0.58) {
    score += 0.8
  }

  if (shortTokenRatio > 0.46) {
    score -= 2.6
    reasons.push('В тексте слишком много коротких обрывочных слов, похожих на набор символов.')
  }
  if (averageTokenLength < 3.2) {
    score -= 1.9
    reasons.push('Средняя длина слов слишком мала — текст выглядит обрывочным и малосодержательным.')
  }
  if (longTokenRatio < 0.18) {
    score -= 1.6
    reasons.push('Почти нет содержательных слов и развёрнутых формулировок.')
  }
  if (topShare > 0.28) {
    score -= 2.8
    reasons.push('Один и тот же токен повторяется слишком часто.')
  }
  if (sentences.length < 2) {
    score -= 1.4
    reasons.push('Почти нет связных предложений.')
  }
  if (repeatedChars || lineNoise || repeatedShortBurst) {
    score -= 3.6
    reasons.push('Есть признаки случайного набора букв, повторяющихся коротких токенов или механического заполнения.')
  }

  const likelyLowInformation =
    score <= 3.4 ||
    words < opts.minWords / 2 ||
    repeatedChars ||
    lineNoise ||
    repeatedShortBurst ||
    averageTokenLength < 3 ||
    (shortTokenRatio > 0.5 && topShare > 0.18)
  const clampedScore = clamp(score, 0.5, 10)

  return {
    score: round1(clampedScore),
    likelyLowInformation,
    summary: buildSummary(opts.kind, {
      words,
      uniqueRatio,
      shortTokenRatio,
      longTokenRatio,
      averageTokenLength,
      likelyLowInformation,
      score: clampedScore,
    }),
    reasons: uniqueStrings(reasons),
  }
}

function buildSummary(
  kind: 'essay' | 'interview',
  data: { words: number; uniqueRatio: number; shortTokenRatio: number; longTokenRatio: number; averageTokenLength: number; likelyLowInformation: boolean; score: number }
) {
  if (data.likelyLowInformation) {
    return `${capitalize(labelFor(kind))} выглядит малосодержательн${kind === 'essay' ? 'ым' : 'ыми'}: мало связного текста, заметны повторы или случайные символы, поэтому этот блок сильно понижает итоговую оценку.`
  }

  const detail: string[] = []
  if (data.words >= (kind === 'essay' ? 180 : 220)) detail.push('объём достаточный')
  if (data.uniqueRatio >= 0.5) detail.push('лексика разнообразная')
  if (data.longTokenRatio >= 0.24) detail.push('есть содержательные формулировки')
  if (data.shortTokenRatio <= 0.28) detail.push('мало обрывочных слов')
  if (data.averageTokenLength >= 4.2) detail.push('формулировки выглядят осмысленными')

  const tail = detail.length ? `: ${detail.slice(0, 3).join(', ')}.` : '.'
  return `${capitalize(labelFor(kind))} выглядит связн${kind === 'essay' ? 'ым' : 'ыми'} и пригодн${kind === 'essay' ? 'ым' : 'ыми'} для оценки${tail}`
}

function extractInterviewAnswers(text: string) {
  const matches = [...text.matchAll(/Ответ:\s*([\s\S]*?)(?=\n\n\[[^\]]+\]|$)/g)]
  return matches.map((m) => m[1]?.trim()).filter(Boolean).join('\n\n')
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s-]+/gu, ' ').replace(/\s+/g, ' ').trim()
}

function topTokenShare(tokens: string[]) {
  if (!tokens.length) return 1
  const counts = new Map<string, number>()
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1)
  const max = Math.max(...counts.values())
  return max / tokens.length
}

function labelFor(kind: 'essay' | 'interview') {
  return kind === 'essay' ? 'эссе' : 'интервью'
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function round1(value: number) {
  return Math.round(value * 10) / 10
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function uniqueStrings(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))]
}
