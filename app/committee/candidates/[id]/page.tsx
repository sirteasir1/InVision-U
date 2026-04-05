'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import CommitteeEvidence from '@/components/CommitteeEvidence'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { CandidateDetail } from '@/types'
import { getDisplayEvidence } from '@/lib/evidence-display'
import { normalizeAuthorship, normalizeScoreReasoning, normalizeScoring } from '@/lib/scoring-normalize'

function getPw() {
  return typeof window !== 'undefined' ? sessionStorage.getItem('committee_pw') ?? '' : ''
}

function statusLabel(status: string) {
  if (status === 'scored') return 'Оценено'
  if (status === 'error') return 'Ошибка'
  return 'В обработке'
}

function statusChip(status: string) {
  if (status === 'scored') return 'chip-lime'
  if (status === 'error') return 'chip-error'
  return 'chip-muted'
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

const FALLBACK_TEXT_REVIEWS = {
  essay_review: 'Подробный разбор эссе пока недоступен — нужен ручной просмотр.',
  interview_review: 'Подробный разбор интервью пока недоступен — нужен ручной просмотр.',
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="panel-soft rounded-[30px] p-6 md:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
        <h2 className="text-[1.45rem] md:text-[1.65rem] leading-none font-headline font-black tracking-[-0.04em] text-white">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function ScoreSection({ label, value, reason }: { label: string; value: number; reason: string }) {
  const pct = Math.max(6, Math.min(100, Math.round((value / 10) * 100)))

  return (
    <Section title={label} icon="analytics">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-label font-bold text-on-surface-variant">Оценка по критерию</p>
            <p className="mt-2 text-[4rem] md:text-[4.5rem] leading-none font-headline font-black text-white">{value.toFixed(1)}</p>
          </div>
          <span className="chip-lime">{pct}% шкалы</span>
        </div>

        <div className="score-bar-track h-3">
          <div className="score-bar-fill h-full" style={{ width: `${pct}%` }} />
        </div>

        <p className="text-[0.98rem] leading-8 text-on-surface-variant">{reason}</p>
      </div>
    </Section>
  )
}

export default function CandidateDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showEssay, setShowEssay] = useState(false)
  const [showInterview, setShowInterview] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

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
        if (!cancelled) setCandidate(data.candidate ? { ...data.candidate, scoring: normalizeScoring(data.candidate.scoring) } : null)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Не удалось загрузить заявку.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, router])

  async function del() {
    if (!confirm('Удалить эту заявку навсегда? Это действие нельзя отменить.')) return
    setDeleting(true)
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
      setDeleting(false)
    }
  }

  const scoring = useMemo(() => normalizeScoring(candidate?.scoring), [candidate?.scoring])
  const reasoning = useMemo(() => ({ ...FALLBACK_REASONING, ...normalizeScoreReasoning(scoring?.score_reasoning) }), [scoring])
  const authorship = useMemo(() => ({ ...FALLBACK_AUTHORSHIP, ...normalizeAuthorship(scoring?.authorship_assessment) }), [scoring])
  const essayReview = scoring?.essay_review || FALLBACK_TEXT_REVIEWS.essay_review
  const interviewReview = scoring?.interview_review || FALLBACK_TEXT_REVIEWS.interview_review
  const displayEvidence = useMemo(() => (candidate ? getDisplayEvidence(candidate) : []), [candidate])

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

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-on-surface-variant">Заявка не найдена.</p>
          <Link href="/committee/candidates" className="btn-ghost text-sm">← Назад к списку</Link>
        </div>
      </div>
    )
  }

  const submittedAt = candidate.created_at
    ? new Date(candidate.created_at).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })
    : '—'

  return (
    <div className="px-4 md:px-10 pb-20 max-w-5xl mx-auto">
      <div className="py-10 space-y-6">
        <div className="space-y-4">
          <Link href="/committee/candidates" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-white text-sm font-label font-bold transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Все заявки
          </Link>

          <div className="panel-soft rounded-[32px] p-6 md:p-8 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={statusChip(candidate.status)}>{statusLabel(candidate.status)}</span>
                  <span className="chip-muted">GPA {candidate.gpa.toFixed(2)}</span>
                  <span className="chip-muted">Подано {submittedAt}</span>
                </div>
                <h1 className="text-display-md font-headline font-black tracking-tighter leading-[0.94]">{candidate.full_name}</h1>
                <p className="text-sm md:text-base max-w-3xl leading-8 text-on-surface-variant">
                  Страница построена как decision support: сначала итог, затем каждый критерий отдельно, дальше — основания, риски и разбор текста.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button onClick={del} disabled={deleting} className="btn-danger !py-3 !px-5 !text-sm disabled:opacity-50">
                  <span className="material-symbols-outlined text-base">delete</span>
                  {deleting ? 'Удаление…' : 'Удалить'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-[26px] bg-surface-container-high/70 p-5 md:p-6 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.18em] font-label font-bold text-on-surface-variant">Статус</p>
                <p className="text-[1.05rem] leading-8 text-white/92">{statusLabel(candidate.status)}</p>
              </div>

              <div className="rounded-[26px] bg-surface-container-high/70 p-5 md:p-6 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.18em] font-label font-bold text-on-surface-variant">Согласие</p>
                <p className="text-[1.05rem] leading-8 text-white/92">{candidate.consent ? 'Подтверждено' : 'Нет подтверждения'}</p>
              </div>

              <div className="rounded-[26px] bg-surface-container-high/70 p-5 md:p-6 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.18em] font-label font-bold text-on-surface-variant">ID заявки</p>
                <p className="text-[0.98rem] leading-8 break-all text-white/92">{candidate.id}</p>
              </div>

              <div className="rounded-[26px] bg-surface-container-high/70 p-5 md:p-6 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.18em] font-label font-bold text-on-surface-variant">Контакт</p>
                <p className="text-[0.98rem] leading-8 break-all text-white/88">{candidate.email}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-error-container/10 rounded-xl p-5 border border-error-container/30">
            <span className="material-symbols-outlined text-error shrink-0 mt-0.5">error</span>
            <p className="text-error-dim text-sm font-label">{error}</p>
          </div>
        )}

        {!scoring ? (
          <Section title="Скоринг ещё не готов" icon="hourglass_top">
            <p className="text-on-surface-variant leading-8 max-w-3xl">
              Заявка уже сохранена, но автоматический анализ ещё в обработке. Обновите страницу позже — здесь появятся пояснения по критериям и основания оценки.
            </p>
          </Section>
        ) : (
          <>
            <ScrollReveal>
              <Section title="Итоговая оценка" icon="insights">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-end justify-between gap-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] font-label font-bold text-on-surface-variant">Итоговый балл</p>
                      <p className="mt-3 text-[5rem] md:text-[6rem] leading-none font-headline font-black text-primary-container">{scoring.overall}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="chip-muted">Уверенность {Math.round(scoring.confidence * 100)}%</span>
                      <span className="chip-muted">Версия {scoring.scoring_version}</span>
                    </div>
                  </div>
                  <p className="text-[0.98rem] leading-8 text-on-surface-variant">{reasoning.overall}</p>
                  <div className="rounded-[24px] bg-black/20 p-5">
                    <p className="text-sm leading-8 text-on-surface-variant">{scoring.disclaimer}</p>
                  </div>
                </div>
              </Section>
            </ScrollReveal>

            <ScrollReveal delay={50}>
              <ScoreSection label="Мотивация" value={scoring.motivation_final} reason={reasoning.motivation} />
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <ScoreSection label="Лидерство" value={scoring.leadership_final} reason={reasoning.leadership} />
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <ScoreSection label="Опыт" value={scoring.experience_final} reason={reasoning.experience} />
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <ScoreSection label="Рост" value={scoring.growth_final} reason={reasoning.growth} />
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <Section title="Основания оценки" icon="format_quote">
                <CommitteeEvidence evidence={displayEvidence} />
              </Section>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Section title={`Флаги${scoring.flags.length ? ` (${scoring.flags.length})` : ''}`} icon="flag">
                <div className="space-y-3">
                  {scoring.flags.length ? (
                    scoring.flags.map((flag, index) => (
                      <div key={index} className="rounded-[24px] border border-[#662515] bg-[rgba(110,33,12,0.28)] px-5 py-4">
                        <p className="text-[0.98rem] leading-8 text-[#ff8e6e]">{flag}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-on-surface-variant leading-8">Критических флагов не выявлено.</p>
                  )}
                </div>
              </Section>
            </ScrollReveal>

            <ScrollReveal delay={350}>
              <Section title="Сильные стороны" icon="check_circle">
                <div className="space-y-3">
                  {scoring.strengths.length ? (
                    scoring.strengths.map((item, index) => (
                      <div key={index} className="rounded-[24px] bg-surface-container-high/70 px-5 py-4">
                        <p className="text-[0.98rem] leading-8 text-on-surface-variant">{item}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-on-surface-variant leading-8">Явные сильные стороны пока не выделены.</p>
                  )}
                </div>
              </Section>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <Section title="Зоны внимания" icon="priority_high">
                <div className="space-y-3">
                  {scoring.concerns.length ? (
                    scoring.concerns.map((item, index) => (
                      <div key={index} className="rounded-[24px] bg-surface-container-high/70 px-5 py-4">
                        <p className="text-[0.98rem] leading-8 text-on-surface-variant">{item}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-on-surface-variant leading-8">Серьёзные риски пока не выделены.</p>
                  )}
                </div>
              </Section>
            </ScrollReveal>

            <ScrollReveal delay={450}>
              <Section title="Анализ естественности текста" icon="psychology_alt">
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="chip-muted">Оценка {authorship.label}</span>
                    <span className="chip-muted">Уверенность {Math.round(authorship.confidence * 100)}%</span>
                  </div>
                  <p className="text-[0.98rem] leading-8 text-on-surface-variant">{authorship.explanation}</p>
                  {authorship.signals.length > 0 && (
                    <div className="space-y-3">
                      {authorship.signals.map((signal, index) => (
                        <div key={index} className="rounded-[24px] bg-surface-container-high/70 px-5 py-4">
                          <p className="text-sm leading-8 text-on-surface-variant">{signal}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Section>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <Section title="Разбор эссе" icon="article">
                <p className="text-[0.98rem] leading-8 text-on-surface-variant">{essayReview}</p>
              </Section>
            </ScrollReveal>

            <ScrollReveal delay={550}>
              <Section title="Разбор интервью" icon="forum">
                <p className="text-[0.98rem] leading-8 text-on-surface-variant">{interviewReview}</p>
              </Section>
            </ScrollReveal>

            <ScrollReveal delay={600}>
              <Section title="Исходные материалы" icon="description">
                <div className="space-y-4">
                  <div className="rounded-[24px] bg-surface-container-high/70 p-5 md:p-6 space-y-4">
                    <button onClick={() => setShowEssay((value) => !value)} className="w-full flex items-center justify-between gap-4 text-left">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] font-label font-bold text-on-surface-variant">Эссе кандидата</p>
                        <p className="mt-2 text-lg font-headline font-black text-white">Показать полный текст</p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">{showEssay ? 'expand_less' : 'expand_more'}</span>
                    </button>
                    {showEssay && <p className="whitespace-pre-wrap text-sm leading-8 text-on-surface-variant">{candidate.essay}</p>}
                  </div>

                  <div className="rounded-[24px] bg-surface-container-high/70 p-5 md:p-6 space-y-4">
                    <button onClick={() => setShowInterview((value) => !value)} className="w-full flex items-center justify-between gap-4 text-left">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] font-label font-bold text-on-surface-variant">Интервью</p>
                        <p className="mt-2 text-lg font-headline font-black text-white">Показать полный текст</p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">{showInterview ? 'expand_less' : 'expand_more'}</span>
                    </button>
                    {showInterview && <p className="whitespace-pre-wrap text-sm leading-8 text-on-surface-variant">{candidate.interview_text}</p>}
                  </div>
                </div>
              </Section>
            </ScrollReveal>
          </>
        )}
      </div>
    </div>
  )
}
