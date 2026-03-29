import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'inVision U — Портал отбора',
  description: 'AI-ассистированный отбор: мы ищем будущих лидеров, а не только оценки.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
