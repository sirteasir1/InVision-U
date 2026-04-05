'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export interface FormData {
  // Step 1 — Personal
  full_name: string
  email: string 
  gpa: string
  // Step 2 — Background
  extracurriculars: string
  achievements: string
  // Step 3 — Essay
  essay: string
  // Step 4 — Interview
  interview_text: string
  consent: boolean
}

const EMPTY: FormData = {
  full_name: '', email: '', gpa: '',
  extracurriculars: '', achievements: '',
  essay: '',
  interview_text: '', consent: false,
}

interface FormCtx {
  form: FormData
  set: (field: keyof FormData, value: string | boolean) => void
  reset: () => void
}

const Ctx = createContext<FormCtx | null>(null)

export function FormProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<FormData>(EMPTY)

  function set(field: keyof FormData, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function reset() { setForm(EMPTY) }

  return <Ctx.Provider value={{ form, set, reset }}>{children}</Ctx.Provider>
}

export function useForm() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useForm must be used inside FormProvider')
  return ctx
}
