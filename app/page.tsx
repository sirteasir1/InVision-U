'use client'
import type { CSSProperties } from 'react'
import Link from 'next/link'

const navLinkBase: CSSProperties = {
  color: '#888',
  fontFamily: 'Plus Jakarta Sans',
  fontWeight: 600,
  fontSize: '0.875rem',
  textDecoration: 'none',
  transition: 'color .2s',
}

const infoColumns = [
  {
    title: 'Навигация',
    links: ['Программа', 'Стипендии', 'Этапы отбора', 'Сообщество'],
  },
  {
    title: 'Правила',
    links: ['Конфиденциальность', 'Условия использования', 'Этика ИИ'],
  },
]

export default function Home() {
  return (
    <div className="section-dark text-white overflow-x-hidden">
      <nav className="iv-nav">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 2rem', maxWidth: '1440px', margin: '0 auto' }}>
          <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>inVision U</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden md:flex">
            <a href="#values" style={{ color: '#c5fe00', fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '0.875rem', borderBottom: '2px solid #c5fe00', paddingBottom: '2px', textDecoration: 'none' }}>Ценности</a>
            <a href="#how" style={navLinkBase} onMouseOver={e => (e.currentTarget.style.color = '#fff')} onMouseOut={e => (e.currentTarget.style.color = '#888')}>Этапы</a>
            <a href="#apply" style={navLinkBase} onMouseOver={e => (e.currentTarget.style.color = '#fff')} onMouseOut={e => (e.currentTarget.style.color = '#888')}>Подача</a>
          </div>
          <Link href="/auth?role=candidate" className="btn-lime" style={{ padding: '0.6rem 1.4rem', fontSize: '0.875rem' }}>
            Подать заявку
          </Link>
        </div>
      </nav>

      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '7rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '50vw', height: '50vw', maxWidth: '600px', maxHeight: '600px', background: 'rgba(197,254,0,0.07)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '40vw', height: '40vw', maxWidth: '500px', maxHeight: '500px', background: 'rgba(197,254,0,0.04)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
          <div className="anim-fade-up" style={{ marginBottom: '1.5rem' }}>
            <span style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '9999px', background: '#141414', border: '1px solid rgba(197,254,0,0.2)', color: '#c5fe00', fontSize: '0.7rem', fontFamily: 'Manrope', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              AI-ПОДДЕРЖКА ОТБОРА
            </span>
          </div>

          <h1 className="display-hero anim-fade-up delay-100" style={{ marginBottom: '1.5rem' }}>
            Мы ищем будущих <span className="lime-italic text-glow">лидеров</span>, а не только оценки
          </h1>

          <p className="anim-fade-up delay-200" style={{ fontSize: '1.125rem', color: '#888', maxWidth: '560px', margin: '0 auto 2.5rem', lineHeight: 1.7, fontWeight: 500 }}>
            Подайте заявку на обучение в inVision U с AI-ассистированным разбором, который помогает увидеть мотивацию, зрелость, лидерство и потенциал к росту.
          </p>

          <div className="anim-fade-up delay-300" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth?role=candidate" className="btn-lime" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>
              Подать заявку
            </Link>
            <Link href="/auth?role=committee" className="btn-ghost" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>
              Войти в комиссию
            </Link>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', textAlign: 'left' }} className="hidden md:block anim-fade-in delay-400">
          <p style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1rem', color: '#fff' }}>inVision U</p>
          <p style={{ fontSize: '0.7rem', color: '#555', marginTop: '0.2rem' }}>Платформа интеллектуального отбора</p>
        </div>
      </section>

      <section id="values" style={{ padding: '6rem 2rem', background: '#0d0d0d' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
            <h2 className="headline-section">Наши ценности</h2>
            <p style={{ color: '#888', fontSize: '0.9375rem', maxWidth: '320px', lineHeight: 1.7, textAlign: 'right', marginLeft: 'auto' }}>
              Мы смотрим не только на формальные метрики, а на глубину мышления, внутреннюю мотивацию и способность приносить пользу людям.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: '1rem' }}>
            <div
              style={{ gridColumn: 'span 7', background: '#141414', borderRadius: '1.25rem', padding: '2.5rem', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', transition: 'transform .3s ease' }}
              onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div>
                <span className="material-symbols-outlined" style={{ color: '#c5fe00', fontSize: '2.5rem', fontVariationSettings: "'FILL' 1", display: 'block', marginBottom: '1rem' }}>bolt</span>
                <h3 className="title-card" style={{ marginBottom: '0.75rem' }}>Мотивация</h3>
                <p style={{ color: '#888', fontSize: '1rem', lineHeight: 1.65, maxWidth: '340px' }}>Истинная причина расти, создавать и менять среду вокруг себя важнее, чем идеально отполированная анкета.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c5fe00', fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.875rem', marginTop: '1.5rem', cursor: 'pointer' }}>
                Подробнее <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
              </div>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'linear-gradient(to left,rgba(197,254,0,0.04),transparent)', pointerEvents: 'none' }} />
            </div>

            <div
              style={{ gridColumn: 'span 5', background: '#c5fe00', borderRadius: '1.25rem', padding: '2.5rem', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform .3s ease' }}
              onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', color: '#2a3500' }}>workspace_premium</span>
                <h3 className="title-card" style={{ color: '#2a3500', marginBottom: '0.75rem' }}>Лидерство</h3>
              </div>
              <p style={{ color: 'rgba(42,53,0,0.75)', fontSize: '1rem', fontWeight: 700, lineHeight: 1.65 }}>
                Способность брать ответственность, вести людей через неопределённость и нести результат до конца.
              </p>
            </div>

            <div
              style={{ gridColumn: 'span 5', background: '#141414', borderRadius: '1.25rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', transition: 'transform .3s ease' }}
              onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', color: '#fff' }}>trending_up</span>
              <h3 className="title-card" style={{ marginBottom: '0.75rem' }}>Рост</h3>
              <p style={{ color: '#888', fontSize: '0.9375rem', lineHeight: 1.65, flex: 1 }}>Готовность учиться, честно рефлексировать и пересобирать себя важнее, чем безошибочный путь без трудностей.</p>
              <div style={{ marginTop: '1.5rem', height: '0.375rem', background: '#222', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '75%', background: 'linear-gradient(90deg,#c5fe00,#b9ef00)', borderRadius: '9999px' }} />
              </div>
            </div>

            <div
              style={{ gridColumn: 'span 7', background: '#101010', borderRadius: '1.25rem', padding: '2.5rem', position: 'relative', overflow: 'hidden', transition: 'transform .3s ease' }}
              onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span className="material-symbols-outlined" style={{ color: '#c5fe00', fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>balance</span>
              <h3 className="title-card" style={{ marginBottom: '0.75rem' }}>Справедливость</h3>
              <p style={{ color: '#888', fontSize: '0.9375rem', lineHeight: 1.65, maxWidth: '380px' }}>AI помогает структурировать сигналы, но не решает за людей. Финальный выбор всегда остаётся за комиссией.</p>
              <div style={{ position: 'absolute', bottom: '-4rem', right: '-4rem', width: '14rem', height: '14rem', border: '3rem solid rgba(197,254,0,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </section>

      <section id="how" style={{ padding: '7rem 2rem', background: '#050505' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 className="headline-section" style={{ marginBottom: '1rem' }}>Как это работает</h2>
            <p style={{ color: '#888', fontSize: '1rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.7 }}>
              Прозрачный процесс отбора в 4 шага: анкета, подтверждение, глубокий разбор ответов и итоговое интервью с объяснимой AI-оценкой.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {[
              { n: '01', t: 'Анкета', i: 'edit_note', d: 'Заполните базовую информацию, расскажите о своём опыте, достижениях и целях.' },
              { n: '02', t: 'Согласие', i: 'verified_user', d: 'Подтвердите данные и согласие на AI-поддержку анализа.', glow: 'rgba(197,254,0,0.10)' },
              { n: '03', t: 'Разбор заявки', i: 'model_training', d: 'Система анализирует эссе и интервью, ищет сигналы, риски и объясняет оценки.', glow: 'rgba(197,254,0,0.08)' },
              { n: '04', t: 'Интервью', i: 'forum', d: 'Комиссия смотрит материалы, ответы и AI-сводку перед финальным решением.', glow: 'rgba(197,254,0,0.07)' },
            ].map((s) => (
              <div
                key={s.n}
                style={{ padding: '2rem', background: '#0d0d0d', borderRadius: '1.25rem', transition: 'background .25s ease, transform .25s ease', cursor: 'default', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#141414'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#0d0d0d'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {s.glow && <div style={{ position: 'absolute', inset: 'auto -20% -35% auto', width: '12rem', height: '12rem', background: s.glow, filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none' }} />}
                <div
                  style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '3.5rem', color: '#c5fe00', opacity: 0.2, lineHeight: 1, marginBottom: '1.5rem', transition: 'opacity .25s ease', position: 'relative' }}
                  onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                  onMouseOut={e => (e.currentTarget.style.opacity = '0.2')}
                >
                  {s.n}
                </div>
                <h4 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.75rem', position: 'relative' }}>{s.t}</h4>
                <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.7, position: 'relative' }}>{s.d}</p>
                <span className="material-symbols-outlined" style={{ display: 'block', marginTop: '1.5rem', color: '#c5fe00', fontVariationSettings: "'FILL' 1", position: 'relative' }}>{s.i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" style={{ padding: '7rem 2rem', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#111', borderRadius: '1.5rem', padding: '5rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden', animation: 'glow-pulse 4s ease-in-out infinite' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '500px', background: 'rgba(197,254,0,0.06)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="headline-section" style={{ marginBottom: '1.25rem' }}>
              Готовы изменить <span className="lime-italic text-glow">своё</span> будущее?
            </h2>
            <p style={{ color: '#888', fontSize: '1.125rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
              Приём заявок открыт. Начните путь в inVision U и пройдите отбор с понятной, объяснимой и более справедливой системой оценки.
            </p>
            <Link href="/auth?role=candidate" className="btn-lime" style={{ fontSize: '1.25rem', padding: '1.1rem 3rem', display: 'inline-flex' }}>
              Подать заявку
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ background: '#050505', padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '3rem' }}>
          <div>
            <p style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.5rem', marginBottom: '1rem' }}>inVision U</p>
            <p style={{ color: '#555', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '300px', marginBottom: '1.5rem' }}>Программа, которая помогает видеть в заявке не только цифры, но и потенциал человека, его зрелость и вклад в будущее.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['share', 'public'].map(i => (
                <a
                  key={i}
                  href="#"
                  style={{ width: '2.5rem', height: '2.5rem', background: '#141414', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#c5fe00')}
                  onMouseOut={e => (e.currentTarget.style.background = '#141414')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{i}</span>
                </a>
              ))}
            </div>
          </div>
          {infoColumns.map(col => (
            <div key={col.title}>
              <p style={{ color: '#fff', fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>{col.title}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {col.links.map(l => (
                  <li key={l}>
                    <a
                      href="#"
                      style={{ color: '#555', fontSize: '0.875rem', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseOver={e => (e.currentTarget.style.color = '#c5fe00')}
                      onMouseOut={e => (e.currentTarget.style.color = '#555')}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: '1200px', margin: '3rem auto 0', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', color: '#333', fontSize: '0.8rem', gap: '1rem', flexWrap: 'wrap' }}>
          <p>© 2026 inVision U. Все права защищены.</p>
          <p>Создано для тех, кто хочет влиять на будущее.</p>
        </div>
      </footer>
    </div>
  )
}
