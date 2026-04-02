'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
  as?: keyof JSX.IntrinsicElements
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  threshold = 0.14,
  as = 'div',
}: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -8% 0px',
      }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  const Component = as as any

  return (
    <Component
      ref={ref}
      className={['scroll-reveal', visible ? 'is-visible' : '', className].filter(Boolean).join(' ')}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  )
}
