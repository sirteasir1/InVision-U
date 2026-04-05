'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { id: 'values', label: 'Ценности' },
  { id: 'how', label: 'Этапы' },
  { id: 'apply', label: 'Стипендии' },
] as const

export default function LandingNav() {
  const [active, setActive] = useState<(typeof NAV_ITEMS)[number]['id']>('values')

  useEffect(() => {
    const updateActive = () => {
      const offset = window.scrollY + 180
      let current: (typeof NAV_ITEMS)[number]['id'] = NAV_ITEMS[0].id

      for (const item of NAV_ITEMS) {
        const section = document.getElementById(item.id)
        if (section && offset >= section.offsetTop) {
          current = item.id
        }
      }

      setActive(current)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)

    return () => {
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [])

  return (
    <nav className="iv-nav">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="font-headline font-black text-[1.75rem] tracking-[-0.05em] leading-none text-white transition-transform duration-200 hover:scale-[1.01]">
          inVisionU
        </Link>

        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/6 bg-white/[0.03] p-1 text-[14px] font-headline font-bold text-white/60">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={[
                  'rounded-full px-4 py-2 transition-all duration-200',
                  isActive
                    ? 'bg-[#c5fe00] text-[#253000] shadow-[0_10px_30px_rgba(197,254,0,0.18)]'
                    : 'hover:bg-white/[0.06] hover:text-white',
                ].join(' ')}
              >
                {item.label}
              </a>
            )
          })}
        </div>

        <Link href="/auth?role=candidate" className="btn-lime !px-6 !py-3 !text-sm">
          Подать заявку
        </Link>
      </div>
    </nav>
  )
}
