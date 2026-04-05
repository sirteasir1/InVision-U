import Image from 'next/image'
import Link from 'next/link'
import BackgroundDecor from '@/components/BackgroundDecor'
import LandingNav from '@/components/LandingNav'
import ScrollReveal from '@/components/ui/ScrollReveal'

const values = [
  {
    id: 'motivation',
    title: 'Motivation',
    text: 'Истинное стремление менять мир вокруг себя — наш главный критерий отбора.',
    icon: 'bolt',
    type: 'image' as const,
  },
  {
    id: 'leadership',
    title: 'Leadership',
    text: 'Способность вести за собой и брать ответственность за результат в условиях неопределённости.',
    icon: 'workspace_premium',
    type: 'lime' as const,
  },
  {
    id: 'growth',
    title: 'Growth',
    text: 'Постоянное развитие и готовность к обучению в течение всей жизни — залог успеха в новой экономике.',
    icon: 'trending_up',
    type: 'progress' as const,
  },
  {
    id: 'fairness',
    title: 'Fairness',
    text: 'AI помогает расширить видимость. Каждый кандидат получает равный шанс, основанный исключительно на его таланте.',
    icon: 'balance',
    type: 'dark' as const,
  },
] as const

const steps = [
  { num: '01', title: 'Подать заявку', text: 'Заполните базовую анкету и расскажите о своих достижениях и целях.', icon: 'stylus_note' },
  { num: '02', title: 'Согласие', text: 'Пройдите подтверждение данных и согласие на AI-поддержку.', icon: 'verified_user' },
  { num: '03', title: 'Заявка', text: 'Напишите эссе и пройдите интервью, чтобы раскрыть ваш путь.', icon: 'neurology' },
  { num: '04', title: 'Решение', text: 'Комиссия изучает материалы и принимает итоговое решение.', icon: 'forum' },
] as const

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <BackgroundDecor variant="landing" />
      <LandingNav />

      <main className="relative z-10 overflow-x-hidden pt-24">
        <section className="relative flex min-h-[900px] flex-col items-center justify-center px-4 text-center md:px-6">
          <ScrollReveal className="relative z-10 mx-auto max-w-5xl">
            <span className="mb-8 inline-flex items-center rounded-full bg-[#191919] px-4 py-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.14em] text-[#c5fe00]">
              Powered by inDrive AI
            </span>

            <h1 className="mx-auto max-w-[1050px] font-headline text-[3.2rem] font-black leading-[0.9] tracking-[-0.06em] text-[#f6f6f1] md:text-[6rem]">
              Мы ищем будущих <span className="text-glow italic text-[#c5fe00]">лидеров</span>, а не только оценки
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-[1rem] font-medium leading-relaxed text-white/64 md:text-[1.35rem]">
              Подайте заявку на грантовое образование с AI-ассистированным отбором, ориентированным на потенциал, мотивацию и социальную миссию.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row">
              <Link href="/auth?role=candidate" className="btn-lime !w-full !px-10 !py-5 !text-[1rem] md:!w-auto">
                Подать заявку
              </Link>
              <Link href="/auth?role=committee" className="btn-ghost !w-full !bg-[#1f1f1f] !px-10 !py-5 !text-[1rem] md:!w-auto">
                Узнать больше
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120} className="relative z-10 mx-auto mt-16 w-full max-w-6xl px-2 md:px-4">
            <div className="group relative aspect-[21/9] overflow-hidden rounded-[34px] bg-[#131313] shadow-[0_30px_80px_rgba(0,0,0,0.42)]">
              <Image src="/landing/hero-graphic.png" alt="Hero visual" fill priority className="object-cover opacity-70 transition-transform duration-1000 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 z-10 text-left md:bottom-8 md:left-8">
                <p className="font-headline text-[2rem] font-black leading-none tracking-[-0.06em] text-[#c5fe00] italic md:text-[2.6rem]">inVision U</p>
                <p className="mt-1 text-xs font-medium text-white/56 md:text-sm">Admissions Intelligence Platform v2.0</p>
              </div>

              <div className="absolute bottom-5 right-5 z-10 hidden -space-x-3 md:bottom-8 md:right-8 md:flex">
                {['psychology', 'auto_awesome', 'monitoring'].map((icon) => (
                  <div key={icon} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f1f1f] text-white/80">
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section id="values" className="mx-auto max-w-[1440px] scroll-mt-32 px-4 py-28 md:px-6">
          <ScrollReveal className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-baseline">
            <h2 className="font-headline text-[2.8rem] font-black tracking-[-0.05em] text-[#f6f6f1] md:text-[4.6rem]">Наши ценности</h2>
            <p className="max-w-md text-base leading-8 text-white/58 md:text-lg">
              Мы пересматриваем стандарты образования, фокусируясь на человеческом капитале, а не на бюрократии.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
            {values.map((item) => {
              const colSpan = item.id === 'motivation' ? 'md:col-span-7' : item.id === 'leadership' ? 'md:col-span-5' : 'md:col-span-6'
              const delay = item.id === 'motivation' ? 0 : item.id === 'leadership' ? 90 : item.id === 'growth' ? 140 : 200

              return (
                <ScrollReveal
                  key={item.id}
                  delay={delay}
                  className={[
                    'group relative min-h-[260px] overflow-hidden rounded-[30px] p-8 hover-lift md:min-h-[310px] md:p-10',
                    colSpan,
                    item.type === 'lime' ? 'bg-[#c5fe00] text-[#2a3500]' : 'panel-soft text-white',
                  ].join(' ')}
                >
                  {item.type === 'image' && (
                    <>
                      <div className="pointer-events-none absolute inset-y-0 right-0 w-[48%] opacity-30">
                        <Image src="/landing/chip.png" alt="Chip" fill className="object-cover" />
                      </div>
                      <div className="absolute inset-y-0 right-0 w-[54%] bg-gradient-to-l from-transparent via-[#131313]/50 to-[#131313]" />
                    </>
                  )}

                  {item.type === 'dark' && (
                    <div className="absolute bottom-[-75px] right-[-65px] h-[220px] w-[220px] rounded-full border-[18px] border-[#c5fe00]/12" />
                  )}

                  <div className="relative z-10 flex h-full max-w-[360px] flex-col">
                    <span className={`material-symbols-outlined mb-6 text-[34px] ${item.type === 'lime' ? 'text-[#2f3b00]' : 'text-[#c5fe00]'}`}>
                      {item.icon}
                    </span>
                    <h3 className={`font-headline text-[2.05rem] font-black tracking-[-0.05em] md:text-[2.55rem] ${item.type === 'lime' ? 'text-[#2a3500]' : 'text-[#f8f8f4]'}`}>
                      {item.title}
                    </h3>
                    <p className={`mt-4 text-[0.95rem] leading-7 md:text-[1rem] ${item.type === 'lime' ? 'text-[#445000]' : 'text-white/58'}`}>
                      {item.text}
                    </p>

                    <div className="mt-auto pt-8">
                      {item.type === 'progress' ? (
                        <div className="max-w-[240px] overflow-hidden rounded-full bg-white/8">
                          <div className="h-1.5 w-[72%] rounded-full bg-[#c5fe00]" />
                        </div>
                      ) : item.type === 'image' ? (
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-[#c5fe00]">
                          Читать далее <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </section>

        <section id="how" className="scroll-mt-32 bg-[#030303]/80 px-4 py-24 md:px-6 md:py-28">
          <div className="mx-auto max-w-[1440px] text-center">
            <ScrollReveal>
              <h2 className="font-headline text-[3rem] font-black tracking-[-0.05em] text-[#f6f6f1] md:text-[4.6rem]">Как это работает</h2>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <p className="mx-auto mt-4 max-w-[680px] text-[0.96rem] leading-7 text-white/56 md:text-[1rem]">
                Прозрачный процесс отбора с 4 понятными этапами, усиленный искусственным интеллектом.
              </p>
            </ScrollReveal>

            <div className="mt-14 grid grid-cols-1 gap-4 text-left sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
              {steps.map((step) => (
                <ScrollReveal key={step.num} delay={Number(step.num) * 70} className="panel-soft min-h-[250px] rounded-[28px] px-7 py-8 hover-lift md:px-8 md:py-9">
                  <div className="font-headline text-[3rem] font-black leading-none tracking-[-0.05em] text-[#6f8307]">{step.num}</div>
                  <h3 className="mt-7 font-headline text-[1.65rem] font-black tracking-[-0.04em] text-white">{step.title}</h3>
                  <p className="mt-4 max-w-[220px] text-[0.93rem] leading-7 text-white/54">{step.text}</p>
                  <span className="material-symbols-outlined mt-8 text-[20px] text-[#c5fe00]">{step.icon}</span>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section id="apply" className="scroll-mt-32 bg-[#050505]/85 px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[1440px]">
            <ScrollReveal className="panel-soft relative overflow-hidden rounded-[34px] px-6 py-14 text-center md:px-10 md:py-16">
              <Image src="/landing/green-orb.png" alt="Green background" fill className="object-cover opacity-[0.28] mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/55" />
              <div className="relative z-10 mx-auto max-w-4xl">
                <h2 className="font-headline text-[2.8rem] font-black leading-[0.92] tracking-[-0.05em] text-[#f6f6f1] md:text-[4.2rem]">
                  Готовы изменить <span className="italic text-[#c5fe00]">своё</span> будущее?
                </h2>
                <p className="mx-auto mt-5 max-w-[660px] text-[0.95rem] leading-8 text-white/60 md:text-[1rem]">
                  Приём заявок открыт. Начните свой путь к образованию мирового уровня уже сегодня.
                </p>
                <Link href="/auth?role=candidate" className="btn-lime !mt-8 !inline-flex !px-10 !py-5 !text-[1rem]">
                  Подать заявку
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="bg-[#050505] px-4 pb-7 pt-10 md:px-6 md:pt-12">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 md:grid-cols-[1.15fr_0.7fr_0.7fr] md:gap-8">
          <div>
            <p className="font-headline text-[1.95rem] font-black leading-none tracking-[-0.05em]">inVisionU</p>
            <p className="mt-5 max-w-[320px] text-[0.94rem] leading-7 text-white/42">
              Инициатива inDrive по поддержке талантов и созданию справедливого будущего через доступ к мировому образованию.
            </p>
            <div className="mt-7 flex items-center gap-3">
              {['share', 'language'].map((icon) => (
                <div key={icon} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b1b1b] text-white/70 transition-all duration-300 hover:bg-[#242424] hover:text-white">
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-5 text-sm font-headline font-bold text-white">Навигация</p>
            <div className="space-y-3 text-sm text-white/48">
              {['Ценности', 'Стипендии', 'Этапы отбора', 'Сообщество'].map((label) => (
                <a key={label} href="#" className="block transition-colors hover:text-white">
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-5 text-sm font-headline font-bold text-white">Правовая информация</p>
            <div className="space-y-3 text-sm text-white/48">
              {['Политика конфиденциальности', 'Условия использования', 'AI Ethics'].map((label) => (
                <a key={label} href="#" className="block transition-colors hover:text-white">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-[1440px] flex-col justify-between gap-4 pt-5 text-[12px] text-white/34 md:flex-row md:items-center">
          <p>© 2026 inVision U by inDrive. Все права защищены.</p>
          <p>Создано для тех, кто меняет будущее.</p>
        </div>
      </footer>
    </div>
  )
}
