import { useMemo } from 'react'
import rawData from '../data/economic_data.json'

export function useEconomicData(selectedCountries, selectedYear) {
  const { data, countries, years, summary } = rawData

  const filtered = useMemo(() => {
    return data.filter(
      (d) =>
        (selectedCountries.length === 0 || selectedCountries.includes(d.country_name)) &&
        (selectedYear === null || d.year === selectedYear)
    )
  }, [data, selectedCountries, selectedYear])

  const byCountryYear = useMemo(() => {
    const map = {}
    data.forEach((d) => {
      if (!map[d.country_name]) map[d.country_name] = {}
      map[d.country_name][d.year] = d
    })
    return map
  }, [data])

  const latestYear = useMemo(() => Math.max(...years), [years])

  const latestData = useMemo(
    () => data.filter((d) => d.year === latestYear),
    [data, latestYear]
  )

  return { data, filtered, byCountryYear, countries, years, summary, latestYear, latestData }
}
