import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const COLORS = [
  '#3b82f6','#06b6d4','#8b5cf6','#10b981','#f59e0b',
  '#ef4444','#ec4899','#14b8a6','#f97316','#6366f1',
]

function fmt(val) {
  if (!val) return 'N/A'
  if (val >= 1e12) return `$${(val / 1e12).toFixed(1)}T`
  if (val >= 1e9)  return `$${(val / 1e9).toFixed(0)}B`
  return `$${val.toFixed(0)}`
}

export default function GDPChart({ latestData, latestYear }) {
  const chartData = latestData
    .filter((d) => d.gdp_usd)
    .sort((a, b) => b.gdp_usd - a.gdp_usd)
    .slice(0, 10)
    .map((d) => ({ name: d.country_name, gdp: d.gdp_usd }))

  return (
    <div className="card">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Top 10 G20 Economies by GDP — {latestYear}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
          <XAxis type="number" tickFormatter={fmt} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#d1d5db', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
          <Tooltip
            formatter={(v) => [fmt(v), 'GDP']}
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#f9fafb', fontWeight: 600 }}
            itemStyle={{ color: '#93c5fd' }}
          />
          <Bar dataKey="gdp" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
