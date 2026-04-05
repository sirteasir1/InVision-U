import { Suspense } from 'react'
import CandidatesPageClient from './page-client'

function CandidatesPageFallback() {
  return (
    <div className="px-4 md:px-10 pb-28 max-w-[1440px] mx-auto">
      <div className="py-10">
        <div className="panel-soft panel-interactive rounded-[28px] p-16 text-center space-y-3">
          <div className="w-24 h-1.5 shimmer rounded-full mx-auto" />
          <p className="text-on-surface-variant text-sm font-label">Загружаем заявки…</p>
        </div>
      </div>
    </div>
  )
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={<CandidatesPageFallback />}>
      <CandidatesPageClient />
    </Suspense>
  )
}
