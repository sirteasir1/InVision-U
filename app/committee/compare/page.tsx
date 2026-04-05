import { Suspense } from 'react'
import ComparePageClient from './page-client'

function ComparePageFallback() {
  return (
    <div className="px-4 md:px-10 pb-16 max-w-[1500px] mx-auto">
      <div className="py-10">
        <div className="panel-soft rounded-[28px] p-16 text-center space-y-3">
          <div className="w-24 h-1.5 shimmer rounded-full mx-auto" />
          <p className="text-on-surface-variant text-sm font-label">Загружаем сравнение…</p>
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<ComparePageFallback />}>
      <ComparePageClient />
    </Suspense>
  )
}
