import { CandidateInput, ScoringResult } from '@/types'
import { computeBaseline } from './baseline'
import { extractSignals }  from './llm-extractor'
import { aggregate }       from './aggregator'

export async function runPipeline(inp: CandidateInput): Promise<ScoringResult> {
  const baseline = computeBaseline(inp)   // step 1: fast, deterministic
  const signals  = await extractSignals(inp) // step 2: GPT-4o
  return aggregate(baseline, signals)        // step 3: your rules
}
