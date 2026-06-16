import { useEconomicData } from './hooks/useEconomicData'
import KPICard from './components/KPICard'
import GDPChart from './components/GDPChart'
import InflationChart from './components/InflationChart'
import ScatterPlot from './components/ScatterPlot'
import DebtTable from './components/DebtTable'
import TradeChart from './components/TradeChart'

function fmt(val, digits = 1) {
  if (val == null || isNaN(val)) return 'N/A'
  return val.toFixed(digits)
}

function fmtGDP(val) {
  if (!val) return 'N/A'
  if (val >= 1e12) return `$${(val / 1e12).toFixed(1)}T`
  return `$${(val / 1e9).toFixed(0)}B`
}

export default function App() {
  const { byCountryYear, countries, years, summary, latestYear, latestData } =
    useEconomicData([], null)

  const avg = summary.g20_averages

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              🌐 Global Economic Health Dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              G20 Macroeconomic Indicators · World Bank Open Data · {latestYear}
            </p>
          </div>
          <span className="badge bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30 text-xs px-3 py-1">
            {latestYear} Data
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* KPI Row */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">
            G20 Averages — Latest Available Year
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard
              title="Avg GDP/Capita"
              value={avg.gdp_per_capita_usd ? `$${(avg.gdp_per_capita_usd / 1000).toFixed(0)}k` : 'N/A'}
              subtitle="G20 mean, USD"
              color="blue"
            />
            <KPICard
              title="Avg Inflation"
              value={fmt(avg.inflation_pct)}
              unit="%"
              subtitle="Consumer Price Index"
              color="amber"
            />
            <KPICard
              title="Avg Unemployment"
              value={fmt(avg.unemployment_pct)}
              unit="%"
              subtitle="% of labor force"
              color="red"
            />
            <KPICard
              title="Avg Public Debt"
              value={fmt(avg.public_debt_pct_gdp)}
              unit="% GDP"
              subtitle="Central government"
              color="purple"
            />
            <KPICard
              title="Avg Trade"
              value={fmt(avg.trade_pct_gdp)}
              unit="% GDP"
              subtitle="Exports + Imports"
              color="cyan"
            />
            <KPICard
              title="Countries"
              value="20"
              subtitle="G20 nations tracked"
              color="green"
            />
          </div>
        </section>

        {/* GDP + Inflation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GDPChart latestData={latestData} latestYear={latestYear} />
          <DebtTable latestData={latestData} latestYear={latestYear} />
        </div>

        {/* Inflation over time */}
        <InflationChart byCountryYear={byCountryYear} countries={countries} years={years} />

        {/* Scatter + Trade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScatterPlot latestData={latestData} latestYear={latestYear} />
          <TradeChart latestData={latestData} latestYear={latestYear} />
        </div>

      </main>

      <footer className="border-t border-gray-800 mt-12 py-6 text-center text-xs text-gray-600">
        Data source: <a href="https://data.worldbank.org" className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">World Bank Open Data</a>
        {' '}· ETL pipeline: Python + SQLite · Frontend: React + Recharts + Tailwind
      </footer>
    </div>
  )
}
