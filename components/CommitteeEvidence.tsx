import { EvidenceItem } from '@/types'

function criterionLabel(criterion: EvidenceItem['criterion']) {
  if (criterion === 'motivation') return 'Мотивация'
  if (criterion === 'leadership') return 'Лидерство'
  if (criterion === 'experience') return 'Опыт'
  return 'Рост'
}

function sourceLabel(source: EvidenceItem['source']) {
  if (source === 'essay') return 'Эссе'
  if (source === 'interview') return 'Интервью'
  if (source === 'background') return 'Анкета'
  if (source === 'achievements') return 'Достижения'
  return 'Несколько источников'
}

export default function CommitteeEvidence({
  evidence,
  compact = false,
}: {
  evidence: EvidenceItem[]
  compact?: boolean
}) {
  if (!evidence.length) {
    return (
      <div className="rounded-[28px] bg-surface-container-high/70 p-6 text-sm leading-relaxed text-on-surface-variant">
        Для этой заявки пока нет достаточно надёжных цитат из ответов кандидата. Лучше опираться на текст заявки и ручной просмотр.
      </div>
    )
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {evidence.map((item, index) => (
        <article
          key={`${item.criterion}-${index}`}
          className={`rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,24,24,0.98),rgba(16,16,16,0.98))] ${compact ? 'p-5' : 'p-6 md:p-7'} shadow-[0_20px_50px_rgba(0,0,0,0.32)]`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip-lime">{criterionLabel(item.criterion)}</span>
            <span className="chip-muted">{sourceLabel(item.source)}</span>
            {typeof item.score === 'number' && <span className="chip-muted">Оценка {item.score.toFixed(1)}/10</span>}
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-[11px] font-label font-bold uppercase tracking-[0.18em] text-primary-container">Цитата кандидата</p>
            <div className="rounded-[24px] bg-black/20 px-5 py-5">
              <p className="text-[1rem] leading-8 text-white/92">“{item.quote}”</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-[132px_1fr] gap-4 md:gap-5 items-start">
            <p className="text-[11px] font-label font-bold uppercase tracking-[0.18em] text-on-surface-variant md:pt-1">Почему это важно</p>
            <p className="text-sm md:text-[0.98rem] leading-8 text-on-surface-variant">{item.reason}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
