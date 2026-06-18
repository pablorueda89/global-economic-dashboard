import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const PALETTE = [
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#ec4899','#f97316','#14b8a6','#6366f1',
]

const DEFAULT_COUNTRIES = ['United States', 'Germany', 'Brazil', 'China', 'Japan']

export default function InflationChart({ byCountryYear, countries, years, highlightYear }) {
  const [selected, setSelected] = useState(DEFAULT_COUNTRIES)

  const toggle = (c) =>
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : prev.length < 8 ? [...prev, c] : prev
    )

  const chartData = years.map((y) => {
    const row = { year: y }
    selected.forEach((c) => {
      row[c] = byCountryYear[c]?.[y]?.inflation_pct ?? null
    })
    return row
  })

  return (
    <div className="card">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">
        Inflation Rate (%) — 2000–2023
      </h2>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {countries.map((c, i) => {
          const active = selected.includes(c)
          const color = PALETTE[selected.indexOf(c) % PALETTE.length]
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={`badge text-xs cursor-pointer transition-all ${
                active
                  ? 'text-white ring-1'
                  : 'bg-gray-800 text-gray-500 hover:text-gray-300'
              }`}
              style={active ? { background: color + '33', color, borderColor: color } : {}}
            >
              {c}
            </button>
          )
        })}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <ReferenceLine y={0} stroke="#374151" strokeDasharray="4 4" />
          {highlightYear && (
            <ReferenceLine x={highlightYear} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1.5}
              label={{ value: highlightYear, position: 'top', fill: '#3b82f6', fontSize: 10 }} />
          )}
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#f9fafb', fontWeight: 600 }}
            formatter={(v) => v !== null ? [`${v?.toFixed(1)}%`] : ['N/A']}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
          {selected.map((c, i) => (
            <Line
              key={c}
              type="monotone"
              dataKey={c}
              stroke={PALETTE[i % PALETTE.length]}
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
