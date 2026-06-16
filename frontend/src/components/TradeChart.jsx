import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'

export default function TradeChart({ latestData, latestYear }) {
  const chartData = latestData
    .filter((d) => d.trade_pct_gdp)
    .sort((a, b) => b.trade_pct_gdp - a.trade_pct_gdp)
    .map((d) => ({ name: d.country_name.replace('United ', 'U. '), value: d.trade_pct_gdp }))

  const avg = chartData.reduce((s, d) => s + d.value, 0) / chartData.length

  return (
    <div className="card">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-1">
        Trade Openness (% of GDP) — {latestYear}
      </h2>
      <p className="text-xs text-gray-600 mb-4">
        G20 Average: <span className="text-cyan-400 font-semibold">{avg.toFixed(1)}%</span>
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
            angle={-45} textAnchor="end" interval={0}
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <ReferenceLine y={avg} stroke="#06b6d4" strokeDasharray="4 4" strokeWidth={1.5} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            formatter={(v) => [`${v.toFixed(1)}%`, 'Trade / GDP']}
            labelStyle={{ color: '#f9fafb', fontWeight: 600 }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((d, i) => (
              <Cell key={i} fill={d.value >= avg ? '#06b6d4' : '#1d4ed8'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
