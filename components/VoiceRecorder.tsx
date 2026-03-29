'use client'
import { useState, useRef } from 'react'

interface Props {
  onTranscript: (text: string) => void
  lang?: string
}

type State = 'idle' | 'recording' | 'error'

// Extend Window type for SpeechRecognition
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
  const [state, setState]   = useState<State>('idle')
  const [interim, setInterim] = useState('')
  const [error, setError]   = useState('')
  const recogRef            = useRef<SpeechRecognitionInstance | null>(null)
  const accumulatedRef      = useRef('')

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
      let finalText   = ''

      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript + ' '
        } else {
          interimText += result[0].transcript
        }
      }

      if (finalText) accumulatedRef.current += finalText
      setInterim(interimText)
    }

    recognition.onerror = (e: { error: string }) => {
      if (e.error === 'not-allowed') {
        setError('Доступ к микрофону запрещён. Разрешите доступ в настройках браузера.')
      } else if (e.error === 'no-speech') {
        setError('Речь не обнаружена. Попробуйте ещё раз.')
      } else {
        setError(`Ошибка: ${e.error}`)
      }
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
    <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>

        {(state === 'idle' || state === 'error') && (
          <button type="button" onClick={start}
                  style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.5rem 1rem',
                          background:'#141414',border:'1px solid #222',borderRadius:'9999px',
                          color:'#888',fontSize:'0.8rem',fontFamily:'Manrope',fontWeight:600,cursor:'pointer',
                          transition:'all .2s'}}
                  onMouseOver={e=>{e.currentTarget.style.borderColor='#c5fe00';e.currentTarget.style.color='#c5fe00'}}
                  onMouseOut={e=>{e.currentTarget.style.borderColor='#222';e.currentTarget.style.color='#888'}}>
            <span className="material-symbols-outlined" style={{fontSize:'1rem',color:'#c5fe00'}}>mic</span>
            Записать голос
          </button>
        )}

        {state === 'recording' && (
          <button type="button" onClick={stop}
                  style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.5rem 1rem',
                          background:'rgba(255,82,82,0.12)',border:'1px solid rgba(255,82,82,0.3)',borderRadius:'9999px',
                          color:'#ff8080',fontSize:'0.8rem',fontFamily:'Manrope',fontWeight:700,cursor:'pointer',
                          transition:'all .2s'}}>
            <span className="rec-dot" />
            Остановить запись
          </button>
        )}

        {state === 'recording' && interim && (
          <span style={{fontSize:'0.75rem',color:'#555',fontFamily:'Manrope',fontStyle:'italic',maxWidth:'300px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {interim}…
          </span>
        )}
      </div>

      {state === 'error' && error && (
        <p style={{fontSize:'0.75rem',color:'#ff5252',fontFamily:'Manrope'}}>{error}</p>
      )}

      <p style={{fontSize:'0.7rem',color:'#444',fontFamily:'Manrope'}}>
        Говорите — текст появится в поле ниже. Работает в Chrome и Safari.
      </p>
    </div>
  )
}
