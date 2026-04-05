'use client'
import { useRouter } from 'next/navigation'
import StepLayout from '@/components/StepLayout'
import { useForm } from '@/context/form-context'

export default function EssayStep() {
  const router      = useRouter()
  const { form, set } = useForm()

  const words = form.essay.trim() ? form.essay.trim().split(/\s+/).length : 0
  const pct   = Math.min((words / 300) * 100, 100)
  const ok    = words >= 150

  return (
    <StepLayout step={3} backHref="/candidate/background"
                onContinue={() => router.push('/candidate/interview')}
                continueDisabled={!ok}>

      <div className="anim-fade-up" style={{marginBottom:'2.5rem'}}>
        <p style={{fontSize:'0.8rem',fontFamily:'Manrope',fontWeight:700,color:'#c5fe00',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:'0.5rem'}}>Этап 3.</p>
        <h1 style={{fontFamily:'Plus Jakarta Sans',fontWeight:800,fontSize:'clamp(2.2rem,5vw,3.2rem)',lineHeight:0.95,letterSpacing:'-0.025em',marginBottom:'1rem'}}>
          Личное <span style={{color:'#c5fe00',fontStyle:'italic'}}>эссе</span>
        </h1>
        <p style={{color:'#888',fontSize:'0.9375rem',lineHeight:1.7,maxWidth:'520px'}}>
          Это ваша главная возможность показать кто вы есть — за пределами оценок и достижений.
        </p>
      </div>

      {/* Prompt */}
      <div className="anim-fade-up delay-100"
           style={{background:'#111',borderRadius:'1rem',padding:'1.25rem',borderLeft:'3px solid #c5fe00',marginBottom:'2rem'}}>
        <p style={{fontSize:'0.7rem',fontFamily:'Manrope',fontWeight:700,color:'#c5fe00',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.4rem'}}>Тема эссе</p>
        <p style={{color:'#ddd',fontSize:'0.9rem',lineHeight:1.65,fontFamily:'Manrope'}}>
          Почему вы хотите присоединиться к inVision U? Что вас движет и какой конкретный вклад вы планируете внести? Опишите момент, который определил ваш путь, и как он связан с вашими целями здесь.
        </p>
      </div>

      <div className="anim-fade-up delay-200">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
          <label className="iv-label" style={{margin:0}}>Ваше эссе</label>
          <span style={{fontSize:'0.75rem',fontFamily:'Manrope',fontWeight:700,
                        color: words >= 300 ? '#c5fe00' : words >= 150 ? '#888' : '#555'}}>
            {words} / 300+ слов
          </span>
        </div>

        <textarea
          className="iv-input-dark"
          rows={14}
          placeholder="Напишите ваше эссе здесь…"
          value={form.essay}
          onChange={e => set('essay', e.target.value)}
          style={{width:'100%',resize:'vertical',marginBottom:'0.75rem'}}
        />

        {/* Progress */}
        <div style={{height:'0.25rem',background:'#1a1a1a',borderRadius:'9999px',overflow:'hidden',marginBottom:'0.4rem'}}>
          <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#c5fe00,#b9ef00)',borderRadius:'9999px',transition:'width .4s ease'}} />
        </div>
        <p style={{fontSize:'0.75rem',color:'#555',fontFamily:'Manrope'}}>
          {words < 300 ? `Ещё ${300 - words} слов рекомендуется` : '✓ Отличная длина'}
        </p>
      </div>

    </StepLayout>
  )
}
