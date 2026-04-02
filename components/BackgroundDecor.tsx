import Image from 'next/image'

type Variant = 'default' | 'landing' | 'committee'

const variantStyles: Record<Variant, { image: string; overlay: string; accent: string }> = {
  default: {
    image: 'object-cover object-top opacity-40 mix-blend-screen scale-[1.08]',
    overlay: 'bg-[linear-gradient(180deg,rgba(5,5,5,0.12)_0%,rgba(5,5,5,0.72)_58%,rgba(5,5,5,0.96)_100%)]',
    accent: 'bg-[radial-gradient(circle_at_top,rgba(197,254,0,0.12),transparent_36%)] opacity-70',
  },
  landing: {
    image: 'object-cover object-top opacity-52 mix-blend-screen scale-[1.04]',
    overlay: 'bg-[linear-gradient(180deg,rgba(5,5,5,0.04)_0%,rgba(5,5,5,0.58)_52%,rgba(5,5,5,0.9)_100%)]',
    accent: 'bg-[radial-gradient(circle_at_50%_16%,rgba(197,254,0,0.13),transparent_32%)] opacity-85',
  },
  committee: {
    image: 'object-cover object-center opacity-30 mix-blend-screen scale-[1.16] saturate-[1.08] contrast-[1.02]',
    overlay: 'bg-[linear-gradient(180deg,rgba(4,4,4,0.2)_0%,rgba(4,4,4,0.82)_60%,rgba(4,4,4,0.96)_100%)]',
    accent: 'bg-[radial-gradient(circle_at_50%_0%,rgba(197,254,0,0.14),transparent_34%)] opacity-60',
  },
}

export default function BackgroundDecor({ variant = 'default' }: { variant?: Variant }) {
  const styles = variantStyles[variant]

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      <Image
        src="/background-elements.png"
        alt=""
        fill
        priority={variant === 'landing'}
        className={styles.image}
      />
      <div className={`absolute inset-0 ${styles.overlay}`} />
      <div className={`absolute inset-0 ${styles.accent}`} />
      <div className="absolute inset-x-0 top-0 h-[280px] bg-[linear-gradient(180deg,rgba(0,0,0,0.5),transparent)]" />
    </div>
  )
}
