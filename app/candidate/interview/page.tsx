'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import StepLayout from '@/components/StepLayout'
import VoiceRecorder from '@/components/VoiceRecorder'
import { useForm } from '@/context/form-context'

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

  function setA(id: string, v: string) {
    setAnswers((a) => ({ ...a, [id]: v }))
  }

  function appendTranscript(id: string, text: string) {
    setAnswers((a) => ({ ...a, [id]: a[id] ? `${a[id]} ${text}` : text }))
  }

  const allAnswered = QUESTIONS.every((q) => answers[q.id].trim().length > 15)

  const formattedDate = useMemo(() => {
    return submittedAt ? new Date(submittedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  }, [submittedAt])

  async function handleSubmit() {
    if (!form.consent) {
      setError('Подтвердите согласие.')
      return
    }
    if (!allAnswered) {
      setError('Ответьте на все 5 вопросов.')
      return
    }

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

        <header className="iv-nav">
          <div className="max-w-[1440px] mx-auto h-16 px-7 md:px-8 flex items-center justify-between">
            <button onClick={() => router.push('/')} className="font-headline font-black text-[1.75rem] tracking-[-0.05em] leading-none">inVisionU</button>
            <div className="flex items-center gap-5 text-white/70">
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </div>
          </div>
        </header>

        <main className="flex-1 relative z-10 px-6 pt-28 pb-12">
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
                <div className="absolute right-6 top-6 text-[#819500]">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
                <p className="text-white/38 text-[11px] tracking-[0.16em] uppercase mb-4 font-label font-bold">Дата подачи</p>
                <p className="font-headline font-black text-[2rem] md:text-[2.2rem] tracking-[-0.05em] text-[#f6f6f1] leading-[1]">{formattedDate || '—'}</p>
                <div className="mt-6 h-px bg-white/[0.05]" />
                <p className="mt-6 text-white/38 text-[11px] tracking-[0.16em] uppercase mb-2 font-label font-bold">Статус</p>
                <div className="inline-flex items-center gap-2 text-[#c5fe00] text-[0.92rem] font-bold uppercase tracking-[0.08em]">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#c5fe00]" />
                  Отправлено
                </div>
                <div className="absolute right-6 bottom-6 text-[#c5fe00]">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
            </div>

            <div className="mt-7 max-w-[560px] mx-auto rounded-[24px] panel-soft px-6 py-5 text-left flex items-start gap-4">
              <span className="material-symbols-outlined text-white/70 mt-0.5">info</span>
              <p className="text-white/62 leading-8 text-[0.95rem]">
                AI-оценка используется только как вспомогательный инструмент для первичного review.
                Финальное решение принимается приёмной комиссией индивидуально.
              </p>
            </div>

            <button onClick={() => router.push('/')} className="btn-lime !mt-12 !px-12 !py-5 !text-[1rem] inline-flex">
              Вернуться на главную <span className="material-symbols-outlined text-[20px]">arrow_right_alt</span>
            </button>
          </div>
        </main>

        <footer className="relative z-10 px-7 md:px-8 py-6 text-white/45">
          <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 text-[12px] tracking-[0.12em] uppercase font-label">
            <p>© 2024 inVision U. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-6 md:gap-8">
              <a href="#" className="hover:text-white transition-colors">Help Center</a>
              <button onClick={() => router.push('/candidate/personal')} className="hover:text-white transition-colors uppercase">Exit Application</button>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <StepLayout step={4} backHref="/candidate/essay" onContinue={handleSubmit} continueLabel="Отправить заявку" continueDisabled={!allAnswered || !form.consent} isSubmitting={submitState === 'submitting'}>
      <div className="anim-fade-up" style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.8rem', fontFamily: 'Manrope', fontWeight: 700, color: '#c5fe00', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>Этап 4.</p>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 'clamp(2.2rem,5vw,3.2rem)', lineHeight: 0.95, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
          <span style={{ color: '#c5fe00', fontStyle: 'italic' }}>Интервью</span>
        </h1>
        <p style={{ color: '#888', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '520px' }}>
          Ответьте на 5 вопросов. Можно печатать вручную или продиктовать ответ — браузер распознает речь автоматически.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        {QUESTIONS.map((q, i) => {
          const answered = answers[q.id].trim().length > 15
          return (
            <div key={q.id} className="anim-fade-up panel-soft" style={{ animationDelay: `${i * 0.07}s`, borderRadius: '1.5rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1rem' }}>
                <div style={{ width: '2.25rem', height: '2.25rem', background: '#171717', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ color: '#c5fe00', fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}>{q.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'Manrope', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{q.theme}</span>
                    {answered && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', background: '#c5fe00', color: '#2a3500', borderRadius: '9999px', padding: '0.15rem 0.5rem', fontFamily: 'Manrope', fontWeight: 700 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '0.7rem', fontVariationSettings: "'wght' 700" }}>check</span>
                        Готово
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.55, color: '#e0e0e0' }}>{i + 1}. {q.q}</p>
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <VoiceRecorder onTranscript={(text) => appendTranscript(q.id, text)} lang="ru-RU" />
              </div>

              <textarea className="iv-input-dark" rows={3} placeholder="Напишите ваш ответ или используйте запись голоса выше…" value={answers[q.id]} onChange={(e) => setA(q.id, e.target.value)} style={{ width: '100%', resize: 'vertical', fontSize: '0.875rem' }} />
            </div>
          )
        })}
      </div>

      <div className="anim-fade-up panel-soft" style={{ borderRadius: '1.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: '#fff' }}>Согласие и отправка</h3>
        <div style={{ background: '#141414', borderRadius: '0.95rem', padding: '1rem', marginBottom: '1rem' }}>
          <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.65, fontFamily: 'Manrope', whiteSpace: 'pre-line' }}>{CONSENT_TEXT}</p>
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
          <div onClick={() => set('consent', !form.consent)} style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.25rem', flexShrink: 0, marginTop: '0.1rem', cursor: 'pointer', border: `2px solid ${form.consent ? '#c5fe00' : '#333'}`, background: form.consent ? '#c5fe00' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s ease' }}>
            {form.consent && <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', color: '#2a3500', fontVariationSettings: "'wght' 700" }}>check</span>}
          </div>
          <span style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.55, fontFamily: 'Manrope' }}>Я прочитал(а) и согласен(на) с вышеизложенным *</span>
        </label>
      </div>

      {(submitState === 'error' || errorMsg) && (
        <div style={{ background: 'rgba(217,61,24,0.1)', border: '1px solid rgba(217,61,24,0.2)', borderRadius: '0.875rem', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
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
