'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import StepLayout from '@/components/StepLayout'
import VoiceRecorder from '@/components/VoiceRecorder'
import { useForm } from '@/context/form-context'
import { DuplicateCandidateInfo } from '@/types'

const QUESTIONS = [
  { id: 'q1', theme: 'Мотивация', icon: 'bolt', q: 'Почему вы хотите присоединиться именно к inVision U, и что это дает, чего нет в других программах?' },
  { id: 'q2', theme: 'Лидерство', icon: 'workspace_premium', q: 'Расскажите о ситуации, когда вы взяли инициативу или повели команду через трудности. Каков результат?' },
  { id: 'q3', theme: 'Рост', icon: 'trending_up', q: 'Опишите значимый вызов в вашей жизни. Как вы с ним справились и что узнали о себе?' },
  { id: 'q4', theme: 'Вклад', icon: 'public', q: 'Какой конкретный вклад вы планируете сделать в inVision U и сообщество во время и после программы?' },
  { id: 'q5', theme: 'Самосознание', icon: 'psychology', q: 'Какова ваша наибольшая слабость, и что конкретно вы делаете, чтобы её преодолеть?' },
]

const CONSENT_TEXT = `Отправляя эту заявку, я подтверждаю, что:
• Все данные достоверны и написаны мной лично
• Я даю согласие на обработку данных для целей приёма
• Я понимаю, что заявка проходит AI-анализ, а финальное решение принимает комиссия`

export default function InterviewStep() {
  const router = useRouter()
  const { form, set, reset } = useForm()

  const [answers, setAnswers] = useState<Record<string, string>>(Object.fromEntries(QUESTIONS.map((q) => [q.id, ''])))
  const [submitState, setSubmit] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setError] = useState('')
  const [candidateId, setCid] = useState('')
  const [submittedName, setSubmittedName] = useState('')
  const [submittedAt, setSubmittedAt] = useState('')
  const [duplicate, setDuplicate] = useState<DuplicateCandidateInfo | null>(null)

  function setA(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }))
  }

  function appendTranscript(id: string, text: string) {
    setAnswers((current) => ({ ...current, [id]: current[id] ? `${current[id]} ${text}` : text }))
  }

  const allAnswered = QUESTIONS.every((q) => answers[q.id].trim().length > 15)

  const formattedDate = useMemo(() => {
    return submittedAt ? new Date(submittedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  }, [submittedAt])

  const duplicateDate = useMemo(() => {
    return duplicate?.created_at
      ? new Date(duplicate.created_at).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })
      : ''
  }, [duplicate])

  async function handleSubmit() {
    if (!form.consent) {
      setError('Подтвердите согласие.')
      return
    }
    if (!allAnswered) {
      setError('Ответьте на все 5 вопросов.')
      return
    }

    setDuplicate(null)
    setError('')
    setSubmit('submitting')

    const interview_text = QUESTIONS.map((q) => `[${q.theme}]\nВопрос: ${q.q}\nОтвет: ${answers[q.id]}`).join('\n\n')

    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          gpa: parseFloat(form.gpa),
          extracurriculars: form.extracurriculars,
          achievements: form.achievements,
          essay: form.essay,
          interview_text,
          consent: true,
        }),
      })
      const data = await res.json()

      if (res.status === 409) {
        setDuplicate(data.duplicate ?? null)
        throw new Error(data.error || 'Заявка с этим email уже существует.')
      }

      if (!res.ok) throw new Error(data.error || 'Ошибка отправки заявки.')
      setCid(data.candidate_id)
      setSubmittedName(form.full_name)
      setSubmittedAt(new Date().toISOString())
      setSubmit('success')
      reset()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так.')
      setSubmit('error')
    }
  }

  if (submitState === 'success') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[420px] ambient-green opacity-55" />
          <div className="absolute left-1/2 top-16 -translate-x-1/2 h-[240px] w-[240px] rounded-full bg-[#c5fe00]/10 blur-[110px] glow-shift" />
        </div>

        <main className="flex-1 relative z-10 px-6 pt-24 pb-12">
          <div className="max-w-[760px] mx-auto text-center">
            <div className="mx-auto h-[110px] w-[110px] rounded-full bg-[#c5fe00]/10 flex items-center justify-center mb-10">
              <div className="h-[62px] w-[62px] rounded-full bg-[#c5fe00] flex items-center justify-center shadow-[0_0_40px_rgba(197,254,0,0.22)]">
                <span className="material-symbols-outlined text-[#1e2600] text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
            </div>

            <h1 className="font-headline font-black tracking-[-0.06em] text-[3.1rem] md:text-[5.3rem] leading-[0.9] text-[#f6f6f1] uppercase">
              Заявка <span className="text-[#c5fe00]">успешно</span><br />отправлена
            </h1>

            <p className="max-w-[690px] mx-auto mt-6 text-white/62 text-[1rem] md:text-[1.08rem] leading-[1.55]">
              Спасибо! Мы получили вашу заявку и передали её на рассмотрение в учебный отдел.
            </p>

            <div className="mt-12 grid md:grid-cols-2 gap-4 max-w-[610px] mx-auto text-left">
              <div className="panel-soft rounded-[24px] px-7 py-6 min-h-[206px]">
                <p className="text-white/38 text-[11px] tracking-[0.16em] uppercase mb-4 font-label font-bold">Абитуриент</p>
                <p className="font-headline font-black text-[2rem] md:text-[2.2rem] tracking-[-0.05em] text-[#f6f6f1] leading-[1]">{submittedName || '—'}</p>
                <div className="mt-6 h-px bg-white/[0.05]" />
                <p className="mt-6 text-white/38 text-[11px] tracking-[0.16em] uppercase mb-2 font-label font-bold">ID заявки</p>
                <p className="font-headline font-black text-[1.25rem] tracking-[0.01em] break-all text-[#f6f6f1]">{candidateId || '—'}</p>
              </div>

              <div className="panel-soft rounded-[24px] px-7 py-6 min-h-[206px] relative overflow-hidden">
                <p className="text-white/38 text-[11px] tracking-[0.16em] uppercase mb-4 font-label font-bold">Дата подачи</p>
                <p className="font-headline font-black text-[2rem] md:text-[2.2rem] tracking-[-0.05em] text-[#f6f6f1] leading-[1]">{formattedDate || '—'}</p>
                <div className="mt-6 h-px bg-white/[0.05]" />
                <p className="mt-6 text-white/38 text-[11px] tracking-[0.16em] uppercase mb-2 font-label font-bold">Статус</p>
                <div className="inline-flex items-center gap-2 text-[#c5fe00] text-[0.92rem] font-bold uppercase tracking-[0.08em]">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#c5fe00]" />
                  Отправлено
                </div>
              </div>
            </div>

            <div className="mt-7 max-w-[560px] mx-auto rounded-[24px] panel-soft px-6 py-5 text-left flex items-start gap-4">
              <span className="material-symbols-outlined text-white/70 mt-0.5">info</span>
              <p className="text-white/62 leading-8 text-[0.95rem]">
                AI-оценка используется только как вспомогательный инструмент для первичного разбора. Финальное решение принимает приёмная комиссия.
              </p>
            </div>

            <button onClick={() => router.push('/')} className="btn-lime !mt-12 !px-12 !py-5 !text-[1rem] inline-flex">
              Вернуться на главную <span className="material-symbols-outlined text-[20px]">arrow_right_alt</span>
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <StepLayout step={4} backHref="/candidate/essay" onContinue={handleSubmit} continueLabel="Отправить заявку" continueDisabled={!allAnswered || !form.consent} isSubmitting={submitState === 'submitting'}>
      <div className="anim-fade-up" style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.8rem', fontFamily: 'Manrope', fontWeight: 700, color: '#c5fe00', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
          Этап 4.
        </p>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 'clamp(2.2rem,5vw,3.2rem)', lineHeight: 0.95, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
          Короткое <span style={{ color: '#c5fe00', fontStyle: 'italic' }}>интервью</span>
        </h1>
        <p style={{ color: '#888', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '620px' }}>
          Ответьте на 5 вопросов. После отправки система проверит заявку и не создаст дубль, если по этому email уже есть существующая запись.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
        {QUESTIONS.map((item, index) => {
          const value = answers[item.id]
          const ok = value.trim().length > 15
          return (
            <div key={item.id} className="anim-fade-up" style={{ animationDelay: `${index * 0.06}s` }}>
              <div style={{ background: '#111', borderRadius: '1rem', padding: '1.1rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <span className="material-symbols-outlined" style={{ color: '#c5fe00', fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  <span className="chip-muted">{item.theme}</span>
                </div>
                <p style={{ color: '#fff', fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1rem', lineHeight: 1.3, marginBottom: '0.9rem' }}>{item.q}</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.9rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                  <VoiceRecorder onTranscript={(text) => appendTranscript(item.id, text)} />
                  <span style={{ color: ok ? '#c5fe00' : '#666', fontSize: '0.78rem', fontFamily: 'Manrope', fontWeight: 700, paddingTop: '0.45rem' }}>
                    {value.trim().length} символов {ok ? '✓' : '· минимум 16'}
                  </span>
                </div>
                <textarea
                  className="iv-input-dark"
                  rows={4}
                  placeholder="Ваш ответ…"
                  value={value}
                  onChange={(e) => setA(item.id, e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="anim-fade-up delay-300" style={{ marginTop: '2rem', background: '#111', borderRadius: '1rem', padding: '1.25rem', borderLeft: '3px solid #c5fe00' }}>
        <p style={{ color: '#c5fe00', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Manrope', fontWeight: 700, marginBottom: '0.75rem' }}>
          Согласие
        </p>
        <p style={{ color: '#888', whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '0.9rem' }}>{CONSENT_TEXT}</p>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '1rem', cursor: 'pointer' }}>
          <div onClick={() => set('consent', !form.consent)} style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.25rem', flexShrink: 0, marginTop: '0.1rem', cursor: 'pointer', border: `2px solid ${form.consent ? '#c5fe00' : '#333'}`, background: form.consent ? '#c5fe00' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s ease' }}>
            {form.consent && <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', color: '#2a3500', fontVariationSettings: "'wght' 700" }}>check</span>}
          </div>
          <span style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.55, fontFamily: 'Manrope' }}>Я прочитал(а) и согласен(на) с вышеизложенным *</span>
        </label>
      </div>

      {duplicate && (
        <div style={{ background: 'rgba(197,254,0,0.08)', border: '1px solid rgba(197,254,0,0.2)', borderRadius: '1rem', padding: '1rem 1.1rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginTop: '1rem' }}>
          <span className="material-symbols-outlined" style={{ color: '#c5fe00', flexShrink: 0, fontSize: '1.1rem' }}>content_copy_off</span>
          <div>
            <p style={{ color: '#eaff9d', fontSize: '0.93rem', fontFamily: 'Manrope', fontWeight: 700 }}>Похоже, заявка уже существует</p>
            <p style={{ color: '#b7b7b7', fontSize: '0.83rem', lineHeight: 1.55, marginTop: '0.25rem' }}>
              Email: {duplicate.email} · подана {duplicateDate || 'ранее'} · статус: {duplicate.status}
              {typeof duplicate.overall === 'number' ? ` · score: ${duplicate.overall}` : ''}
            </p>
            <p style={{ color: '#7f7f7f', fontSize: '0.78rem', lineHeight: 1.55, marginTop: '0.35rem' }}>
              Чтобы не плодить дубли на демо и в реальной работе, новая запись не создаётся.
            </p>
          </div>
        </div>
      )}

      {(submitState === 'error' || errorMsg) && (
        <div style={{ background: 'rgba(217,61,24,0.1)', border: '1px solid rgba(217,61,24,0.2)', borderRadius: '0.875rem', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '1rem' }}>
          <span className="material-symbols-outlined" style={{ color: '#ff5252', flexShrink: 0, fontSize: '1.1rem' }}>error</span>
          <div>
            <p style={{ color: '#ff7351', fontSize: '0.875rem', fontFamily: 'Manrope', fontWeight: 600 }}>{errorMsg}</p>
            {errorMsg.includes('базы данных') && (
              <p style={{ color: '#ff5252', fontSize: '0.75rem', fontFamily: 'Manrope', marginTop: '0.25rem' }}>Проверьте .env.local и выполните supabase-schema.sql.</p>
            )}
          </div>
        </div>
      )}
    </StepLayout>
  )
}
