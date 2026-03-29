// ─── Input from candidate form ───────────────────────────────
export interface CandidateInput {
  full_name: string
  email: string
  gpa: number
  extracurriculars: string
  achievements: string
  essay: string
  interview_text: string
  consent: boolean
}

export interface ScoreReasoning {
  motivation: string
  leadership: string
  experience: string
  growth: string
  overall: string
}

export interface AuthorshipAssessment {
  label: 'скорее человек' | 'возможна помощь ИИ' | 'выраженные признаки ИИ' | 'недостаточно данных'
  confidence: number
  explanation: string
  signals: string[]
}

export interface LLMSignals {
  motivation: number
  leadership: number
  experience: number
  growth: number
  authenticity_score: number
  contradictions: string[]
  flags: string[]
  strengths: string[]
  concerns: string[]
  evidence: {
    motivation?: string
    leadership?: string
    experience?: string
    growth?: string
  }
  score_reasoning: ScoreReasoning
  authenticity_review: string
  authorship_assessment: AuthorshipAssessment
  confidence_hint: number
}

export interface ScoringResult {
  overall: number
  motivation_final: number
  leadership_final: number
  experience_final: number
  growth_final: number
  baseline_score: number
  confidence: number
  flags: string[]
  contradictions: string[]
  strengths: string[]
  concerns: string[]
  evidence: Record<string, string>
  score_reasoning: ScoreReasoning
  authenticity_review: string
  authorship_assessment: AuthorshipAssessment
  disclaimer: string
  scoring_version: string
}

export interface CandidateListItem {
  id: string
  full_name: string
  email: string
  gpa: number
  status: 'pending' | 'scored' | 'error'
  created_at: string
  overall: number | null
  confidence: number | null
  flags: string[]
}

export interface CandidateDetail extends CandidateListItem {
  extracurriculars: string
  achievements: string
  essay: string
  interview_text: string
  consent: boolean
  scoring: ScoringResult | null
}
