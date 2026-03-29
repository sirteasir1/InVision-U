'use client'
import Link from 'next/link'

const STEPS = [
  { num: 1, ru: 'ЛИЧНОЕ' },
  { num: 2, ru: 'ОПЫТ' },
  { num: 3, ru: 'ЭССЕ' },
  { num: 4, ru: 'ИНТЕРВЬЮ' },
] as const

interface Props {
  step: 1 | 2 | 3 | 4
  backHref?: string
  onContinue?: () => void
  continueLabel?: string
  continueDisabled?: boolean
  isSubmitting?: boolean
  children: React.ReactNode
}

export default function StepLayout({
  step,
  backHref,
  onContinue,
  continueLabel = 'Продолжить',
  continueDisabled = false,
  isSubmitting = false,
  children,
}: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 10% 20%, rgba(197,254,0,0.10), transparent 28%), radial-gradient(circle at 88% 28%, rgba(197,254,0,0.06), transparent 22%), radial-gradient(circle at 50% 100%, rgba(197,254,0,0.05), transparent 26%), #0a0a0a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '8%', left: '-8%', width: '34vw', height: '34vw', maxWidth: '480px', maxHeight: '480px', background: 'rgba(197,254,0,0.06)', filter: 'blur(110px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '38%', right: '-12%', width: '30vw', height: '30vw', maxWidth: '420px', maxHeight: '420px', background: 'rgba(197,254,0,0.05)', filter: 'blur(95px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-14%', left: '18%', width: '28vw', height: '28vw', maxWidth: '360px', maxHeight: '360px', background: 'rgba(197,254,0,0.045)', filter: 'blur(100px)', borderRadius: '50%' }} />
      </div>

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,10,10,0.84)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 2rem', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1rem', color: '#fff', textDecoration: 'none', flexShrink: 0, letterSpacing: '-0.02em' }}>
            inVision U
          </Link>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0' }}>
            {STEPS.map((s, i) => {
              const done = s.num < step
              const current = s.num === step
              const last = i === STEPS.length - 1
              return (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: last ? 'none' : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '0.8rem', transition: 'all .3s ease', background: done || current ? '#c5fe00' : '#171717', color: done || current ? '#2a3500' : '#555', boxShadow: current ? '0 0 0 3px rgba(197,254,0,0.2)' : 'none' }}>
                      {done ? <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', fontVariationSettings: "'wght' 700" }}>check</span> : s.num}
                    </div>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'Manrope', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: current ? '#c5fe00' : done ? '#888' : '#333', transition: 'color .3s ease' }}>
                      {s.ru}
                    </span>
                  </div>

                  {!last && <div style={{ flex: 1, height: '1px', margin: '0 0.5rem', background: done ? '#c5fe00' : '#1f1f1f', transition: 'background .5s ease' }} />}
                </div>
              )
            })}
          </div>

          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#555', fontSize: '0.75rem', fontFamily: 'Manrope', fontWeight: 600 }}>{step} из 4</span>
            <div style={{ width: '3rem', height: '0.2rem', background: '#1a1a1a', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(step / 4) * 100}%`, background: '#c5fe00', transition: 'width .5s ease', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '6rem 2rem 6rem', maxWidth: '760px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>{children}</main>

      <div className="step-bottom-bar" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#555', fontSize: '0.8rem', fontFamily: 'Manrope', fontWeight: 600 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', fontVariationSettings: "'FILL' 1", color: '#c5fe00' }}>school</span>
            Заявка
          </div>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#555', fontSize: '0.8rem', fontFamily: 'Manrope', fontWeight: 600, textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>logout</span>
            Выйти
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {backHref && <Link href={backHref} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#888', fontSize: '0.9rem', fontFamily: 'Manrope', fontWeight: 600, textDecoration: 'none', padding: '0.6rem 1rem' }}>← Назад</Link>}
          {onContinue && (
            <button onClick={onContinue} disabled={continueDisabled || isSubmitting} className="btn-lime" style={{ padding: '0.7rem 1.75rem', fontSize: '0.9rem', gap: '0.4rem' }}>
              {isSubmitting ? <><span style={{ display: 'inline-block', width: '1rem', height: '0.2rem', borderRadius: '9999px' }} className="shimmer-bar" /> Отправка…</> : <>{continueLabel} →</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
