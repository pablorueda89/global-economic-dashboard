export default function DebtTable({ latestData, latestYear }) {
  const rows = latestData
    .filter((d) => d.public_debt_pct_gdp)
    .sort((a, b) => b.public_debt_pct_gdp - a.public_debt_pct_gdp)

  const getColor = (v) => {
    if (v >= 100) return 'text-red-400'
    if (v >= 60)  return 'text-amber-400'
    return 'text-emerald-400'
  }

  const getBar = (v) => {
    const w = Math.min(v, 200) / 2
    const color = v >= 100 ? '#ef4444' : v >= 60 ? '#f59e0b' : '#10b981'
    return (
      <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
        <div className="h-1.5 rounded-full" style={{ width: `${w}%`, background: color }} />
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Public Debt (% of GDP) — {latestYear}
      </h2>
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {rows.map((d, i) => (
          <div key={d.country_name} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-5 text-right">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-200 truncate">{d.country_name}</span>
                <span className={`text-sm font-semibold ml-2 ${getColor(d.public_debt_pct_gdp)}`}>
                  {d.public_debt_pct_gdp.toFixed(1)}%
                </span>
              </div>
              {getBar(d.public_debt_pct_gdp)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4 pt-3 border-t border-gray-800 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> {'< 60%'}</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 60–100%</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> {'>100%'}</span>
      </div>
    </div>
  )
}
