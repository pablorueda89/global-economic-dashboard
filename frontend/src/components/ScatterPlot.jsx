import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const COLORS = [
  '#3b82f6','#06b6d4','#8b5cf6','#10b981','#f59e0b',
  '#ef4444','#ec4899','#14b8a6','#f97316','#6366f1',
  '#3b82f6','#06b6d4','#8b5cf6','#10b981','#f59e0b',
  '#ef4444','#ec4899','#14b8a6','#f97316','#6366f1',
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs">
      <p className="font-semibold text-white mb-1">{d.country_name}</p>
      <p className="text-gray-400">GDP/capita: <span className="text-blue-400">${d.x?.toLocaleString()}</span></p>
      <p className="text-gray-400">Unemployment: <span className="text-amber-400">{d.y?.toFixed(1)}%</span></p>
    </div>
  )
}

export default function ScatterPlot({ latestData, latestYear }) {
  const chartData = latestData
    .filter((d) => d.gdp_per_capita_usd && d.unemployment_pct)
    .map((d, i) => ({
      x: d.gdp_per_capita_usd,
      y: d.unemployment_pct,
      country_name: d.country_name,
      color: COLORS[i % COLORS.length],
    }))

  return (
    <div className="card">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-1">
        GDP per Capita vs Unemployment — {latestYear}
      </h2>
      <p className="text-xs text-gray-600 mb-4">Hover each dot for country details</p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            type="number" dataKey="x" name="GDP/capita"
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
            label={{ value: 'GDP per capita (USD)', position: 'insideBottom', offset: -5, fill: '#4b5563', fontSize: 11 }}
          />
          <YAxis
            type="number" dataKey="y" name="Unemployment"
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
            label={{ value: 'Unemployment %', angle: -90, position: 'insideLeft', fill: '#4b5563', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={chartData} r={7}>
            {chartData.map((d, i) => (
              <Cell key={i} fill={d.color} fillOpacity={0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
