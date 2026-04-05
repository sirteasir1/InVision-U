'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import BackgroundDecor from '@/components/BackgroundDecor'

const NAV = [
  { href: '/committee/candidates', icon: 'group', label: 'Заявки' },
  { href: '/committee/stats', icon: 'analytics', label: 'Аналитика' },
]

export default function CommitteeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  function logout() {
    sessionStorage.removeItem('committee_pw')
    router.push('/auth?role=committee')
  }

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#050505] font-body text-on-background">
      <BackgroundDecor variant="committee" />

      <nav className="iv-nav">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-10">
          <Link href="/" className="shrink-0 font-headline text-[1.5rem] font-black tracking-[-0.05em] text-white md:text-[1.7rem]">
            inVisionU
          </Link>

          <div className="hidden h-full items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-2 py-2 md:flex">
            {NAV.map((n) => {
              const active = pathname.startsWith(n.href)
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex h-full items-center gap-2 rounded-full px-5 text-sm font-headline font-bold transition-all duration-200 ${
                    active
                      ? 'bg-white/[0.06] text-primary-container shadow-[0_12px_32px_rgba(197,254,0,0.08)]'
                      : 'text-on-surface-variant hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>
                    {n.icon}
                  </span>
                  {n.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <span className="chip-muted hidden sm:inline-flex">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
              Комиссия
            </span>
            <button onClick={logout} className="flex items-center gap-2 text-sm font-label font-bold text-on-surface-variant transition-colors hover:text-error-dim">
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>

        <div className="border-t border-white/6 px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto no-scrollbar">
            {NAV.map((n) => {
              const active = pathname.startsWith(n.href)
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-headline font-bold transition-all duration-200 ${
                    active
                      ? 'bg-[#c5fe00] text-[#2a3500] shadow-[0_12px_28px_rgba(197,254,0,0.16)]'
                      : 'bg-white/[0.04] text-white/72 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>
                    {n.icon}
                  </span>
                  {n.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex-1 pt-[124px] md:pt-16">{children}</div>
    </div>
  )
}
