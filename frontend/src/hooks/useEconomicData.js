import { useMemo } from 'react'
import rawData from '../data/economic_data.json'

export function useEconomicData(selectedYear) {
  const { data, countries, years, summary } = rawData

  const byCountryYear = useMemo(() => {
    const map = {}
    data.forEach((d) => {
      if (!map[d.country_name]) map[d.country_name] = {}
      map[d.country_name][d.year] = d
    })
    return map
  }, [data])

  const latestYear = useMemo(() => Math.max(...years), [years])
  const activeYear = selectedYear ?? latestYear

  const yearData = useMemo(
    () => data.filter((d) => d.year === activeYear),
    [data, activeYear]
  )

  // G20 averages for the selected year
  const yearAverages = useMemo(() => {
    const cols = ['gdp_per_capita_usd', 'inflation_pct', 'unemployment_pct', 'public_debt_pct_gdp', 'trade_pct_gdp']
    const avgs = {}
    cols.forEach((col) => {
      const vals = yearData.map((d) => d[col]).filter((v) => v != null && !isNaN(v))
      avgs[col] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null
    })
    return avgs
  }, [yearData])

  return { data, byCountryYear, countries, years, summary, latestYear, activeYear, yearData, yearAverages }
}
