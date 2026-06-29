export function Logo({
  compact = false,
  size = 'md',
  tone = 'light',
}: {
  compact?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tone?: 'light' | 'dark'
}) {
  const sizes = {
    sm: 'size-10',
    md: 'size-12',
    lg: 'size-16',
    xl: 'size-20',
  }
  const textColor = tone === 'dark' ? 'text-[#0d2b49]' : 'text-slate-100'

  return (
    <div className="flex items-center gap-3">
      <img
        className={`${sizes[size]} shrink-0 rounded-md bg-white object-contain p-1.5 shadow-sm ring-1 ring-slate-200/70`}
        src="/adventist-logo.svg"
        alt="Seventh-day Adventist logo"
      />
      {!compact && <p className={`font-semibold leading-tight ${textColor}`}>Seventh-day Adventist Publishing</p>}
    </div>
  )
}
