'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConsentPage() {
  const router = useRouter()
  const [checks, setChecks] = useState({ data: false, ai: false, updates: false })
  const canContinue = checks.data && checks.ai

  function toggle(k: keyof typeof checks) {
    setChecks(c => ({ ...c, [k]: !c[k] }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'rgba(197,254,0,0.06)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '30vw', height: '30vw', background: 'rgba(197,254,0,0.04)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2.5rem' }}>
        <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>inVision U</span>
        <span style={{ fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em' }}>ПРОЗРАЧНЫЙ ОТБОР</span>
      </nav>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', maxWidth: '960px', width: '100%', alignItems: 'center' }}>
          <div className="anim-fade-up">
            <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 'clamp(2.5rem,5vw,3.5rem)', lineHeight: 0.93, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              Ваши данные.<br />
              <span style={{ color: '#c5fe00', fontStyle: 'italic' }} className="text-glow">Ваше будущее.</span>
            </h1>
            <p style={{ color: '#888', fontSize: '0.9375rem', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '360px' }}>
              Мы сделали inVision U максимально понятным и честным. Здесь важно, чтобы кандидат понимал, как используются его данные и какую роль играет AI-анализ.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { icon: 'shield', title: 'Приватность прежде всего', desc: 'Личные данные используются только для рассмотрения заявки и не публикуются.' },
                { icon: 'balance', title: 'Справедливость и прозрачность', desc: 'AI помогает структурировать сигналы, но итоговое решение всегда принимает комиссия.' },
              ].map(item => (
                <div key={item.icon} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '2rem', height: '2rem', background: 'rgba(197,254,0,0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#c5fe00', fontSize: '1rem', fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.title}</p>
                    <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="anim-fade-up delay-200" style={{ background: '#ffffff', borderRadius: '1.5rem', padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.4rem', color: '#0a0a0a', marginBottom: '0.5rem' }}>Согласие и условия</h2>
              <div style={{ width: '2.5rem', height: '0.2rem', background: '#c5fe00', borderRadius: '9999px' }} />
            </div>

            <div style={{ background: '#f5f5f5', borderRadius: '0.875rem', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#555', fontSize: '1.25rem' }}>description</span>
                <div>
                  <p style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '0.875rem', color: '#0a0a0a' }}>Политика данных и конфиденциальности</p>
                  <p style={{ fontSize: '0.7rem', color: '#888', fontFamily: 'Manrope', fontWeight: 600, letterSpacing: '0.05em' }}>ВЕРСИЯ 2.4 • АКТУАЛЬНО</p>
                </div>
              </div>
              <span className="material-symbols-outlined" style={{ color: '#888', fontSize: '1.1rem' }}>verified</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { key: 'data', text: 'Я согласен(на) на обработку моих персональных данных для целей рассмотрения заявки.' },
                { key: 'ai', text: 'Я понимаю, что inVision U использует AI-аналитику как вспомогательный инструмент, а финальное решение принимает комиссия.' },
                { key: 'updates', text: 'Я хочу получать обновления о дедлайнах и возможностях программы по email.' },
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <div onClick={() => toggle(item.key as keyof typeof checks)} style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.3rem', border: `2px solid ${checks[item.key as keyof typeof checks] ? '#c5fe00' : '#ddd'}`, background: checks[item.key as keyof typeof checks] ? '#c5fe00' : 'transparent', flexShrink: 0, marginTop: '0.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s ease', cursor: 'pointer' }}>
                    {checks[item.key as keyof typeof checks] && <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', color: '#2a3500', fontVariationSettings: "'wght' 700" }}>check</span>}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.55, fontFamily: 'Manrope', fontWeight: 500 }}>{item.text}</span>
                </label>
              ))}
            </div>

            <button onClick={() => canContinue && router.push('/candidate/personal')} disabled={!canContinue} className="btn-lime" style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', opacity: canContinue ? 1 : 0.5, cursor: canContinue ? 'pointer' : 'not-allowed' }}>
              Продолжить →
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#aaa', fontFamily: 'Manrope' }}>Продолжая, вы подтверждаете, что подаёте заявку осознанно и согласны с условиями обработки данных.</p>
          </div>
        </div>
      </main>

      <footer style={{ padding: '1rem 2.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', color: '#333', fontSize: '0.8rem' }}>
        <span style={{ color: '#444' }}>Поддержка</span>
        <span style={{ color: '#444' }}>Настройки cookies</span>
        <span style={{ color: '#333' }}>© 2026 inVision U</span>
      </footer>
    </div>
  )
}
