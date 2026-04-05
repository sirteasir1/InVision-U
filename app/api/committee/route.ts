import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/supabase'
import { isCommitteeAuthorized } from '@/lib/auth'
import { asStringArray, normalizeScoring } from '@/lib/scoring-normalize'

export async function GET(req: NextRequest) {
  if (!isCommitteeAuthorized(req)) {
    return NextResponse.json({ error: 'Нет доступа.' }, { status: 401 })
  }

  const db = getDb()
  const { data, error } = await db
    .from('candidates')
    .select('id, full_name, email, gpa, status, created_at, scoring')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[committee list]', error)
    return NextResponse.json({ error: 'Не удалось загрузить список заявок.' }, { status: 500 })
  }

  const candidates = (data ?? []).map((r) => {
    const scoring = normalizeScoring(r.scoring)

    return {
      id: r.id,
      full_name: r.full_name,
      email: r.email,
      gpa: r.gpa,
      status: r.status,
      created_at: r.created_at,
      overall: scoring?.overall ?? null,
      confidence: scoring?.confidence ?? null,
      flags: asStringArray(scoring?.flags),
    }
  })

  return NextResponse.json({ candidates })
}
