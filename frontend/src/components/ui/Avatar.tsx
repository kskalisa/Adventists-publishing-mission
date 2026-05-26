export function Avatar({ src, label, size = 'md' }: { src?: string; label: string; size?: 'sm' | 'md' }) {
  const className = size === 'sm' ? 'size-7' : 'size-9'

  return src ? (
    <img className={`${className} rounded-full object-cover`} src={src} alt={label} />
  ) : (
    <div className={`grid ${className} place-items-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700`}>{label}</div>
  )
}
