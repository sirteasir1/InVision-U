'use client'
import { useEffect, useState, type ReactNode } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { CandidateDetail } from '@/types'

function getPw() {
  return typeof window !== 'undefined' ? sessionStorage.getItem('committee_pw') ?? '' : ''
}

function ScoreBar({ label, value, max = 10, reason }: { label: string; value: number; max?: number; reason?: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end gap-4">
        <span className="text-on-surface-variant text-xs font-label font-bold uppercase tracking-widest">{label}</span>
        <span className="text-white font-headline font-black text-xl leading-none">
          {value.toFixed(1)}
          <span className="text-on-surface-variant text-xs font-label font-normal ml-0.5">/{max}</span>
        </span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {reason && <p className="text-on-surface-variant text-sm font-label leading-relaxed">{reason}</p>}
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  return (
    <div className="bg-surface-container-low rounded-xl p-6 md:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
        <h3 className="text-white font-headline font-black text-base tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function statusLabel(status: string) {
  if (status === 'scored') return 'Оценено'
  if (status === 'error') return 'Ошибка'
  return 'В обработке'
}

const FALLBACK_REASONING = {
  motivation: 'Объяснение для мотивации недоступно — нужен ручной просмотр.',
  leadership: 'Объяснение для лидерства недоступно — нужен ручной просмотр.',
  experience: 'Объяснение для опыта недоступно — нужен ручной просмотр.',
  growth: 'Объяснение для роста недоступно — нужен ручной просмотр.',
  overall: 'Подробное объяснение итогового балла недоступно — нужен ручной просмотр.',
}

const FALLBACK_AUTHORSHIP = {
  label: 'недостаточно данных' as const,
  confidence: 0.2,
  explanation: 'Недостаточно данных для аккуратной оценки возможной помощи ИИ.',
  signals: [] as string[],
}

function translateEvidenceKey(key: string) {
  if (key === 'motivation') return 'Мотивация'
  if (key === 'leadership') return 'Лидерство'
  if (key === 'experience') return 'Опыт'
  if (key === 'growth') return 'Рост'
  return key
}

export default function CandidateDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [c, setC] = useState<CandidateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDel] = useState(false)
  const [showEssay, setSE] = useState(false)
  const [showIV, setSIV] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`/api/committee/${id}`, {
          headers: { 'x-committee-password': getPw() },
          cache: 'no-store',
        })
        if (res.status === 401) {
          router.push('/auth?role=committee')
          return
        }
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Не удалось загрузить заявку.')
        setC(data.candidate)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить заявку.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  async function del() {
    if (!confirm('Удалить эту заявку навсегда? Это действие нельзя отменить.')) return
    setDel(true)
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
      router.push('/committee/candidates')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить заявку.')
    } finally {
      setDel(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="space-y-3 text-center">
          <div className="w-32 h-1.5 shimmer rounded-full mx-auto" />
          <p className="text-on-surface-variant font-label text-sm">Загрузка заявки…</p>
        </div>
      </div>
    )
  }

  if (!c) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-on-surface-variant">Заявка не найдена.</p>
          <Link href="/committee/candidates" className="btn-ghost text-sm">← Назад к списку</Link>
        </div>
      </div>
    )
  }

  const s = c.scoring
  const reasoning = { ...FALLBACK_REASONING, ...(s?.score_reasoning ?? {}) }
  const authorshipSignals = Array.isArray(s?.authorship_assessment?.signals) ? s?.authorship_assessment?.signals : []
  const authorship = { ...FALLBACK_AUTHORSHIP, ...(s?.authorship_assessment ?? {}), signals: authorshipSignals }
  const submittedAt = c.created_at ? new Date(c.created_at).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

  return (
    <div className="px-4 md:px-10 pb-16 max-w-5xl mx-auto">
      <div className="py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <Link href="/committee/candidates" className="flex items-center gap-2 text-on-surface-variant hover:text-white text-sm font-label font-bold transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Все заявки
          </Link>
          <h1 className="text-display-md font-headline font-black tracking-tighter leading-tight">{c.full_name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="chip-muted">{c.email}</span>
            <span className="chip-muted">GPA {c.gpa.toFixed(2)}</span>
            <span className="chip-muted">Подано: {submittedAt}</span>
            {c.status === 'scored' && <span className="chip-lime">Оценено</span>}
            {c.status === 'pending' && <span className="chip-muted">В обработке</span>}
            {c.status === 'error' && <span className="chip-error">Ошибка</span>}
          </div>
        </div>
        <button onClick={del} disabled={deleting} className="btn-danger self-start md:self-auto">
          <span className="material-symbols-outlined text-base">delete</span>
          {deleting ? 'Удаление…' : 'Удалить'}
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 bg-error-container/10 rounded-xl p-5 border border-error-container/30">
          <span className="material-symbols-outlined text-error shrink-0 mt-0.5">error</span>
          <p className="text-error-dim text-sm font-label">{error}</p>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-start gap-3 bg-surface-container-low rounded-xl p-5">
          <span className="material-symbols-outlined text-primary-container shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <p className="text-on-surface-variant text-sm font-label">{s?.disclaimer ?? 'AI-ассистированный анализ помогает структурировать сигналы, но финальное решение принимает комиссия.'}</p>
        </div>

        {!s ? (
          <div className="bg-surface-container-low rounded-xl p-16 text-center space-y-4">
            {c.status === 'error' ? (
              <>
                <span className="material-symbols-outlined text-error-dim text-5xl block">error</span>
                <p className="text-on-surface-variant font-label">Автоматический разбор не завершился. Требуется ручная проверка.</p>
              </>
            ) : (
              <>
                <div className="w-24 h-1.5 shimmer rounded-full mx-auto" />
                <p className="text-on-surface-variant font-label text-sm">Оценка ещё выполняется…</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="bg-surface-container-low rounded-xl p-8 md:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest mb-3">Итоговый балл</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[5.5rem] md:text-[7rem] font-headline font-black text-white leading-none tracking-tighter">{s.overall}</span>
                    <span className="text-on-surface-variant text-2xl">/100</span>
                  </div>
                </div>
                <div className="text-right space-y-4">
                  <div>
                    <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest mb-1">Уверенность</p>
                    <p className="text-primary-container font-headline font-black text-4xl">{Math.round(s.confidence * 100)}%</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest mb-1">Базовый скор</p>
                    <p className="text-white font-headline font-bold text-2xl">{s.baseline_score}</p>
                  </div>
                </div>
              </div>
              <div className="score-bar-track h-3">
                <div className="score-bar-fill h-full" style={{ width: `${s.overall}%` }} />
              </div>
              <div className="bg-surface-container rounded-xl p-5">
                <p className="text-primary-container text-xs font-label font-bold uppercase tracking-widest mb-2">Почему получился такой итог</p>
                <p className="text-on-surface-variant text-sm font-label leading-relaxed">{reasoning.overall}</p>
              </div>
            </div>

            <Card title="Подкритерии" icon="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScoreBar label="Мотивация" value={s.motivation_final} reason={reasoning.motivation} />
                <ScoreBar label="Лидерство" value={s.leadership_final} reason={reasoning.leadership} />
                <ScoreBar label="Опыт" value={s.experience_final} reason={reasoning.experience} />
                <ScoreBar label="Рост" value={s.growth_final} reason={reasoning.growth} />
              </div>
            </Card>

            {s.strengths?.length > 0 && (
              <Card title="Сильные стороны" icon="thumb_up">
                <div className="space-y-2">
                  {s.strengths.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-surface-container rounded-xl p-4">
                      <span className="material-symbols-outlined text-primary-container shrink-0 text-base mt-0.5">check_circle</span>
                      <p className="text-on-surface-variant text-sm font-label">{item}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {s.concerns?.length > 0 && (
              <Card title="Риски и вопросы" icon="help">
                <div className="space-y-2">
                  {s.concerns.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-surface-container rounded-xl p-4">
                      <span className="material-symbols-outlined text-on-surface-variant shrink-0 text-base mt-0.5">priority_high</span>
                      <p className="text-on-surface-variant text-sm font-label">{item}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {(s.flags?.length ?? 0) > 0 && (
              <Card title={`Флаги (${s.flags?.length ?? 0})`} icon="flag">
                <div className="space-y-2">
                  {s.flags.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 bg-error-container/10 rounded-xl p-4">
                      <span className="material-symbols-outlined text-error shrink-0 text-base mt-0.5">warning</span>
                      <p className="text-error-dim text-sm font-label">{f}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {(s.contradictions?.length ?? 0) > 0 && (
              <Card title="Расхождения между эссе и интервью" icon="compare_arrows">
                <div className="space-y-2">
                  {s.contradictions.map((con, i) => (
                    <div key={i} className="flex items-start gap-3 bg-surface-container p-4 rounded-xl">
                      <span className="material-symbols-outlined text-on-surface-variant shrink-0 text-base mt-0.5">error_outline</span>
                      <p className="text-on-surface-variant text-sm font-label">{con}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {Object.keys(s.evidence ?? {}).length > 0 && (
              <Card title="Текстовые основания" icon="format_quote">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(s.evidence).map(([key, val]) => (
                    <div key={key} className="bg-surface-container rounded-xl p-5 space-y-2">
                      <p className="text-primary-container text-xs font-label font-bold uppercase tracking-widest">{translateEvidenceKey(key)}</p>
                      <p className="text-on-surface-variant text-sm font-label italic leading-relaxed">“{val}”</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card title="Проверка естественности текста" icon="text_fields">
              <p className="text-on-surface-variant text-sm font-label leading-relaxed">{s.authenticity_review}</p>
            </Card>

            <Card title="Оценка вероятности AI-помощи" icon="psychology">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="chip-muted">{authorship.label}</span>
                  <span className="chip-lime">Уверенность {Math.round(authorship.confidence * 100)}%</span>
                </div>
                <p className="text-on-surface-variant text-sm font-label leading-relaxed">{authorship.explanation}</p>
                {authorship.signals.length > 0 && (
                  <div className="space-y-2">
                    {authorship.signals.map((signal, i) => (
                      <div key={i} className="flex items-start gap-3 bg-surface-container rounded-xl p-4">
                        <span className="material-symbols-outlined text-primary-container shrink-0 text-base mt-0.5">search</span>
                        <p className="text-on-surface-variant text-sm font-label">{signal}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card title="Эссе" icon="article">
              <button onClick={() => setSE((v) => !v)} className="flex items-center gap-2 text-primary-container hover:text-white text-sm font-label font-bold transition-colors">
                <span className="material-symbols-outlined text-base">{showEssay ? 'expand_less' : 'expand_more'}</span>
                {showEssay ? 'Скрыть' : 'Показать эссе'}
              </button>
              {showEssay && <div className="bg-surface-container rounded-xl p-6 text-on-surface-variant text-sm font-label leading-relaxed whitespace-pre-wrap">{c.essay}</div>}
            </Card>

            <Card title="Ответы интервью" icon="forum">
              <button onClick={() => setSIV((v) => !v)} className="flex items-center gap-2 text-primary-container hover:text-white text-sm font-label font-bold transition-colors">
                <span className="material-symbols-outlined text-base">{showIV ? 'expand_less' : 'expand_more'}</span>
                {showIV ? 'Скрыть' : 'Показать ответы'}
              </button>
              {showIV && <div className="bg-surface-container rounded-xl p-6 text-on-surface-variant text-sm font-label leading-relaxed whitespace-pre-wrap">{c.interview_text}</div>}
            </Card>

            <Card title="Мотивация и достижения" icon="person">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-container rounded-xl p-5">
                  <p className="text-primary-container text-xs font-label font-bold uppercase tracking-widest mb-2">Мотивация / ответы анкеты</p>
                  <p className="text-on-surface-variant text-sm font-label leading-relaxed whitespace-pre-wrap">{c.extracurriculars || '—'}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-5">
                  <p className="text-primary-container text-xs font-label font-bold uppercase tracking-widest mb-2">Достижения</p>
                  <p className="text-on-surface-variant text-sm font-label leading-relaxed whitespace-pre-wrap">{c.achievements || '—'}</p>
                </div>
              </div>
            </Card>

            <Card title="Служебная сводка" icon="shield">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-label">
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="text-on-surface-variant mb-1">Статус</p>
                  <p className="text-white">{statusLabel(c.status)}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="text-on-surface-variant mb-1">Версия скоринга</p>
                  <p className="text-white">{s.scoring_version}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="text-on-surface-variant mb-1">Согласие</p>
                  <p className="text-white">{c.consent ? 'Подтверждено' : 'Нет'}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="text-on-surface-variant mb-1">ID заявки</p>
                  <p className="text-white break-all">{c.id}</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
