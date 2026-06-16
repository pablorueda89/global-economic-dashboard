export default function KPICard({ title, value, unit, subtitle, color = 'blue', trend }) {
  const colors = {
    blue:   { ring: 'ring-blue-500/30',   text: 'text-blue-400',   bg: 'bg-blue-500/10' },
    green:  { ring: 'ring-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    amber:  { ring: 'ring-amber-500/30',   text: 'text-amber-400',   bg: 'bg-amber-500/10' },
    red:    { ring: 'ring-red-500/30',     text: 'text-red-400',     bg: 'bg-red-500/10' },
    purple: { ring: 'ring-purple-500/30',  text: 'text-purple-400',  bg: 'bg-purple-500/10' },
    cyan:   { ring: 'ring-cyan-500/30',    text: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
  }
  const c = colors[color] || colors.blue

  return (
    <div className={`card ring-1 ${c.ring}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{title}</p>
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-bold ${c.text}`}>{value}</span>
        {unit && <span className="text-sm text-gray-400 mb-1">{unit}</span>}
      </div>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  )
}
