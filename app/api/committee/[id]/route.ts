import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/supabase'
import { isCommitteeAuthorized } from '@/lib/auth'
import { normalizeScoring } from '@/lib/scoring-normalize'

type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  if (!isCommitteeAuthorized(req)) {
    return NextResponse.json({ error: 'Нет доступа.' }, { status: 401 })
  }

  const db = getDb()
  const { data, error } = await db.from('candidates').select('*').eq('id', params.id).single()

  if (error || !data) {
    return NextResponse.json({ error: 'Заявка не найдена.' }, { status: 404 })
  }

  return NextResponse.json({ candidate: { ...data, scoring: normalizeScoring(data.scoring) } })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isCommitteeAuthorized(req)) {
    return NextResponse.json({ error: 'Нет доступа.' }, { status: 401 })
  }

  const db = getDb()
  const { data, error } = await db
    .from('candidates')
    .delete()
    .eq('id', params.id)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[committee delete]', error)
    return NextResponse.json({ error: 'Не удалось удалить заявку.' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Заявка уже удалена или не найдена.' }, { status: 404 })
  }

  return NextResponse.json({ success: true, deleted_id: data.id })
}
