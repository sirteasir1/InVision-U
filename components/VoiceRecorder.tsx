'use client'
import { useRef, useState } from 'react'

interface Props {
  onTranscript: (text: string) => void
  lang?: string
}

type State = 'idle' | 'recording' | 'error'

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
}

export default function VoiceRecorder({ onTranscript, lang = 'ru-RU' }: Props) {
  const [state, setState] = useState<State>('idle')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')
  const recogRef = useRef<SpeechRecognitionInstance | null>(null)
  const accumulatedRef = useRef('')

  function isSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  }

  function start() {
    if (!isSupported()) {
      setError('Голосовой ввод не поддерживается в вашем браузере. Используйте Chrome или Safari.')
      setState('error')
      return
    }

    setError('')
    accumulatedRef.current = ''
    setInterim('')

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interimText = ''
      let finalText = ''

      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i]
        if (result.isFinal) finalText += result[0].transcript + ' '
        else interimText += result[0].transcript
      }

      if (finalText) accumulatedRef.current += finalText
      setInterim(interimText)
    }

    recognition.onerror = (e: { error: string }) => {
      if (e.error === 'not-allowed') setError('Доступ к микрофону запрещён. Разрешите его в браузере.')
      else if (e.error === 'no-speech') setError('Речь не обнаружена. Попробуйте ещё раз.')
      else setError(`Ошибка: ${e.error}`)
      setState('error')
    }

    recognition.onend = () => {
      const final = accumulatedRef.current.trim()
      if (final) onTranscript(final)
      setInterim('')
      setState('idle')
    }

    recognition.start()
    recogRef.current = recognition
    setState('recording')
  }

  function stop() {
    recogRef.current?.stop()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', alignItems: 'flex-start' }}>
      {(state === 'idle' || state === 'error') && (
        <button
          type="button"
          onClick={start}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.58rem 1rem',
            background: '#141414',
            border: '1px solid #222',
            borderRadius: '9999px',
            color: '#a0a0a0',
            fontSize: '0.8rem',
            fontFamily: 'Manrope',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all .2s',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#c5fe00'
            e.currentTarget.style.color = '#c5fe00'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#222'
            e.currentTarget.style.color = '#a0a0a0'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#c5fe00' }}>mic</span>
          Записать голос
        </button>
      )}

      {state === 'recording' && (
        <button
          type="button"
          onClick={stop}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.58rem 1rem',
            background: 'rgba(255,82,82,0.12)',
            border: '1px solid rgba(255,82,82,0.3)',
            borderRadius: '9999px',
            color: '#ff8080',
            fontSize: '0.8rem',
            fontFamily: 'Manrope',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span className="rec-dot" />
          Остановить запись
        </button>
      )}

      {state === 'recording' && interim && (
        <span style={{ fontSize: '0.74rem', color: '#6b6b6b', fontFamily: 'Manrope', fontStyle: 'italic', maxWidth: '280px' }}>
          {interim}…
        </span>
      )}

      {state === 'error' && error && <p style={{ fontSize: '0.74rem', color: '#ff5252', fontFamily: 'Manrope' }}>{error}</p>}
    </div>
  )
}
