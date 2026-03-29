'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Role = 'candidate' | 'committee'

function AuthForm() {
  const router   = useRouter()
  const params   = useSearchParams()
  const [role, setRole]     = useState<Role>((params.get('role') as Role) ?? 'candidate')
  const [pw, setPw]         = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const r = params.get('role') as Role
    if (r === 'candidate' || r === 'committee') setRole(r)
  }, [params])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    if (role === 'candidate') { router.push('/candidate/consent'); return }
    const res = await fetch('/api/committee', { headers: { 'x-committee-password': pw } })
    if (res.status === 401) { setError('Неверный пароль'); setLoading(false); return }
    sessionStorage.setItem('committee_pw', pw)
    router.push('/committee/candidates')
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',flexDirection:'column'}}>
      <nav className="iv-nav">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.9rem 2rem',maxWidth:'1440px',margin:'0 auto'}}>
          <Link href="/" style={{fontFamily:'Plus Jakarta Sans',fontWeight:800,fontSize:'1.25rem',color:'#fff',textDecoration:'none'}}>inVision U</Link>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'0.4rem',color:'#888',fontSize:'0.875rem',fontWeight:600,textDecoration:'none',transition:'color .2s'}}
                onMouseOver={e=>(e.currentTarget.style.color='#fff')} onMouseOut={e=>(e.currentTarget.style.color='#888')}>
            <span className="material-symbols-outlined" style={{fontSize:'1.1rem'}}>arrow_back</span> На главную
          </Link>
        </div>
      </nav>

      <main style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'6rem 1.5rem 3rem'}}>
        <div style={{width:'100%',maxWidth:'420px'}}>
          <div className="anim-fade-up" style={{marginBottom:'2rem'}}>
            <h1 className="display-step" style={{marginBottom:'0.5rem'}}>
              {role === 'candidate' ? <>Подать <span className="lime-italic">заявку</span></> : <>Войти в <span className="lime-italic">комиссию</span></>}
            </h1>
            <p style={{color:'#666',fontSize:'0.9375rem',lineHeight:1.6}}>
              {role === 'candidate' ? 'Начните свой путь в inVision U.' : 'Доступ только для членов комиссии.'}
            </p>
          </div>

          {/* Role switcher */}
          <div className="anim-fade-up delay-100" style={{display:'flex',background:'#141414',borderRadius:'9999px',padding:'0.3rem',gap:'0.25rem',marginBottom:'1.5rem'}}>
            {(['candidate','committee'] as Role[]).map(r=>(
              <button key={r} type="button" onClick={()=>{setRole(r);setError('');setPw('')}}
                      style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem',
                              padding:'0.7rem 1rem',borderRadius:'9999px',border:'none',cursor:'pointer',
                              fontFamily:'Plus Jakarta Sans',fontWeight:700,fontSize:'0.85rem',
                              transition:'all .2s ease',
                              background: role===r ? '#c5fe00' : 'transparent',
                              color: role===r ? '#2a3500' : '#888'}}>
                <span className="material-symbols-outlined" style={{fontSize:'1rem',fontVariationSettings:"'FILL' 1"}}>
                  {r==='candidate' ? 'person' : 'groups'}
                </span>
                {r==='candidate' ? 'Кандидат' : 'Комиссия'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="anim-fade-up delay-200" style={{background:'#111',borderRadius:'1.25rem',padding:'2rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
            {role === 'candidate' ? (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                <div style={{background:'#0a0a0a',borderRadius:'0.875rem',padding:'1rem',display:'flex',gap:'0.75rem',alignItems:'flex-start'}}>
                  <span className="material-symbols-outlined" style={{color:'#c5fe00',fontSize:'1.25rem',marginTop:'0.1rem',fontVariationSettings:"'FILL' 1"}}>info</span>
                  <div>
                    <p style={{fontWeight:700,fontSize:'0.875rem',marginBottom:'0.25rem'}}>Регистрация не нужна</p>
                    <p style={{color:'#666',fontSize:'0.8rem',lineHeight:1.6}}>Нажмите кнопку ниже и начните заполнять заявку из 4 шагов.</p>
                  </div>
                </div>
                {[{i:'person',t:'Личная информация'},{i:'star',t:'Опыт и достижения'},{i:'article',t:'Эссе (300+ слов)'},{i:'forum',t:'Интервью с записью голоса'}].map(item=>(
                  <div key={item.i} style={{display:'flex',alignItems:'center',gap:'0.75rem',color:'#888',fontSize:'0.875rem'}}>
                    <span className="material-symbols-outlined" style={{color:'#c5fe00',fontSize:'1.1rem',fontVariationSettings:"'FILL' 1"}}>{item.i}</span>
                    {item.t}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <label className="iv-label">Пароль комиссии</label>
                <input className="iv-input" type="password" required autoFocus value={pw}
                       onChange={e=>setPw(e.target.value)} placeholder="••••••••" />
              </div>
            )}

            {error && (
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'rgba(217,61,24,0.12)',borderRadius:'0.75rem',padding:'0.75rem 1rem',color:'#ff7351',fontSize:'0.875rem'}}>
                <span className="material-symbols-outlined" style={{fontSize:'1.1rem'}}>error</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-lime" style={{width:'100%',fontSize:'1rem',padding:'0.9rem'}}>
              {loading
                ? <span style={{display:'inline-block',width:'1.2rem',height:'0.25rem',borderRadius:'9999px'}} className="shimmer-bar" />
                : role === 'candidate' ? <>Начать заявку <span className="material-symbols-outlined" style={{fontSize:'1.1rem'}}>arrow_forward</span></>
                                        : <>Войти <span className="material-symbols-outlined" style={{fontSize:'1.1rem'}}>arrow_forward</span></>}
            </button>
          </form>

          <p className="anim-fade-up delay-300" style={{textAlign:'center',color:'#444',fontSize:'0.8rem',marginTop:'1.25rem'}}>
            {role === 'candidate'
              ? <>Уже подали заявку? <a href="mailto:admissions@invisionu.ai" style={{color:'#c5fe00',textDecoration:'none'}}>Напишите нам</a></>
              : 'Забыли пароль? Обратитесь к администратору.'}
          </p>
        </div>
      </main>
    </div>
  )
}

export default function AuthPage() {
  return <Suspense><AuthForm /></Suspense>
}
