import { LLMSignals, ScoringResult } from '@/types'

const VERSION = '1.4.0'
const DISCLAIMER =
  'Оценка сформирована с помощью ИИ и служит опорой для рассмотрения заявки, но не заменяет решение комиссии. Итоговое решение всегда остаётся за людьми.'

export function aggregate(baseline: number, signals: LLMSignals): ScoringResult {
  const baseline10 = baseline / 10

  const motivation_final = round1(signals.motivation * 0.86 + baseline10 * 0.14)
  const leadership_final = round1(signals.leadership * 0.9 + baseline10 * 0.1)
  const experience_final = round1(signals.experience * 0.82 + baseline10 * 0.18)
  const growth_final = round1(signals.growth * 0.9 + baseline10 * 0.1)

  const qualitativeRaw =
    motivation_final * 0.25 +
    leadership_final * 0.2 +
    experience_final * 0.18 +
    growth_final * 0.17 +
    signals.authenticity_score * 0.08 +
    signals.essay_quality * 0.06 +
    signals.interview_quality * 0.06

  const contentPenalty = clamp((6 - signals.essay_quality) * 4.2 + (6 - signals.interview_quality) * 4.8, 0, 36)
  const issuePenalty = clamp(
    signals.contradictions.length * 2.5 +
      Math.max(0, 4 - signals.authenticity_score) * 1.8 +
      Math.max(0, signals.flags.length - 1) * 0.9 +
      contentPenalty,
    0,
    44
  )

  let overall = clamp(Math.round(qualitativeRaw * 10 * 0.8 + baseline * 0.2 - issuePenalty), 0, 100)

  const bothVeryWeak = signals.essay_quality <= 2.6 && signals.interview_quality <= 2.6
  const oneExtremelyWeak = signals.essay_quality <= 2.2 || signals.interview_quality <= 2.2
  const oneWeak = signals.essay_quality <= 3.4 || signals.interview_quality <= 3.4

  if (bothVeryWeak) overall = Math.min(overall, 16)
  else if (oneExtremelyWeak) overall = Math.min(overall, 24)
  else if (oneWeak) overall = Math.min(overall, 42)

  let confidence = signals.confidence_hint
  confidence += Math.min(signals.strengths.length, 3) * 0.03
  confidence -= signals.flags.length * 0.05
  confidence -= signals.contradictions.length * 0.08
  confidence -= Math.max(0, 4 - signals.authenticity_score) * 0.04
  confidence -= Math.max(0, 5 - Math.min(signals.essay_quality, signals.interview_quality)) * 0.04
  confidence = Math.round(clamp(confidence, 0.1, 0.98) * 100) / 100

  const flags = [...signals.flags]
  if (confidence < 0.4) flags.push('Низкая уверенность модели — рекомендуется ручная проверка.')
  if (signals.contradictions.length) flags.push('Есть расхождения между эссе и интервью.')
  if (signals.authenticity_score < 4) flags.push('Текст выглядит недостаточно естественным или слишком шаблонным.')
  if (signals.essay_quality < 4) flags.push('Эссе заметно снижает итог из-за низкой содержательности.')
  if (signals.interview_quality < 4) flags.push('Интервью заметно снижает итог из-за слабых или бессвязных ответов.')

  return {
    overall,
    motivation_final,
    leadership_final,
    experience_final,
    growth_final,
    baseline_score: baseline,
    confidence,
    flags: uniq(flags),
    contradictions: uniq(signals.contradictions),
    strengths: uniq(signals.strengths),
    concerns: uniq(signals.concerns),
    evidence: signals.evidence as Record<string, string>,
    score_reasoning: signals.score_reasoning,
    essay_review: signals.essay_review,
    interview_review: signals.interview_review,
    authenticity_review: signals.authenticity_review,
    authorship_assessment: signals.authorship_assessment,
    disclaimer: DISCLAIMER,
    scoring_version: VERSION,
  }
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function uniq(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))]
}
