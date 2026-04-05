'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CandidateListItem } from '@/types'

function getPw() {
  return typeof window !== 'undefined' ? sessionStorage.getItem('committee_pw') ?? '' : ''
}

function StatCard({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="panel-soft panel-interactive rounded-[24px] p-7 space-y-1">
      <p className={`text-5xl font-headline font-black tracking-tighter ${accent ? 'text-primary-container' : 'text-white'}`}>{value}</p>
      <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest">{label}</p>
      {sub && <p className="text-on-surface-variant text-xs font-label">{sub}</p>}
    </div>
  )
}

export default function StatsPage() {
  const router = useRouter()
  const [list, setList] = useState<CandidateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/committee', {
        headers: { 'x-committee-password': getPw() },
        cache: 'no-store',
      })
      if (res.status === 401) {
        router.push('/auth?role=committee')
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось загрузить аналитику.')
      setList(data.candidates ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить аналитику.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  const scored = list.filter((c) => c.status === 'scored')
  const withScores = scored.filter((c) => c.overall !== null)
  const avg = withScores.length ? Math.round(withScores.reduce((a, c) => a + (c.overall ?? 0), 0) / withScores.length) : null
  const high = withScores.filter((c) => (c.overall ?? 0) >= 70).length
  const mid = withScores.filter((c) => (c.overall ?? 0) >= 45 && (c.overall ?? 0) < 70).length
  const low = withScores.filter((c) => (c.overall ?? 0) < 45).length
  const avgConf = withScores.length ? Math.round((withScores.reduce((a, c) => a + (c.confidence ?? 0), 0) / withScores.length) * 100) : null
  const flagged = list.filter((c) => c.flags.length > 0).length

  const buckets = [
    { range: '0–30', count: withScores.filter((c) => (c.overall ?? 0) < 30).length, color: 'bg-error-dim' },
    { range: '30–45', count: withScores.filter((c) => (c.overall ?? 0) >= 30 && (c.overall ?? 0) < 45).length, color: 'bg-error-dim/60' },
    { range: '45–60', count: withScores.filter((c) => (c.overall ?? 0) >= 45 && (c.overall ?? 0) < 60).length, color: 'bg-on-surface-variant' },
    { range: '60–75', count: withScores.filter((c) => (c.overall ?? 0) >= 60 && (c.overall ?? 0) < 75).length, color: 'bg-primary-container/60' },
    { range: '75–100', count: withScores.filter((c) => (c.overall ?? 0) >= 75).length, color: 'bg-primary-container' },
  ]
  const maxBucket = Math.max(...buckets.map((b) => b.count), 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-24 h-1.5 shimmer rounded-full" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-10 pb-16 max-w-[1440px] mx-auto">
      <div className="py-10 space-y-2">
        <span className="chip-muted">Аналитика</span>
        <h1 className="text-display-md font-headline font-black tracking-tighter">Сводка по заявкам</h1>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 bg-error-container/10 rounded-xl p-5 border border-error-container/30">
          <span className="material-symbols-outlined text-error shrink-0 mt-0.5">error</span>
          <p className="text-error-dim text-sm font-label">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Всего заявок" value={list.length} />
        <StatCard label="Оценено" value={scored.length} accent />
        <StatCard label="Средний балл" value={avg ?? '—'} accent sub="из 100" />
        <StatCard label="Средняя уверенность AI" value={avgConf !== null ? `${avgConf}%` : '—'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="panel-soft panel-interactive rounded-[24px] p-7 space-y-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
            <h3 className="text-white font-headline font-black">Распределение баллов</h3>
          </div>

          {withScores.length === 0 ? (
            <p className="text-on-surface-variant text-sm font-label">Пока нет оценённых заявок.</p>
          ) : (
            <div className="space-y-3">
              {buckets.map((b) => (
                <div key={b.range} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant text-xs font-label">{b.range}</span>
                    <span className="text-white text-xs font-label font-bold">{b.count}</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${b.color}`} style={{ width: `${(b.count / maxBucket) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel-soft panel-interactive rounded-[24px] p-7 space-y-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>donut_large</span>
            <h3 className="text-white font-headline font-black">Качество пула</h3>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Сильные (70+)', count: high, color: 'bg-primary-container', text: 'text-on-primary-container' },
              { label: 'Средние (45–69)', count: mid, color: 'bg-surface-container-high', text: 'text-on-surface-variant' },
              { label: 'Слабые (<45)', count: low, color: 'bg-error-container/40', text: 'text-error-dim' },
              { label: 'С флагами', count: flagged, color: 'bg-error-container/20', text: 'text-error' },
            ].map((row) => (
              <div key={row.label} className={`flex items-center justify-between ${row.color} rounded-xl px-5 py-4 transition-transform duration-200 hover:translate-x-1`}>
                <span className={`text-sm font-label font-bold ${row.text}`}>{row.label}</span>
                <span className={`text-2xl font-headline font-black ${row.text}`}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 panel-soft rounded-[24px] p-7 space-y-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            <h3 className="text-white font-headline font-black">Топ-5 кандидатов</h3>
          </div>

          {withScores.length === 0 ? (
            <p className="text-on-surface-variant text-sm font-label">Пока нет оценённых заявок.</p>
          ) : (
            <div className="space-y-2">
              {[...withScores]
                .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
                .slice(0, 5)
                .map((c, i) => (
                  <div key={c.id} className="flex items-center gap-4 bg-surface-container-high rounded-[20px] px-5 py-4 transition-all duration-200 hover:bg-surface-container hover:translate-y-[-1px]">
                    <span className={`text-lg font-headline font-black w-6 shrink-0 ${i === 0 ? 'text-primary-container' : 'text-on-surface-variant'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-headline font-bold text-sm truncate">{c.full_name}</p>
                      <p className="text-on-surface-variant text-xs font-label">GPA {c.gpa.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-20 score-bar-track">
                        <div className="score-bar-fill" style={{ width: `${c.overall}%` }} />
                      </div>
                      <span className="chip-lime text-xs">{c.overall}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
