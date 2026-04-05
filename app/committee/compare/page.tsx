'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import CommitteeEvidence from '@/components/CommitteeEvidence'
import { CandidateDetail } from '@/types'
import { getDisplayEvidence } from '@/lib/evidence-display'

function getPw() {
  return typeof window !== 'undefined' ? sessionStorage.getItem('committee_pw') ?? '' : ''
}

function scoreValue(candidate: CandidateDetail, key: 'motivation_final' | 'leadership_final' | 'experience_final' | 'growth_final') {
  return candidate.scoring?.[key] ?? 0
}

function compareWinner(a: number, b: number) {
  if (a === b) return 'tie'
  return a > b ? 'left' : 'right'
}

function CompareMetric({ label, left, right }: { label: string; left: number; right: number }) {
  const winner = compareWinner(left, right)
  const total = Math.max(left + right, 1)
  const leftPct = Math.round((left / total) * 100)
  const rightPct = 100 - leftPct

  return (
    <div className="rounded-[24px] bg-surface-container-high/70 p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] uppercase tracking-[0.16em] font-label font-bold text-on-surface-variant">{label}</span>
        <span className="chip-muted">{winner === 'tie' ? 'Паритет' : winner === 'left' ? 'Сильнее слева' : 'Сильнее справа'}</span>
      </div>

      <div className="grid grid-cols-[72px_1fr_72px] items-center gap-4">
        <div className="text-left text-2xl font-headline font-black text-white">{left.toFixed(1)}</div>
        <div className="relative h-3 rounded-full bg-black/25 overflow-hidden">
          <div className="absolute inset-y-0 left-0 rounded-full bg-[#c5fe00]" style={{ width: `${leftPct}%` }} />
          <div className="absolute inset-y-0 right-0 rounded-full bg-white/40" style={{ width: `${rightPct}%` }} />
        </div>
        <div className="text-right text-2xl font-headline font-black text-white">{right.toFixed(1)}</div>
      </div>
    </div>
  )
}

function CandidateColumn({ candidate, sideLabel }: { candidate: CandidateDetail; sideLabel: string }) {
  const scoring = candidate.scoring
  const evidence = getDisplayEvidence(candidate)

  if (!scoring) {
    return (
      <div className="panel-soft rounded-[28px] p-6 space-y-3">
        <span className="chip-muted">{sideLabel}</span>
        <h2 className="text-2xl font-headline font-black">{candidate.full_name}</h2>
        <p className="text-on-surface-variant">Скоринг ещё не завершён, поэтому сравнение пока неполное.</p>
      </div>
    )
  }

  return (
    <div className="panel-soft rounded-[28px] p-6 md:p-7 space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip-muted">{sideLabel}</span>
          <span className="chip-lime">Итог {scoring.overall}</span>
          <span className="chip-muted">Уверенность {Math.round(scoring.confidence * 100)}%</span>
        </div>
        <h2 className="text-[2rem] leading-none font-headline font-black tracking-[-0.05em]">{candidate.full_name}</h2>
        <p className="text-sm break-all text-on-surface-variant">{candidate.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ['Мотивация', scoring.motivation_final],
          ['Лидерство', scoring.leadership_final],
          ['Опыт', scoring.experience_final],
          ['Рост', scoring.growth_final],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[22px] bg-surface-container-high/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] font-label font-bold text-on-surface-variant">{label}</p>
            <p className="mt-3 text-3xl font-headline font-black text-white">{Number(value).toFixed(1)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-[22px] bg-surface-container-high/70 p-5 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.16em] font-label font-bold text-primary-container">Сильные стороны</p>
          {scoring.strengths.length ? scoring.strengths.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary-container text-base mt-0.5">check_circle</span>
              <p className="text-sm leading-relaxed text-on-surface-variant">{item}</p>
            </div>
          )) : <p className="text-sm text-on-surface-variant">Явные сильные стороны не выделены.</p>}
        </div>
        <div className="rounded-[22px] bg-surface-container-high/70 p-5 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.16em] font-label font-bold text-error-dim">Зоны внимания</p>
          {scoring.concerns.length ? scoring.concerns.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-error text-base mt-0.5">priority_high</span>
              <p className="text-sm leading-relaxed text-on-surface-variant">{item}</p>
            </div>
          )) : <p className="text-sm text-on-surface-variant">Серьёзные риски не выделены.</p>}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.16em] font-label font-bold text-primary-container">Основания</p>
        <CommitteeEvidence evidence={evidence} compact />
      </div>
    </div>
  )
}

export default function ComparePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestKey = (searchParams.get('ids') ?? '').trim()
  const ids = useMemo(() => requestKey.split(',').map((item) => item.trim()).filter(Boolean), [requestKey])

  const [candidates, setCandidates] = useState<CandidateDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    if (!requestKey || ids.length !== 2) {
      setCandidates([])
      setLoading(false)
      setError('Для сравнения нужно выбрать ровно 2 заявки.')
      return
    }

    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`/api/committee/compare?ids=${requestKey}`, {
          headers: { 'x-committee-password': getPw() },
          cache: 'no-store',
        })

        if (res.status === 401) {
          router.push('/auth?role=committee')
          return
        }

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Не удалось загрузить экран сравнения.')
        if (!active) return
        setCandidates(data.candidates ?? [])
      } catch (err) {
        if (!active) return
        setCandidates([])
        setError(err instanceof Error ? err.message : 'Не удалось загрузить экран сравнения.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [ids.length, requestKey, router])

  const [left, right] = candidates
  const leftOverall = left?.scoring?.overall ?? 0
  const rightOverall = right?.scoring?.overall ?? 0
  const gap = Math.abs(leftOverall - rightOverall)
  const winner = leftOverall === rightOverall ? 'tie' : leftOverall > rightOverall ? left?.full_name : right?.full_name

  return (
    <div className="px-4 md:px-10 pb-16 max-w-[1500px] mx-auto">
      <div className="py-10 space-y-8">
        <div className="space-y-4 max-w-4xl">
          <Link href="/committee/candidates" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-white text-sm font-label font-bold transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Назад к списку
          </Link>
          <span className="chip-muted">Сравнение заявок</span>
          <h1 className="text-display-md font-headline font-black tracking-tighter leading-[0.94]">Кандидат A и кандидат B</h1>
          <p className="max-w-3xl text-on-surface-variant leading-relaxed">
            Здесь видно не только итоговый балл, но и причины: баллы по критериям, сильные стороны, риски и цитаты из ответов кандидатов.
          </p>
        </div>

        {loading ? (
          <div className="panel-soft rounded-[28px] p-16 text-center space-y-3">
            <div className="w-24 h-1.5 shimmer rounded-full mx-auto" />
            <p className="text-on-surface-variant text-sm font-label">Загружаем сравнение…</p>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 bg-error-container/10 rounded-xl p-5 border border-error-container/30">
            <span className="material-symbols-outlined text-error shrink-0 mt-0.5">error</span>
            <p className="text-error-dim text-sm font-label">{error}</p>
          </div>
        ) : left && right ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px_1fr] gap-5 items-stretch">
              <div className="panel-soft rounded-[28px] p-6 md:p-7 space-y-3">
                <span className="chip-muted">Кандидат A</span>
                <h2 className="text-[2rem] font-headline font-black tracking-[-0.05em]">{left.full_name}</h2>
                <p className="text-on-surface-variant break-all">{left.email}</p>
                <p className="text-5xl font-headline font-black text-primary-container">{leftOverall}</p>
              </div>

              <div className="panel-soft rounded-[28px] p-6 md:p-7 flex flex-col justify-center text-center space-y-4">
                <span className="chip-lime mx-auto">Разрыв {gap}</span>
                <p className="text-sm uppercase tracking-[0.18em] font-label font-bold text-on-surface-variant">Лидирует по итогу</p>
                <p className="text-[1.8rem] leading-none font-headline font-black text-white">{winner === 'tie' ? 'Паритет' : winner}</p>
                <p className="text-sm leading-relaxed text-on-surface-variant">Используйте этот экран как опору для обсуждения, а не как автоматическое решение.</p>
              </div>

              <div className="panel-soft rounded-[28px] p-6 md:p-7 space-y-3">
                <span className="chip-muted">Кандидат B</span>
                <h2 className="text-[2rem] font-headline font-black tracking-[-0.05em]">{right.full_name}</h2>
                <p className="text-on-surface-variant break-all">{right.email}</p>
                <p className="text-5xl font-headline font-black text-primary-container">{rightOverall}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <CompareMetric label="Мотивация" left={scoreValue(left, 'motivation_final')} right={scoreValue(right, 'motivation_final')} />
              <CompareMetric label="Лидерство" left={scoreValue(left, 'leadership_final')} right={scoreValue(right, 'leadership_final')} />
              <CompareMetric label="Опыт" left={scoreValue(left, 'experience_final')} right={scoreValue(right, 'experience_final')} />
              <CompareMetric label="Рост" left={scoreValue(left, 'growth_final')} right={scoreValue(right, 'growth_final')} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
              <CandidateColumn candidate={left} sideLabel="Кандидат A" />
              <CandidateColumn candidate={right} sideLabel="Кандидат B" />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
