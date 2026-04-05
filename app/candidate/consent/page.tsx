'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConsentPage() {
  const router = useRouter()
  const [checks, setChecks] = useState({ data: false, ai: false, updates: false })
  const canContinue = checks.data && checks.ai

  function toggle(k: keyof typeof checks) {
    setChecks((c) => ({ ...c, [k]: !c[k] }))
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080808] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[22vw] -top-[12vw] h-[56vw] w-[56vw] max-h-[520px] max-w-[520px] rounded-[34%] bg-[#c5fe00]/90 blur-[34px]" />
        <div className="absolute -left-[19vw] -top-[9vw] h-[58vw] w-[58vw] max-h-[540px] max-w-[540px] rounded-[36%] opacity-80" />
        <div className="absolute -bottom-[20vw] -right-[15vw] h-[50vw] w-[50vw] max-h-[460px] max-w-[460px] rounded-[36%] bg-[#c5fe00]/90 blur-[34px]" />
        <div className="absolute -bottom-[17vw] -right-[12vw] h-[52vw] w-[52vw] max-h-[480px] max-w-[480px] rounded-[34%] opacity-80" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10 md:py-6">
        <span className="font-headline text-[1.45rem] font-black tracking-[-0.06em] text-white md:text-[1.7rem]">inVisionU</span>
        <span className="font-label text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white/40 md:text-[0.72rem]">
          Admissions Intelligence
        </span>
      </nav>

      <main className="relative z-10 flex min-h-[calc(100vh-84px)] items-center justify-center px-4 pb-8 pt-2 md:px-8 md:pb-12">
        <div className="w-full max-w-[980px] rounded-[32px] bg-[rgba(6,6,6,0.92)] shadow-[0_26px_80px_rgba(0,0,0,0.52)]  backdrop-blur-sm md:rounded-[40px]">
          <div className="grid gap-10 px-6 py-7 md:grid-cols-[1fr_420px] md:gap-14 md:px-10 md:py-10 lg:grid-cols-[1fr_430px] lg:px-14 lg:py-12">
            <section className="flex flex-col justify-center">
              <h1 className="font-headline text-[3rem] font-black leading-[0.9] tracking-[-0.07em] text-[#f6f6f1] sm:text-[4rem] lg:text-[4.8rem]">
                Ваши данные.
                <br />
                <span className="text-[#c5fe00]">Ваше будущее.</span>
              </h1>

              <p className="mt-6 max-w-[360px] text-[0.98rem] leading-8 text-white/62 md:mt-7">
                Мы сделали inVision U максимально прозрачным. Наша цель — честный процесс, понятная логика и уважение к каждому кандидату.
              </p>

              <div className="mt-9 space-y-6 md:mt-10">
                {[
                  {
                    icon: 'shield',
                    title: 'Privacy First',
                    desc: 'Личные данные и чувствительные детали используются только в рамках рассмотрения заявки.',
                  },
                  {
                    icon: 'balance',
                    title: 'Unbiased Fairness',
                    desc: 'Алгоритмы помогают структурировать сигналы, а финальное решение принимает комиссия.',
                  },
                ].map((item) => (
                  <div key={item.icon} className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/6">
                      <span className="material-symbols-outlined text-[18px] text-[#c5fe00]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {item.icon}
                      </span>
                    </div>
                    <div className="max-w-[320px]">
                      <p className="font-headline text-[1.15rem] font-extrabold leading-none tracking-[-0.045em] text-[#f8f8f4] md:text-[1.3rem]">
                        {item.title}
                      </p>
                      <p className="mt-2.5 text-[0.9rem] leading-7 text-white/45 md:text-[0.93rem]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] bg-[#ecece8] px-5 py-6 text-[#101010] shadow-[0_28px_80px_rgba(0,0,0,0.34)] md:px-7 md:py-8 lg:rounded-[36px] lg:px-8 lg:py-9">
              <div>
                <h2 className="font-headline text-[2rem] font-black tracking-[-0.05em] md:text-[2.2rem]">Review & Consent</h2>
                <div className="mt-4 h-1 w-14 rounded-full bg-[#c5fe00]" />
              </div>

              <a
                href="https://docs.google.com/document/d/1SqMpV9Y-tedP_Xjc5pUtF5l2PxFwDzdX/edit?usp=sharing&ouid=117728091208886474871&rtpof=true&sd=true"
                target="_blank"
                rel="noreferrer"
                className="mt-6 block rounded-[1.5rem] bg-[#dcdcd8] px-4 py-4 md:px-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="material-symbols-outlined shrink-0 text-[22px] text-black/70">description</span>
                    <div>
                      <p className="font-headline text-[1.06rem] font-extrabold leading-[1.05] tracking-[-0.04em] md:text-[1.18rem]">
                        Data & Privacy Policy
                      </p>
                      <p className="mt-1 font-label text-[0.66rem] font-bold uppercase tracking-[0.14em] text-black/45">
                        Version 2.4 • updated sep 2023
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined shrink-0 text-[22px] text-black/70">arrow_forward</span>
                </div>
              </a>

              <div className="mt-6 space-y-5">
                {[
                  { key: 'data', text: 'Я даю согласие на обработку персональных данных для целей оценки и рассмотрения заявки.' },
                  { key: 'ai', text: 'Я понимаю, что inVision U использует AI как вспомогательный инструмент, а финальное решение остаётся за приёмной комиссией.' },
                  { key: 'updates', text: 'Я хочу получать обновления о стипендиях, дедлайнах и программе по email.' },
                ].map((item) => {
                  const checked = checks[item.key as keyof typeof checks]
                  return (
                    <label key={item.key} className="flex cursor-pointer items-start gap-3.5">
                      <button
                        type="button"
                        aria-pressed={checked}
                        onClick={() => toggle(item.key as keyof typeof checks)}
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[0.45rem] border-2 border-[#272727] transition-all"
                        style={{ background: checked ? '#101010' : 'transparent' }}
                      >
                        {checked && (
                          <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check
                          </span>
                        )}
                      </button>
                      <span className="text-[0.95rem] font-medium leading-7 text-[#1a1a1a]">{item.text}</span>
                    </label>
                  )
                })}
              </div>

              <div className="mt-6 border-t border-black/10 pt-5">
                <button
                  disabled={!canContinue}
                  onClick={() => router.push('/candidate/personal')}
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-[#c5fe00] px-8 py-4 font-headline text-[1.08rem] font-black text-[#2a3500] shadow-[0_18px_40px_rgba(197,254,0,0.18)] transition-all hover:bg-[#b9ef00] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Продолжить
                  <span className="material-symbols-outlined text-[20px]">trending_flat</span>
                </button>
                <p className="mt-4 text-center text-[0.72rem] font-medium text-black/42">
                  Продолжая, вы подтверждаете согласие с условиями подачи и обработки данных.
                </p>
              </div>
            </section>
          </div>

          <footer className="flex flex-wrap items-center justify-center gap-5 px-5 pb-6 text-[12px] text-white/30 md:gap-7 md:px-8 md:pb-7">
            <span className="transition-colors hover:text-white/65">Support</span>
            <span className="transition-colors hover:text-white/65">Cookie Settings</span>
            <span>© 2024 inDrive</span>
          </footer>
        </div>
      </main>
    </div>
  )
}
