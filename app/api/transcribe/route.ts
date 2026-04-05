import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { toFile } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio') as File | null

    if (!audio) {
      return NextResponse.json({ error: 'Аудиофайл не найден.' }, { status: 400 })
    }

    const arrayBuffer = await audio.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const file = await toFile(buffer, 'recording.webm', { type: audio.type || 'audio/webm' })

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'ru',
    })

    return NextResponse.json({ text: transcription.text })
  } catch (err: unknown) {
    console.error('[transcribe] error:', err)
    const message = err instanceof Error ? err.message : 'Не удалось распознать аудио.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
