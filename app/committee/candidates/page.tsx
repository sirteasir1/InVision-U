'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CandidateListItem } from '@/types'

function getPw() {
  return typeof window !== 'undefined' ? sessionStorage.getItem('committee_pw') ?? '' : ''
}

function statusLabel(status: string) {
  if (status === 'scored') return 'Оценено'
  if (status === 'error') return 'Ошибка'
  return 'В обработке'
}

function statusTone(status: string) {
  if (status === 'scored') return 'chip-lime'
  if (status === 'error') return 'chip-error'
  return 'chip-muted'
}

function scoreTone(score: number | null) {
  if (score === null) return 'text-on-surface-variant'
  if (score >= 75) return 'text-primary-container'
  if (score >= 50) return 'text-white'
  return 'text-error-dim'
}

export default function CandidatesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [list, setList] = useState<CandidateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'scored' | 'pending' | 'error'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
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

  const preselectId = searchParams.get('compare') ?? ''

  useEffect(() => {
    if (!preselectId) return
    setSelectedIds((current) => (current.includes(preselectId) ? current : [preselectId]))
  }, [preselectId])

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
      setSelectedIds((current) => current.filter((x) => x !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить заявку.')
    } finally {
      setDeleting(null)
    }
  }

  function toggleCandidate(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id)
      if (current.length === 2) return [current[1], id]
      return [...current, id]
    })
  }

  const filtered = useMemo(() => {
    return list.filter((candidate) => {
      const matchesSearch =
        candidate.full_name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' ? true : candidate.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [list, search, statusFilter])

  const scored = list.filter((c) => c.status === 'scored').length
  const pending = list.filter((c) => c.status === 'pending').length
  const errors = list.filter((c) => c.status === 'error').length
  const avgScore = scored > 0 ? Math.round(list.filter((c) => c.overall !== null).reduce((a, c) => a + (c.overall ?? 0), 0) / scored) : null

  return (
    <div className="px-4 md:px-10 pb-28 max-w-[1440px] mx-auto">
      <div className="py-10 space-y-8">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <span className="chip-muted">Панель комиссии</span>
            <h1 className="text-display-md font-headline font-black tracking-tighter">Заявки кандидатов</h1>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed text-sm md:text-base">
              Выберите две заявки и откройте экран сравнения. Внутри каждой заявки видны баллы, риски и цитаты, на которые опирается анализ.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={load}
              className="flex items-center gap-2 rounded-full border border-white/6 px-4 py-2 text-on-surface-variant hover:text-primary-container hover:bg-white/[0.03] text-sm font-label font-bold transition-all duration-200"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Обновить
            </button>
            {selectedIds.length === 2 && (
              <Link href={`/committee/compare?ids=${selectedIds.join(',')}`} className="btn-lime !py-3 !px-5 !text-sm">
                Сравнить
                <span className="material-symbols-outlined text-base">stacked_bar_chart</span>
              </Link>
            )}
          </div>
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

        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-4">
          <div className="panel-soft rounded-[26px] p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                className="iv-input-ghost pl-12"
                placeholder="Поиск по имени или email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['all', 'Все'],
                ['scored', 'Оценено'],
                ['pending', 'В обработке'],
                ['error', 'Ошибка'],
              ].map(([value, label]) => {
                const active = statusFilter === value
                return (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value as typeof statusFilter)}
                    className={`rounded-full px-4 py-2 text-sm font-label font-bold transition-all ${
                      active ? 'bg-[#c5fe00] text-[#2a3500]' : 'bg-white/[0.04] text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="panel-soft rounded-[26px] p-5 md:p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>difference</span>
              <h2 className="font-headline font-black text-lg">Сравнение</h2>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Выберите до двух заявок. На экране сравнения вы увидите баллы по критериям, сильные стороны, зоны внимания и цитаты по обеим заявкам.
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedIds.length === 0 && <span className="chip-muted">Ничего не выбрано</span>}
              {selectedIds.length > 0 && selectedIds.map((id) => <span key={id} className="chip-lime">{id.slice(0, 8)}</span>)}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-error-container/10 rounded-xl p-5 border border-error-container/30">
            <span className="material-symbols-outlined text-error shrink-0 mt-0.5">error</span>
            <p className="text-error-dim text-sm font-label">{error}</p>
          </div>
        )}
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filtered.map((candidate) => {
            const isSelected = selectedIds.includes(candidate.id)
            const submittedAt = candidate.created_at
              ? new Date(candidate.created_at).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })
              : '—'

            return (
              <div
                key={candidate.id}
                className={`panel-soft panel-interactive rounded-[28px] p-6 md:p-7 border ${
                  isSelected ? 'border-[#c5fe00]/40 shadow-[0_22px_60px_rgba(197,254,0,0.08)]' : 'border-white/5'
                }`}
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={statusTone(candidate.status)}>{statusLabel(candidate.status)}</span>
                        <span className="chip-muted">GPA {candidate.gpa.toFixed(2)}</span>
                        {candidate.confidence !== null && <span className="chip-muted">Уверенность {Math.round(candidate.confidence * 100)}%</span>}
                      </div>
                      <h3 className="font-headline font-black text-[1.55rem] tracking-[-0.04em] text-white leading-none break-words">{candidate.full_name}</h3>
                      <p className="text-on-surface-variant text-sm break-all">{candidate.email}</p>
                    </div>

                    <button
                      onClick={() => toggleCandidate(candidate.id)}
                      className={`h-11 w-11 shrink-0 rounded-full border text-sm font-bold transition-all ${
                        isSelected
                          ? 'border-[#c5fe00] bg-[#c5fe00] text-[#2a3500]'
                          : 'border-white/10 bg-white/[0.03] text-white hover:border-white/20'
                      }`}
                      title="Добавить в сравнение"
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: `'FILL' ${isSelected ? 1 : 0}` }}>
                        check_circle
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-[22px] bg-surface-container-high/80 p-4">
                      <p className="text-[11px] font-label font-bold uppercase tracking-[0.16em] text-on-surface-variant">Итог</p>
                      <p className={`mt-3 text-4xl font-headline font-black ${scoreTone(candidate.overall)}`}>{candidate.overall ?? '—'}</p>
                    </div>
                    <div className="rounded-[22px] bg-surface-container-high/80 p-4">
                      <p className="text-[11px] font-label font-bold uppercase tracking-[0.16em] text-on-surface-variant">Создано</p>
                      <p className="mt-3 text-sm leading-relaxed text-white/88">{submittedAt}</p>
                    </div>
                    <div className="rounded-[22px] bg-surface-container-high/80 p-4">
                      <p className="text-[11px] font-label font-bold uppercase tracking-[0.16em] text-on-surface-variant">Флаги</p>
                      <p className="mt-3 text-4xl font-headline font-black text-white">{candidate.flags.length}</p>
                    </div>
                  </div>

                  {candidate.flags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {candidate.flags.slice(0, 3).map((flag, index) => (
                        <span key={index} className="inline-flex items-center rounded-full bg-error-container/20 px-3 py-1 text-xs font-label font-bold text-error">
                          {flag}
                        </span>
                      ))}
                      {candidate.flags.length > 3 && <span className="chip-muted">+{candidate.flags.length - 3}</span>}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link href={`/committee/candidates/${candidate.id}`} className="btn-lime !py-3 !px-5 !text-sm">
                      Открыть заявку
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                    </Link>
                    <button
                      onClick={() => del(candidate.id, candidate.full_name)}
                      disabled={deleting === candidate.id}
                      className="btn-danger !py-3 !px-5 !text-sm disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      {deleting === candidate.id ? 'Удаление…' : 'Удалить'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[min(960px,calc(100vw-2rem))] -translate-x-1/2 rounded-[28px] border border-white/8 bg-[#0d0d0d]/92 px-5 py-4 shadow-[0_24px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-label font-bold uppercase tracking-[0.18em] text-primary-container">Выбраны для сравнения</p>
              <div className="flex flex-wrap gap-2">
                {selectedIds.map((id) => {
                  const item = list.find((candidate) => candidate.id === id)
                  return (
                    <span key={id} className="chip-muted">
                      {item?.full_name ?? id.slice(0, 8)}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedIds([])} className="btn-ghost !py-3 !px-5 !text-sm">
                Сбросить
              </button>
              <Link
                href={selectedIds.length === 2 ? `/committee/compare?ids=${selectedIds.join(',')}` : '#'}
                className={`btn-lime !py-3 !px-5 !text-sm ${selectedIds.length !== 2 ? 'pointer-events-none opacity-50' : ''}`}
              >
                Сравнить 2 кандидатов
                <span className="material-symbols-outlined text-base">difference</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-on-surface-variant text-xs font-label">Ошибок обработки: {errors}</div>
    </div>
  )
}
