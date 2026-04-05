import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/supabase'
import { isCommitteeAuthorized } from '@/lib/auth'
import { normalizeScoring } from '@/lib/scoring-normalize'

export async function GET(req: NextRequest) {
  if (!isCommitteeAuthorized(req)) {
    return NextResponse.json({ error: 'Нет доступа.' }, { status: 401 })
  }

  const ids = (req.nextUrl.searchParams.get('ids') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (ids.length !== 2) {
    return NextResponse.json({ error: 'Для compare view нужно выбрать ровно 2 кандидатов.' }, { status: 400 })
  }

  const db = getDb()
  const { data, error } = await db.from('candidates').select('*').in('id', ids)

  if (error) {
    console.error('[committee compare]', error)
    return NextResponse.json({ error: 'Не удалось загрузить кандидатов для сравнения.' }, { status: 500 })
  }

  const ordered = ids
    .map((id) => (data ?? []).find((candidate) => candidate.id === id))
    .filter(Boolean)
    .map((candidate) => ({ ...candidate, scoring: normalizeScoring(candidate.scoring) }))

  if (ordered.length !== 2) {
    return NextResponse.json({ error: 'Не удалось найти обе заявки для сравнения.' }, { status: 404 })
  }

  return NextResponse.json({ candidates: ordered })
}
