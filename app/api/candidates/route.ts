import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/supabase'
import { runPipeline } from '@/lib/pipeline'
import { CandidateInput, DuplicateCandidateInfo } from '@/types'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function POST(req: NextRequest) {
  let body: CandidateInput

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON в запросе.' }, { status: 400 })
  }

  if (!body.consent)
    return NextResponse.json({ error: 'Необходимо подтвердить согласие.' }, { status: 400 })
  if (!body.full_name?.trim() || body.full_name.trim().length < 2)
    return NextResponse.json({ error: 'Укажите полное имя.' }, { status: 400 })
  if (!body.email?.includes('@'))
    return NextResponse.json({ error: 'Укажите корректный email.' }, { status: 400 })
  if (typeof body.gpa !== 'number' || Number.isNaN(body.gpa) || body.gpa < 0 || body.gpa > 4)
    return NextResponse.json({ error: 'GPA должен быть в диапазоне от 0 до 4.0.' }, { status: 400 })
  if (!body.essay || body.essay.trim().length < 20)
    return NextResponse.json({ error: 'Эссе слишком короткое.' }, { status: 400 })
  if (!body.interview_text || body.interview_text.trim().length < 20)
    return NextResponse.json({ error: 'Ответы интервью слишком короткие.' }, { status: 400 })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[candidates] Missing Supabase env vars — check .env.local')
    return NextResponse.json(
      { error: 'Ошибка конфигурации сервера: не найдены переменные Supabase в .env.local.' },
      { status: 500 }
    )
  }

  const db = getDb()
  const normalizedEmail = normalizeEmail(body.email)

  const { data: existing, error: existingError } = await db
    .from('candidates')
    .select('id, full_name, email, created_at, status, scoring')
    .eq('email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingError) {
    console.error('[candidates] dedup check error:', JSON.stringify(existingError))
  }

  if (existing) {
    const duplicate: DuplicateCandidateInfo = {
      id: existing.id,
      full_name: existing.full_name,
      email: existing.email,
      created_at: existing.created_at,
      status: existing.status,
      overall: existing.scoring?.overall ?? null,
    }

    return NextResponse.json(
      {
        error: 'Заявка с этим email уже существует. Чтобы избежать дублей, новая запись не была создана.',
        duplicate,
      },
      { status: 409 }
    )
  }

  const { data, error } = await db
    .from('candidates')
    .insert({
      full_name: body.full_name.trim(),
      email: normalizedEmail,
      gpa: body.gpa,
      extracurriculars: body.extracurriculars ?? '',
      achievements: body.achievements ?? '',
      essay: body.essay.trim(),
      interview_text: body.interview_text.trim(),
      consent: true,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[candidates] insert error:', JSON.stringify(error))
    return NextResponse.json(
      { error: `Ошибка базы данных: ${error?.message ?? 'неизвестная ошибка'} (code: ${error?.code ?? '?'})` },
      { status: 500 }
    )
  }

  const candidateId = data.id

  runPipeline({ ...body, email: normalizedEmail })
    .then(async (scoring) => {
      await db.from('candidates').update({ scoring, status: 'scored' }).eq('id', candidateId)
    })
    .catch(async (err) => {
      console.error('[pipeline] error for', candidateId, err)
      await db.from('candidates').update({ status: 'error' }).eq('id', candidateId)
    })

  return NextResponse.json({ success: true, candidate_id: candidateId }, { status: 201 })
}
