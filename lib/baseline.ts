import { CandidateInput } from '@/types'

export function computeBaseline(inp: CandidateInput): number {
  let score = 0

  score += Math.min((inp.gpa / 4.0) * 30, 30)

  const essayWords = countWords(inp.essay)
  const essayUnique = uniqueRatio(inp.essay)
  if (essayWords >= 350) score += 10
  else if (essayWords >= 250) score += 8
  else if (essayWords >= 150) score += 6
  else if (essayWords >= 80) score += 3
  score += essayUnique >= 0.55 ? 5 : essayUnique >= 0.45 ? 3 : 1

  const interviewWords = countWords(inp.interview_text)
  const answerBlocks = inp.interview_text.split(/\n\n+/).filter(Boolean).length
  if (interviewWords >= 350) score += 10
  else if (interviewWords >= 220) score += 8
  else if (interviewWords >= 140) score += 6
  else if (interviewWords >= 80) score += 3
  score += answerBlocks >= 5 ? 5 : answerBlocks >= 3 ? 3 : 1

  const backgroundWords = countWords(inp.extracurriculars)
  const backgroundSections = inp.extracurriculars.split(/\n\n+/).filter(Boolean).length
  if (backgroundWords >= 220) score += 12
  else if (backgroundWords >= 150) score += 9
  else if (backgroundWords >= 90) score += 6
  else if (backgroundWords >= 40) score += 3
  score += backgroundSections >= 5 ? 8 : backgroundSections >= 3 ? 5 : 2

  const achievementsWords = countWords(inp.achievements)
  const achievementLines = inp.achievements.split(/\n+/).filter(Boolean).length
  if (achievementsWords >= 80) score += 12
  else if (achievementsWords >= 40) score += 8
  else if (achievementsWords >= 15) score += 5
  score += achievementLines >= 3 ? 8 : achievementLines >= 1 ? 4 : 1

  return Math.round(Math.min(score, 100))
}

function countWords(text: string): number {
  const value = text.trim()
  return value ? value.split(/\s+/).length : 0
}

function uniqueRatio(text: string): number {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
  if (!words.length) return 0
  return new Set(words).size / words.length
}
