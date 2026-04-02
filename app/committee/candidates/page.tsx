'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CandidateListItem } from '@/types'

function getPw() {
  return typeof window !== 'undefined' ? sessionStorage.getItem('committee_pw') ?? '' : ''
}

function ScorePill({ v }: { v: number | null }) {
  if (v === null) return <span className="chip-muted">—</span>
  if (v >= 70) return <span className="chip-lime">{v}</span>
  if (v >= 45)
    return <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant font-label font-bold text-xs rounded-full px-3 py-1">{v}</span>
  return <span className="inline-flex items-center gap-1 bg-error-container/25 text-error font-label font-bold text-xs rounded-full px-3 py-1">{v}</span>
}

function StatusDot({ s }: { s: string }) {
  if (s === 'scored') return <span className="w-2 h-2 rounded-full bg-primary-container inline-block" />
  if (s === 'error') return <span className="w-2 h-2 rounded-full bg-error-dim inline-block" />
  return <span className="w-2 h-2 rounded-full bg-on-surface-variant inline-block animate-pulse" />
}

function statusLabel(status: string) {
  if (status === 'scored') return 'Оценено'
  if (status === 'error') return 'Ошибка'
  return 'В обработке'
}

export default function CandidatesPage() {
  const router = useRouter()
  const [list, setList] = useState<CandidateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
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
      if (!res.ok) throw new Error(data.error || 'Не удалось загрузить заявки.')
      setList(data.candidates ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить заявки.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  async function del(id: string, name: string) {
    if (!confirm(`Удалить заявку ${name}? Это действие нельзя отменить.`)) return
    setDeleting(id)
    setError('')
    try {
      const res = await fetch(`/api/committee/${id}`, {
        method: 'DELETE',
        headers: { 'x-committee-password': getPw() },
        cache: 'no-store',
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        router.push('/auth?role=committee')
        return
      }
      if (!res.ok) throw new Error(data.error || 'Не удалось удалить заявку.')
      setList((current) => current.filter((x) => x.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить заявку.')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = list.filter((c) => c.full_name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))

  const scored = list.filter((c) => c.status === 'scored').length
  const pending = list.filter((c) => c.status === 'pending').length
  const errors = list.filter((c) => c.status === 'error').length
  const avgScore = scored > 0 ? Math.round(list.filter((c) => c.overall !== null).reduce((a, c) => a + (c.overall ?? 0), 0) / scored) : null

  return (
    <div className="px-4 md:px-10 pb-16 max-w-[1440px] mx-auto">
      <div className="py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="chip-muted">Панель комиссии</span>
            <h1 className="text-display-md font-headline font-black tracking-tighter">Заявки</h1>
          </div>
          <button onClick={load} className="flex items-center gap-2 rounded-full border border-white/6 px-4 py-2 text-on-surface-variant hover:text-primary-container hover:bg-white/[0.03] text-sm font-label font-bold transition-all duration-200 self-start md:self-auto">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Обновить
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Всего', value: list.length, color: 'text-white' },
            { label: 'Оценено', value: scored, color: 'text-primary-container' },
            { label: 'В обработке', value: pending, color: 'text-on-surface-variant' },
            { label: 'Средний балл', value: avgScore ?? '—', color: 'text-primary-container' },
          ].map((stat) => (
            <div key={stat.label} className="panel-soft panel-interactive rounded-[24px] px-6 py-5">
              <p className={`text-4xl font-headline font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 panel-soft panel-interactive rounded-[24px] p-5">
          <span className="material-symbols-outlined text-primary-container shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <p className="text-on-surface-variant text-sm font-label">
            AI помогает комиссии быстрее увидеть сильные стороны, риски, противоречия и причины выставленных оценок, но не принимает финального решения вместо людей.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-error-container/10 rounded-xl p-5 border border-error-container/30">
            <span className="material-symbols-outlined text-error shrink-0 mt-0.5">error</span>
            <p className="text-error-dim text-sm font-label">{error}</p>
          </div>
        )}
      </div>

      <div className="mb-5 relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input className="iv-input-ghost pl-12" placeholder="Поиск по имени или email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="panel-soft panel-interactive rounded-[28px] p-16 text-center space-y-3">
          <div className="w-24 h-1.5 shimmer rounded-full mx-auto" />
          <p className="text-on-surface-variant text-sm font-label">Загружаем заявки…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel-soft panel-interactive rounded-[28px] p-16 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">inbox</span>
          <p className="text-on-surface-variant font-label">{search ? 'По вашему запросу ничего не найдено.' : 'Пока нет ни одной заявки.'}</p>
        </div>
      ) : (
        <div className="panel-soft rounded-[28px] overflow-hidden border border-white/5">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-high">
            {[
              { l: 'Кандидат', c: 'col-span-4' },
              { l: 'GPA', c: 'col-span-1 text-center' },
              { l: 'Балл', c: 'col-span-1 text-center' },
              { l: 'Уверенность', c: 'col-span-2 text-center' },
              { l: 'Статус', c: 'col-span-2 text-center' },
              { l: '', c: 'col-span-2 text-right' },
            ].map((h) => (
              <div key={h.l} className={`text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest ${h.c}`}>
                {h.l}
              </div>
            ))}
          </div>

          <div>
            {filtered.map((c, i) => (
              <div key={c.id} className={`grid grid-cols-12 gap-4 px-6 py-5 items-center committee-row ${i !== 0 ? 'border-t border-surface-container-high/40' : ''}`}>
                <div className="col-span-12 md:col-span-4 space-y-1">
                  <p className="font-headline font-bold text-white text-sm">{c.full_name}</p>
                  <p className="text-on-surface-variant text-xs font-label">{c.email}</p>
                  {c.flags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {c.flags.slice(0, 2).map((f, fi) => (
                        <span key={fi} className="text-xs bg-error-container/20 text-error font-label rounded-full px-2.5 py-0.5">{f}</span>
                      ))}
                      {c.flags.length > 2 && <span className="text-xs text-on-surface-variant font-label">+{c.flags.length - 2}</span>}
                    </div>
                  )}
                </div>

                <div className="col-span-4 md:col-span-1 text-center">
                  <span className="text-white font-headline font-bold text-sm">{c.gpa.toFixed(2)}</span>
                </div>

                <div className="col-span-4 md:col-span-1 text-center">
                  <ScorePill v={c.overall} />
                </div>

                <div className="col-span-4 md:col-span-2 text-center">
                  {c.confidence !== null ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-14 score-bar-track">
                        <div className="score-bar-fill" style={{ width: `${c.confidence * 100}%` }} />
                      </div>
                      <span className="text-on-surface-variant text-xs font-label">{Math.round(c.confidence * 100)}%</span>
                    </div>
                  ) : (
                    <span className="text-on-surface-variant text-xs font-label">—</span>
                  )}
                </div>

                <div className="col-span-6 md:col-span-2 flex items-center justify-center gap-2">
                  <StatusDot s={c.status} />
                  <span className="text-on-surface-variant text-xs font-label">{statusLabel(c.status)}</span>
                </div>

                <div className="col-span-6 md:col-span-2 flex items-center justify-end gap-2">
                  <Link href={`/committee/candidates/${c.id}`} className="flex items-center gap-2 text-primary-container hover:text-white text-sm font-label font-bold transition-colors duration-200">
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    Открыть
                  </Link>
                  <button onClick={() => del(c.id, c.full_name)} disabled={deleting === c.id} className="flex items-center gap-2 text-error hover:text-error-dim text-sm font-label font-bold transition-colors duration-200 disabled:opacity-50">
                    <span className="material-symbols-outlined text-base">delete</span>
                    {deleting === c.id ? 'Удаление…' : 'Удалить'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-on-surface-variant text-xs font-label">
        Ошибок обработки: {errors}
      </div>
    </div>
  )
}
