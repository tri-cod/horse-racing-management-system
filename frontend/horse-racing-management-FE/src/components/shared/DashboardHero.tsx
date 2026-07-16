interface DashboardHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  initial?: string;
  avatarUrl?: string;
}

export default function DashboardHero({ eyebrow, title, subtitle, initial, avatarUrl }: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden bg-navy px-6 py-9 sm:px-9 sm:py-10">
      {/* Silk-stripe decorative accents — echoes jockey silk swatches used elsewhere in the app */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rotate-[18deg] opacity-[0.09]"
        style={{ background: 'repeating-linear-gradient(45deg, var(--c-gold) 0 10px, transparent 10px 22px)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-12 h-56 w-56 -rotate-[14deg] opacity-[0.05]"
        style={{ background: 'repeating-linear-gradient(45deg, var(--c-text-invert) 0 8px, transparent 8px 18px)' }}
      />

      <div className="relative flex items-center justify-between gap-6">
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-1.5 font-serif text-[28px] font-bold leading-tight text-on-blue sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-md text-sm text-on-blue/65">{subtitle}</p>
        </div>
        {initial && (
          <div className="hidden h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold/40 bg-gold font-serif text-2xl font-bold text-on-gold sm:flex">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-gold via-gold/50 to-transparent" />
    </div>
  );
}