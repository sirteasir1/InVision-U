import { AuthorshipAssessment, EvidenceCriterion, EvidenceItem, EvidenceSource, ScoreReasoning, ScoringResult } from '@/types'

const EVIDENCE_CRITERIA: EvidenceCriterion[] = ['motivation', 'leadership', 'experience', 'growth']
const EVIDENCE_SOURCES: EvidenceSource[] = ['essay', 'interview', 'background', 'achievements', 'combined']

const DEFAULT_REASONING: ScoreReasoning = {
  motivation: '',
  leadership: '',
  experience: '',
  growth: '',
  overall: '',
}

const DEFAULT_AUTHORSHIP: AuthorshipAssessment = {
  label: 'недостаточно данных',
  confidence: 0,
  explanation: '',
  signals: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'string') {
    try {
      return toRecord(JSON.parse(value))
    } catch {
      return null
    }
  }

  return isRecord(value) ? value : null
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function toNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeEvidenceItem(value: unknown): EvidenceItem | null {
  const item = toRecord(value)
  if (!item) return null

  const criterion = item.criterion
  const source = item.source
  if (!EVIDENCE_CRITERIA.includes(criterion as EvidenceCriterion)) return null
  if (!EVIDENCE_SOURCES.includes(source as EvidenceSource)) return null

  const quote = toString(item.quote).trim()
  const reason = toString(item.reason).trim()
  if (!quote || !reason) return null

  const score = typeof item.score === 'number' && Number.isFinite(item.score) ? item.score : undefined

  return {
    criterion: criterion as EvidenceCriterion,
    quote,
    reason,
    source: source as EvidenceSource,
    ...(typeof score === 'number' ? { score } : {}),
  }
}

export function asEvidenceArray(value: unknown): EvidenceItem[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => normalizeEvidenceItem(item)).filter((item): item is EvidenceItem => Boolean(item))
}

export function normalizeScoreReasoning(value: unknown): ScoreReasoning {
  const obj = toRecord(value)
  if (!obj) return { ...DEFAULT_REASONING }

  return {
    motivation: toString(obj.motivation),
    leadership: toString(obj.leadership),
    experience: toString(obj.experience),
    growth: toString(obj.growth),
    overall: toString(obj.overall),
  }
}

export function normalizeAuthorship(value: unknown): AuthorshipAssessment {
  const obj = toRecord(value)
  if (!obj) return { ...DEFAULT_AUTHORSHIP }

  const label = obj.label
  const validLabel =
    label === 'скорее человек' ||
    label === 'возможна помощь ИИ' ||
    label === 'выраженные признаки ИИ' ||
    label === 'недостаточно данных'
      ? label
      : 'недостаточно данных'

  return {
    label: validLabel,
    confidence: toNumber(obj.confidence, 0),
    explanation: toString(obj.explanation),
    signals: asStringArray(obj.signals),
  }
}

export function normalizeScoring(value: unknown): ScoringResult | null {
  const obj = toRecord(value)
  if (!obj) return null

  const hasMeaningfulContent = [
    'overall',
    'motivation_final',
    'leadership_final',
    'experience_final',
    'growth_final',
    'flags',
    'concerns',
    'strengths',
    'contradictions',
    'evidence',
  ].some((key) => key in obj)

  if (!hasMeaningfulContent) return null

  return {
    overall: toNumber(obj.overall, 0),
    motivation_final: toNumber(obj.motivation_final, 0),
    leadership_final: toNumber(obj.leadership_final, 0),
    experience_final: toNumber(obj.experience_final, 0),
    growth_final: toNumber(obj.growth_final, 0),
    baseline_score: toNumber(obj.baseline_score, 0),
    confidence: toNumber(obj.confidence, 0),
    flags: asStringArray(obj.flags),
    contradictions: asStringArray(obj.contradictions),
    strengths: asStringArray(obj.strengths),
    concerns: asStringArray(obj.concerns),
    evidence: asEvidenceArray(obj.evidence),
    score_reasoning: normalizeScoreReasoning(obj.score_reasoning),
    essay_review: toString(obj.essay_review),
    interview_review: toString(obj.interview_review),
    authenticity_review: toString(obj.authenticity_review),
    authorship_assessment: normalizeAuthorship(obj.authorship_assessment),
    disclaimer: toString(obj.disclaimer),
    scoring_version: toString(obj.scoring_version),
  }
}
