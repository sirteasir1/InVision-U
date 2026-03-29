import { FormProvider } from '@/context/form-context'
export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return <FormProvider>{children}</FormProvider>
}
