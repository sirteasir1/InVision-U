'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StepLayout from '@/components/StepLayout'
import { useForm } from '@/context/form-context'

const QUESTIONS = [
  {
    id: 'q_why',
    label: 'Почему вы хотите учиться в inVision U?',
    hint: 'Опишите ваши основные ожидания от программы и то, как она поможет вам в реализации ваших амбиций.',
    placeholder: 'Ваш ответ…',
    min: 100,
    max: 500,
  },
  {
    id: 'q_problem',
    label: 'Какую проблему, идею или направление вам хотелось бы развивать в будущем?',
    hint: '',
    placeholder: 'Опишите ваш проект или область интересов…',
    min: 80,
    max: 400,
  },
  {
    id: 'q_goals',
    label: 'Какие цели вы ставите себе на ближайшие 3–5 лет?',
    hint: '',
    placeholder: 'Ваше видение будущего…',
    min: 80,
    max: 400,
  },
  {
    id: 'q_why_now',
    label: 'Почему для вас важно начать этот путь именно сейчас?',
    hint: '',
    placeholder: 'Расскажите о текущем моменте в вашей жизни…',
    min: 80,
    max: 400,
  },
  {
    id: 'q_growth',
    label: 'Что вы уже делаете для своего роста и развития?',
    hint: '',
    placeholder: 'Курсы, книги, проекты, практика…',
    min: 60,
    max: 300,
  },
]

export default function BackgroundStep() {
  const router = useRouter()
  const { form, set } = useForm()
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, '']))
  )

  function setA(id: string, v: string) {
    setAnswers((a) => ({ ...a, [id]: v }))
  }

  const allDone = QUESTIONS.every((q) => answers[q.id].trim().length >= q.min)

  function handleContinue() {
    const sections = QUESTIONS.map((q) => `${q.label}\n${answers[q.id]}`)
    const combined = [
      form.extracurriculars?.trim() ? `Внеучебная деятельность и роли\n${form.extracurriculars}` : '',
      ...sections,
    ]
      .filter(Boolean)
      .join('\n\n')

    set('extracurriculars', combined)
    router.push('/candidate/essay')
  }

  return (
    <StepLayout step={2} backHref="/candidate/personal" onContinue={handleContinue} continueDisabled={!allDone} continueLabel="Продолжить">
      <div className="anim-fade-up" style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.8rem', fontFamily: 'Manrope', fontWeight: 700, color: '#c5fe00', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
          Этап 2.
        </p>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 'clamp(2.2rem,5vw,3.2rem)', lineHeight: 0.95, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
          <span style={{ color: '#c5fe00', fontStyle: 'italic' }}>Мотивация</span> и цели
        </h1>
        <p style={{ color: '#888', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '520px' }}>
          Расскажите нам, почему вам важна эта программа, к чему вы стремитесь и как хотите расти дальше.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {QUESTIONS.map((q, i) => {
          const val = answers[q.id]
          const len = val.length
          const ok = len >= q.min
          const over = len > q.max
          return (
            <div key={q.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
              <p style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '0.9375rem', marginBottom: q.hint ? '0.3rem' : '0.75rem', color: '#fff' }}>
                {q.label}
              </p>
              {q.hint && (
                <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '0.75rem', fontFamily: 'Manrope' }}>{q.hint}</p>
              )}
              <div style={{ position: 'relative' }}>
                <textarea
                  className="iv-input-dark"
                  rows={4}
                  placeholder={q.placeholder}
                  value={val}
                  onChange={(e) => setA(q.id, e.target.value)}
                  style={{ width: '100%', resize: 'vertical', minHeight: '110px', paddingBottom: '1.75rem' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '0.6rem',
                    right: '0.75rem',
                    fontSize: '0.7rem',
                    fontFamily: 'Manrope',
                    fontWeight: 600,
                    color: over ? '#ff5252' : ok ? '#c5fe00' : '#555',
                    transition: 'color .2s',
                  }}
                >
                  {len} / {q.max} символов
                </span>
              </div>
              {!ok && len > 0 && (
                <p style={{ fontSize: '0.7rem', color: '#555', marginTop: '0.3rem', fontFamily: 'Manrope' }}>Минимум {q.min} символов</p>
              )}
            </div>
          )
        })}
      </div>
    </StepLayout>
  )
}
