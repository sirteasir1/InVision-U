'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

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
    <div className="min-h-screen bg-background text-on-background font-body flex flex-col">
      <nav className="iv-nav">
        <div className="flex items-center justify-between px-6 md:px-10 py-0 max-w-[1440px] mx-auto h-16">
          <Link href="/" className="text-xl font-black text-white tracking-tighter font-headline shrink-0">
            inVision U
          </Link>

          <div className="hidden md:flex items-center h-full gap-1">
            {NAV.map((n) => {
              const active = pathname.startsWith(n.href)
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-2 px-5 h-full text-sm font-headline font-bold transition-colors border-b-2 ${
                    active
                      ? 'text-primary-container border-primary-container'
                      : 'text-on-surface-variant hover:text-white border-transparent'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}
                  >
                    {n.icon}
                  </span>
                  {n.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-4">
            <span className="chip-muted hidden sm:inline-flex">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
              Комиссия
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-on-surface-variant hover:text-error-dim text-sm font-label font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 pt-16">{children}</div>
    </div>
  )
}
