import { useState } from 'react'
import { useEconomicData } from './hooks/useEconomicData'
import FilterBar from './components/FilterBar'
import KPICard from './components/KPICard'
import GDPChart from './components/GDPChart'
import InflationChart from './components/InflationChart'
import ScatterPlot from './components/ScatterPlot'
import DebtTable from './components/DebtTable'
import TradeChart from './components/TradeChart'

const ALL_METRICS = ['gdp', 'inflation', 'unemployment', 'debt', 'trade', 'scatter']

function fmt(val, digits = 1) {
  if (val == null || isNaN(val)) return 'N/A'
  return val.toFixed(digits)
}

export default function App() {
  const { byCountryYear, countries, years, latestYear, activeYear, yearData, yearAverages } =
    useEconomicData(null)

  const [selectedYear, setSelectedYear] = useState(latestYear)
  const [activeMetrics, setActiveMetrics] = useState(ALL_METRICS)

  const { yearData: filteredYearData, yearAverages: filteredAverages } = useEconomicData(selectedYear)

  const toggleMetric = (key) =>
    setActiveMetrics((prev) =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter((k) => k !== key) : prev
        : [...prev, key]
    )

  const show = (key) => activeMetrics.includes(key)

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Global Economic Health Dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              G20 Macroeconomic Indicators · World Bank Open Data
            </p>
          </div>
          <span className="badge bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30 text-xs px-3 py-1">
            {selectedYear}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Filter Bar */}
        <FilterBar
          years={years}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          activeMetrics={activeMetrics}
          onMetricToggle={toggleMetric}
        />

        {/* KPI Row — always visible, reacts to year */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">
            G20 Averages — {selectedYear}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard
              title="Avg GDP/Capita"
              value={filteredAverages.gdp_per_capita_usd ? `$${(filteredAverages.gdp_per_capita_usd / 1000).toFixed(0)}k` : 'N/A'}
              subtitle="G20 mean, USD"
              color="blue"
            />
            <KPICard
              title="Avg Inflation"
              value={fmt(filteredAverages.inflation_pct)}
              unit="%"
              subtitle="Consumer Price Index"
              color="amber"
            />
            <KPICard
              title="Avg Unemployment"
              value={fmt(filteredAverages.unemployment_pct)}
              unit="%"
              subtitle="% of labor force"
              color="red"
            />
            <KPICard
              title="Avg Public Debt"
              value={fmt(filteredAverages.public_debt_pct_gdp)}
              unit="% GDP"
              subtitle="Central government"
              color="purple"
            />
            <KPICard
              title="Avg Trade"
              value={fmt(filteredAverages.trade_pct_gdp)}
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

        {/* Charts — controlled by metric filter */}
        {(show('gdp') || show('debt')) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {show('gdp')  && <GDPChart latestData={filteredYearData} latestYear={selectedYear} />}
            {show('debt') && <DebtTable latestData={filteredYearData} latestYear={selectedYear} />}
          </div>
        )}

        {show('inflation') && (
          <InflationChart byCountryYear={byCountryYear} countries={countries} years={years} highlightYear={selectedYear} />
        )}

        {(show('scatter') || show('trade')) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {show('scatter') && <ScatterPlot latestData={filteredYearData} latestYear={selectedYear} />}
            {show('trade')   && <TradeChart  latestData={filteredYearData} latestYear={selectedYear} />}
          </div>
        )}

        {activeMetrics.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-sm">Select at least one chart from the filter above.</p>
          </div>
        )}

      </main>

      <footer className="border-t border-gray-800 mt-12 py-6 text-center text-xs text-gray-600">
        Data source:{' '}
        <a href="https://data.worldbank.org" className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">
          World Bank Open Data
        </a>
        {' '}· ETL pipeline: Python + SQLite · Frontend: React + Recharts + Tailwind
      </footer>
    </div>
  )
}
