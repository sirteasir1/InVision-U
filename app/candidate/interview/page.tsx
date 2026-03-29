'use client'
import { useState } from 'react'
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
  const [submittedEmail, setSubmittedEmail] = useState('')

  function setA(id: string, v: string) {
    setAnswers((a) => ({ ...a, [id]: v }))
  }

  function appendTranscript(id: string, text: string) {
    setAnswers((a) => ({ ...a, [id]: a[id] ? `${a[id]} ${text}` : text }))
  }

  const allAnswered = QUESTIONS.every((q) => answers[q.id].trim().length > 15)

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
      setSubmittedEmail(form.email)
      setSubmit('success')
      reset()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так.')
      setSubmit('error')
    }
  }

  if (submitState === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 20% 20%, rgba(197,254,0,0.10), transparent 25%), radial-gradient(circle at 85% 25%, rgba(197,254,0,0.06), transparent 20%), #0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="anim-fade-up" style={{ maxWidth: '520px', width: '100%', background: '#111', borderRadius: '1.5rem', padding: '3rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: '4rem', height: '4rem', background: '#c5fe00', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#2a3500', fontSize: '2rem', fontVariationSettings: "'FILL' 1" }}>check</span>
          </div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>Заявка отправлена</h2>
          <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Ваша анкета принята. Мы свяжемся с вами по адресу <strong style={{ color: '#fff' }}>{submittedEmail || 'вашей почте'}</strong> после рассмотрения.
          </p>
          <div style={{ background: '#0a0a0a', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.65rem', color: '#555', fontFamily: 'Manrope', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>ID заявки</p>
            <p style={{ color: '#c5fe00', fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.85rem', wordBreak: 'break-all' }}>{candidateId}</p>
          </div>
          <button onClick={() => router.push('/')} className="btn-ghost" style={{ width: '100%' }}>
            На главную
          </button>
        </div>
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
            <div key={q.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.07}s`, background: '#0f0f0f', borderRadius: '1.25rem', padding: '1.5rem', border: `1px solid ${answered ? 'rgba(197,254,0,0.2)' : 'transparent'}`, transition: 'border-color .3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1rem' }}>
                <div style={{ width: '2.25rem', height: '2.25rem', background: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

      <div className="anim-fade-up" style={{ background: '#0f0f0f', borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: '#fff' }}>Согласие и отправка</h3>
        <div style={{ background: '#141414', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
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
