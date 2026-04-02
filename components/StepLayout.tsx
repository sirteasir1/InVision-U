'use client'
import Link from 'next/link'
import BackgroundDecor from '@/components/BackgroundDecor'

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
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#050505] text-white">
      <BackgroundDecor />

      <header className="iv-nav">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:h-16 md:px-8 md:py-0">
          <Link href="/" className="shrink-0 font-headline text-[1.5rem] font-black leading-none tracking-[-0.05em] text-white md:text-[1.65rem]">
            inVisionU
          </Link>

          <div className="hidden max-w-[540px] flex-1 items-center justify-center gap-0 md:flex">
            {STEPS.map((s, i) => {
              const done = s.num < step
              const current = s.num === step
              return (
                <div key={s.num} className="flex flex-1 items-center last:flex-none">
                  <div className="flex shrink-0 items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full font-headline text-[0.8rem] font-black transition-all"
                      style={{
                        background: done || current ? '#c5fe00' : '#141414',
                        color: done || current ? '#2a3500' : '#555',
                        boxShadow: current ? '0 0 0 3px rgba(197,254,0,0.12)' : 'none',
                      }}
                    >
                      {done ? <span className="material-symbols-outlined text-[14px]">check</span> : s.num}
                    </div>
                    <span
                      className="font-label text-[11px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: current ? '#c5fe00' : done ? '#8c8c8c' : '#474747' }}
                    >
                      {s.ru}
                    </span>
                  </div>
                  {i !== STEPS.length - 1 && <div className="mx-3 h-px flex-1" style={{ background: done ? 'rgba(197,254,0,0.34)' : '#1d1d1d' }} />}
                </div>
              )
            })}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 md:text-[11px]">Шаг {step} из 4</span>
            <div className="h-[4px] w-14 overflow-hidden rounded-full bg-[#1b1b1b] md:w-16">
              <div className="h-full rounded-full bg-[#c5fe00] transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[700px] flex-1 px-4 pb-36 pt-24 md:px-8 md:pb-28 md:pt-28">{children}</main>

      <div className="step-bottom-bar relative z-20 px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex items-center justify-between gap-4 text-white/48 md:justify-start md:gap-6">
            <Link href="/" className="flex items-center gap-2 text-[0.76rem] font-label font-bold transition-colors hover:text-white md:text-[0.82rem]">
              <span className="material-symbols-outlined text-[18px]">help</span>
              Помощь
            </Link>
            <Link href="/" className="flex items-center gap-2 text-[0.76rem] font-label font-bold transition-colors hover:text-white md:text-[0.82rem]">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Выйти
            </Link>
          </div>

          <div className="flex w-full items-center gap-3 md:w-auto">
            {backHref && (
              <Link href={backHref} className="btn-ghost !flex-1 !bg-[#171717] !px-5 !py-3 !text-sm md:!flex-none">
                Назад
              </Link>
            )}
            {onContinue && (
              <button onClick={onContinue} disabled={continueDisabled || isSubmitting} className="btn-lime !flex-1 !px-8 !py-4 !text-[0.95rem] md:!flex-none">
                {isSubmitting ? (
                  <>
                    <span className="shimmer inline-block h-1 w-5 rounded-full" />
                    Отправка…
                  </>
                ) : (
                  <>
                    {continueLabel}
                    <span className="material-symbols-outlined text-[18px]">trending_flat</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
