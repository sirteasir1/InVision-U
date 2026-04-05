'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StepLayout from '@/components/StepLayout'
import { useForm } from '@/context/form-context'

const ACTIVITY_SUGGESTIONS = ['Волонтёрство', 'Дебаты', 'Спорт', 'Студенческий клуб', 'Олимпиады', 'Стажировка']

type Achievement = { text: string; level: string }

function getIcon(text: string) {
  const value = text.toLowerCase()
  if (value.includes('олимпи')) return 'military_tech'
  if (value.includes('проект')) return 'rocket_launch'
  if (value.includes('волонт')) return 'volunteer_activism'
  if (value.includes('спорт')) return 'sports_soccer'
  return 'emoji_events'
}

export default function PersonalStep() {
  const router = useRouter()
  const { form, set } = useForm()

  const [actInput, setActInput] = useState('')
  const [activities, setActivities] = useState<string[]>(
    form.extracurriculars
      ? form.extracurriculars
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  )

  const [achText, setAchText] = useState('')
  const [achLevel, setAchLevel] = useState('Школьный уровень')
  const [achievements, setAchievements] = useState<Achievement[]>(
    form.achievements
      ? form.achievements
          .split('\n')
          .map((line) => line.split(' — '))
          .filter((parts) => parts[0])
          .map(([text, level]) => ({ text: text.trim(), level: (level || 'Школьный уровень').trim() }))
      : []
  )

  function addActivity(value: string) {
    const v = value.trim()
    if (!v || activities.includes(v)) return
    const next = [...activities, v]
    setActivities(next)
    set('extracurriculars', next.join(', '))
    setActInput('')
  }

  function removeActivity(value: string) {
    const next = activities.filter((a) => a !== value)
    setActivities(next)
    set('extracurriculars', next.join(', '))
  }

  function addAchievement() {
    const text = achText.trim()
    if (!text) return
    const next = [...achievements, { text, level: achLevel }]
    setAchievements(next)
    set('achievements', next.map((a) => `${a.text} — ${a.level}`).join('\n'))
    setAchText('')
  }

  function removeAchievement(index: number) {
    const next = achievements.filter((_, i) => i !== index)
    setAchievements(next)
    set('achievements', next.map((a) => `${a.text} — ${a.level}`).join('\n'))
  }

  const valid = form.full_name.trim().length >= 3 && form.email.includes('@') && !!form.gpa && Number(form.gpa) >= 0 && Number(form.gpa) <= 4

  return (
    <StepLayout step={1} onContinue={() => router.push('/candidate/background')} continueDisabled={!valid} continueLabel="Продолжить">
      <div className="anim-fade-up" style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.8rem', fontFamily: 'Manrope', fontWeight: 700, color: '#c5fe00', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
          Этап 1.
        </p>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 'clamp(2.2rem,5vw,3.2rem)', lineHeight: 0.95, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
          Расскажите <span style={{ color: '#c5fe00', fontStyle: 'italic' }}>о себе</span>
        </h1>
        <p style={{ color: '#888', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '520px' }}>
          Этот раздел поможет нам лучше понять ваш образовательный путь, контекст и достижения.
        </p>
      </div>

      <div className="anim-fade-up delay-100" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span className="material-symbols-outlined" style={{ color: '#c5fe00', fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}>person</span>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Личные данные</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label className="iv-label">Имя</label>
            <input className="iv-input" placeholder="Александр" value={form.full_name.split(' ')[1] || ''} onChange={(e) => set('full_name', `${form.full_name.split(' ')[0] || ''} ${e.target.value}`.trim())} />
          </div>
          <div>
            <label className="iv-label">Фамилия</label>
            <input className="iv-input" placeholder="Волков" value={form.full_name.split(' ')[0] || ''} onChange={(e) => set('full_name', `${e.target.value} ${form.full_name.split(' ').slice(1).join(' ')}`.trim())} />
          </div>
          <div>
            <label className="iv-label">Отчество (если есть)</label>
            <input className="iv-input" placeholder="Сергеевич" />
          </div>
          <div>
            <label className="iv-label">Дата рождения</label>
            <input className="iv-input" type="date" />
          </div>
          <div>
            <label className="iv-label">Электронная почта</label>
            <input className="iv-input" type="email" placeholder="alex@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div>
            <label className="iv-label">Телефон</label>
            <input className="iv-input" placeholder="+7 (___) ___-__-__" />
          </div>
          <div>
            <label className="iv-label">Страна</label>
            <input className="iv-input" placeholder="Казахстан" />
          </div>
          <div>
            <label className="iv-label">Город</label>
            <input className="iv-input" placeholder="Алматы" />
          </div>
        </div>
      </div>

      <div className="anim-fade-up delay-200" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span className="material-symbols-outlined" style={{ color: '#c5fe00', fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}>school</span>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Учебная информация</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label className="iv-label">Уровень образования</label>
            <select className="iv-select">
              <option>Бакалавриат</option>
              <option>Магистратура</option>
              <option>Школьник</option>
              <option>Другое</option>
            </select>
          </div>
          <div>
            <label className="iv-label">Курс / Класс</label>
            <input className="iv-input" placeholder="3 курс" />
          </div>
          <div>
            <label className="iv-label">GPA</label>
            <input className="iv-input" type="number" step="0.01" min="0" max="4" placeholder="3.8" required value={form.gpa} onChange={(e) => set('gpa', e.target.value)} />
            <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.3rem', fontFamily: 'Manrope' }}>Укажите GPA по шкале до 4.0</p>
          </div>
        </div>
      </div>

      <div className="anim-fade-up delay-300" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#c5fe00', fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}>diversity_3</span>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Внеучебная деятельность</h2>
          </div>
          <span style={{ width: '1.5rem', height: '1.5rem', background: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#c5fe00', fontSize: '1rem', fontWeight: 700 }} onClick={() => actInput.trim() && addActivity(actInput)}>
            +
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {activities.map((a) => (
            <span key={a} className="chip-lime" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              {a}
              <span style={{ cursor: 'pointer', opacity: 0.7, fontWeight: 900, fontSize: '0.85rem' }} onClick={() => removeActivity(a)}>
                ×
              </span>
            </span>
          ))}
          {ACTIVITY_SUGGESTIONS.filter((s) => !activities.includes(s)).slice(0, 4).map((s) => (
            <span key={s} onClick={() => addActivity(s)} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.75rem', borderRadius: '9999px', background: '#141414', border: '1px solid #222', color: '#888', fontSize: '0.8rem', fontFamily: 'Manrope', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
              + {s}
            </span>
          ))}
        </div>

        <input className="iv-input" placeholder="Добавьте (напр. спорт)…" style={{ background: '#111', color: '#fff', border: '1px solid #1f1f1f' }} value={actInput} onChange={(e) => setActInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity(actInput))} />
      </div>

      <div className="anim-fade-up delay-400">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#c5fe00', fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Достижения</h2>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {achievements.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#111', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#c5fe00', fontSize: '1.25rem', fontVariationSettings: "'FILL' 1" }}>{getIcon(a.text)}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>{a.text}</p>
                <p style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Manrope', fontWeight: 700 }}>{a.level}</p>
              </div>
              <span className="material-symbols-outlined" style={{ color: '#555', fontSize: '1.1rem', cursor: 'pointer', transition: 'color .15s' }} onClick={() => removeAchievement(i)}>
                delete
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'end' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
            <input className="iv-input" placeholder="Победитель олимпиады по IT" style={{ background: '#111', color: '#fff', border: '1px solid #1f1f1f' }} value={achText} onChange={(e) => setAchText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())} />
            <select className="iv-select" style={{ background: '#111', color: '#fff', border: '1px solid #1f1f1f' }} value={achLevel} onChange={(e) => setAchLevel(e.target.value)}>
              <option>Школьный уровень</option>
              <option>Городской уровень</option>
              <option>Национальный уровень</option>
              <option>Международный уровень</option>
            </select>
          </div>
          <button onClick={addAchievement} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.875rem 1rem', background: '#141414', border: '1px solid #222', borderRadius: '0.75rem', color: '#c5fe00', fontSize: '0.85rem', fontFamily: 'Manrope', fontWeight: 700, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span> Добавить
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.5rem', fontFamily: 'Manrope' }}>Добавьте ваши главные достижения</p>
      </div>
    </StepLayout>
  )
}
