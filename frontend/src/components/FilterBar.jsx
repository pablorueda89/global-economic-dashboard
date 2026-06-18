const METRICS = [
  { key: 'gdp',          label: 'GDP',         color: 'blue'   },
  { key: 'inflation',    label: 'Inflation',   color: 'amber'  },
  { key: 'unemployment', label: 'Unemployment',color: 'red'    },
  { key: 'debt',         label: 'Public Debt', color: 'purple' },
  { key: 'trade',        label: 'Trade',       color: 'cyan'   },
  { key: 'scatter',      label: 'GDP vs Unemp',color: 'green'  },
]

const COLORS = {
  blue:   { active: 'bg-blue-500/20 text-blue-400 ring-blue-500/40',   inactive: 'bg-gray-800 text-gray-500 hover:text-gray-300' },
  amber:  { active: 'bg-amber-500/20 text-amber-400 ring-amber-500/40', inactive: 'bg-gray-800 text-gray-500 hover:text-gray-300' },
  red:    { active: 'bg-red-500/20 text-red-400 ring-red-500/40',       inactive: 'bg-gray-800 text-gray-500 hover:text-gray-300' },
  purple: { active: 'bg-purple-500/20 text-purple-400 ring-purple-500/40', inactive: 'bg-gray-800 text-gray-500 hover:text-gray-300' },
  cyan:   { active: 'bg-cyan-500/20 text-cyan-400 ring-cyan-500/40',   inactive: 'bg-gray-800 text-gray-500 hover:text-gray-300' },
  green:  { active: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/40', inactive: 'bg-gray-800 text-gray-500 hover:text-gray-300' },
}

export default function FilterBar({ years, selectedYear, onYearChange, activeMetrics, onMetricToggle }) {
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)

  return (
    <div className="card flex flex-col md:flex-row gap-6 items-start md:items-center">
      {/* Year slider */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Year</span>
          <span className="text-sm font-bold text-white bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full">
            {selectedYear}
          </span>
        </div>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((selectedYear - minYear) / (maxYear - minYear)) * 100}%, #1f2937 ${((selectedYear - minYear) / (maxYear - minYear)) * 100}%, #1f2937 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{minYear}</span>
          <span>{maxYear}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-12 bg-gray-800" />

      {/* Metric toggles */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Charts</p>
        <div className="flex flex-wrap gap-2">
          {METRICS.map((m) => {
            const active = activeMetrics.includes(m.key)
            const c = COLORS[m.color]
            return (
              <button
                key={m.key}
                onClick={() => onMetricToggle(m.key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium ring-1 transition-all ${active ? c.active + ' ring-1' : c.inactive + ' ring-gray-700'}`}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
