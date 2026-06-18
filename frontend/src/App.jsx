import { useState, useCallback } from 'react'
import rawData from './data/economic_data.json'

const D = rawData
const POS = '#2E7D54'
const NEG = '#B0463A'
const INK = '#6E6151'
const SERIES = ['#1F4A40','#C6A24A','#9A5A33','#3F6B5C','#8B4A3C','#46587C','#6E5286','#A8893E']

function fmtBig(v) {
  if (v == null) return '—'
  const a = Math.abs(v)
  if (a >= 1e12) return '$' + (v / 1e12).toFixed(1) + 'T'
  if (a >= 1e9)  return '$' + (v / 1e9).toFixed(0) + 'B'
  if (a >= 1e6)  return '$' + (v / 1e6).toFixed(0) + 'M'
  return '$' + Math.round(v)
}
function fmtPct(v, d = 1) {
  if (v == null || isNaN(v)) return '—'
  return v.toFixed(d) + '%'
}
function avg(arr, col) {
  const v = arr.map(d => d[col]).filter(x => x != null && !isNaN(x))
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}

const years = D.years
const minY = Math.min(...years)
const maxY = Math.max(...years)

export default function App() {
  const [selectedYear, setSelectedYear] = useState(2022)
  const [active, setActive] = useState({ gdp: true, debt: true, inflation: true, scatter: true, trade: true })
  const [inflSel, setInflSel] = useState(['United States', 'Germany', 'Brazil', 'China', 'Japan'])
  const [tip, setTip] = useState(null)

  const tipAt = useCallback((e, title, rows) => setTip({ x: e.clientX, y: e.clientY, title, rows }), [])
  const tipOff = useCallback(() => setTip(null), [])

  const toggle = (k) => setActive(a => ({ ...a, [k]: !a[k] }))
  const toggleCountry = (c) => setInflSel(sel => {
    if (sel.includes(c) && sel.length <= 1) return sel
    return sel.includes(c) ? sel.filter(x => x !== c) : sel.length < 8 ? [...sel, c] : sel
  })

  const cur = D.data.filter(d => d.year === selectedYear)
  const prev = D.data.filter(d => d.year === selectedYear - 1)
  const prevYear = selectedYear - 1

  const sliderPct = ((selectedYear - minY) / (maxY - minY)) * 100
  const sliderBg = `linear-gradient(90deg,#15362E 0%,#15362E ${sliderPct}%,#D8D2C2 ${sliderPct}%,#D8D2C2 100%)`

  // KPIs
  const mkKpi = (label, col, fmt, unit, sub, higherGood) => {
    const a = avg(cur, col), b = avg(prev, col)
    let delta = '—', deltaColor = '#A8A192'
    if (a != null && b != null && b !== 0) {
      const ch = a - b, up = ch >= 0, good = higherGood ? up : !up
      delta = (up ? '▲' : '▼') + ' ' + Math.abs(ch).toFixed(col === 'gdp_per_capita_usd' ? 0 : 1) + (col === 'gdp_per_capita_usd' ? '' : 'pp')
      deltaColor = good ? POS : NEG
    }
    return { label, value: fmt(a), unit, sub, delta, deltaColor }
  }
  const kpis = [
    mkKpi('GDP per capita', 'gdp_per_capita_usd', v => v == null ? '—' : '$' + (v / 1000).toFixed(0) + 'k', '', 'G20 mean', true),
    mkKpi('Inflation', 'inflation_pct', fmtPct, '%', 'annual CPI', false),
    mkKpi('Unemployment', 'unemployment_pct', fmtPct, '%', 'labor force', false),
    mkKpi('Public debt', 'public_debt_pct_gdp', fmtPct, '%GDP', 'central gov.', false),
    mkKpi('Trade openness', 'trade_pct_gdp', fmtPct, '%GDP', 'exp.+imp.', true),
    { label: 'Economies', value: '20', unit: '', sub: 'G20 nations', delta: 'G20', deltaColor: '#A8A192' },
  ]

  // GDP chart
  const gdpList = cur.filter(d => d.gdp_usd).sort((a, b) => b.gdp_usd - a.gdp_usd).slice(0, 10)
  const gdpMax = gdpList.length ? gdpList[0].gdp_usd : 1
  const gdpX0 = 112, gdpX1 = 558, gdpRowH = 27, gdpTop = 6
  const gdpTicks = [0, gdpMax / 2, gdpMax].map(v => ({ x: gdpX0 + (v / gdpMax) * (gdpX1 - gdpX0), label: fmtBig(v) }))
  const gdpBars = gdpList.map((d, i) => {
    const by = gdpTop + i * gdpRowH
    const bw = Math.max(2, (d.gdp_usd / gdpMax) * (gdpX1 - gdpX0))
    return { ...d, ty: by + gdpRowH / 2 + 3.5, by: by + 4, bw, lx: gdpX0 + bw + 6 }
  })

  // Debt rows
  const debtRows = cur.filter(d => d.public_debt_pct_gdp != null)
    .sort((a, b) => b.public_debt_pct_gdp - a.public_debt_pct_gdp)
    .map((d, i) => {
      const v = d.public_debt_pct_gdp
      const color = v >= 100 ? NEG : v < 60 ? POS : INK
      return { ...d, rank: i + 1, val: v.toFixed(1) + '%', color, width: Math.min(v, 180) / 180 * 100 }
    })

  // Inflation
  const inflX0 = 46, inflX1 = 1118, inflY0 = 16, inflY1 = 286
  let vmin = 0, vmax = 8
  inflSel.forEach(c => years.forEach(yr => {
    const r = D.data.find(d => d.country_name === c && d.year === yr)
    if (r && r.inflation_pct != null) { vmax = Math.max(vmax, r.inflation_pct); vmin = Math.min(vmin, r.inflation_pct) }
  }))
  vmax = Math.ceil(vmax / 5) * 5; vmin = Math.floor(vmin / 5) * 5
  const inflXS = yr => inflX0 + (yr - minY) / (maxY - minY) * (inflX1 - inflX0)
  const inflYS = v => inflY1 - (v - vmin) / (vmax - vmin) * (inflY1 - inflY0)
  const inflSeries = inflSel.map((c, idx) => {
    const col = SERIES[idx % SERIES.length]
    const pts = []
    years.forEach(yr => {
      const r = D.data.find(d => d.country_name === c && d.year === yr)
      if (r && r.inflation_pct != null) pts.push({ x: inflXS(yr), y: inflYS(r.inflation_pct), yr, v: r.inflation_pct })
    })
    return { name: c, color: col, poly: pts.map(p => p.x + ',' + p.y).join(' '), end: pts[pts.length - 1], dots: pts }
  })
  const inflYticks = Array.from({ length: 5 }, (_, i) => { const v = vmin + (vmax - vmin) / 4 * i; return { y: inflYS(v), label: Math.round(v) + '%' } })
  const inflXticks = []
  for (let yr = minY; yr <= maxY; yr += 4) inflXticks.push({ x: inflXS(yr), label: String(yr).slice(2) })
  inflXticks.push({ x: inflXS(maxY), label: String(maxY).slice(2) })
  const inflZeroY = vmin < 0 ? inflYS(0) : null

  // Scatter
  const scatList = cur.filter(d => d.gdp_per_capita_usd && d.unemployment_pct != null)
  const scatMaxX = Math.max(...scatList.map(d => d.gdp_per_capita_usd), 1) * 1.05
  const scatMaxY = Math.max(...scatList.map(d => d.unemployment_pct), 1) * 1.1
  const scX0 = 46, scX1 = 560, scY0 = 14, scY1 = 252
  const scXS = v => scX0 + v / scatMaxX * (scX1 - scX0)
  const scYS = v => scY1 - v / scatMaxY * (scY1 - scY0)
  const scatDots = scatList.map(d => ({ ...d, cx: scXS(d.gdp_per_capita_usd), cy: scYS(d.unemployment_pct) }))
  const scatXticks = Array.from({ length: 5 }, (_, i) => { const v = scatMaxX * i / 4; return { x: scXS(v), label: '$' + (v / 1000).toFixed(0) + 'k' } })
  const scatYticks = Array.from({ length: 5 }, (_, i) => { const v = scatMaxY * i / 4; return { y: scYS(v), label: v.toFixed(0) + '%' } })

  // Trade
  const tradeList = cur.filter(d => d.trade_pct_gdp != null).sort((a, b) => b.trade_pct_gdp - a.trade_pct_gdp)
  const tradeMax = Math.max(...tradeList.map(d => d.trade_pct_gdp), 1) * 1.08
  const tradeAvg = tradeList.reduce((s, d) => s + d.trade_pct_gdp, 0) / (tradeList.length || 1)
  const trX0 = 36, trX1 = 572, trY1 = 232
  const trYS = v => trY1 - v / tradeMax * (trY1 - 14)
  const n = tradeList.length, slot = (trX1 - trX0) / n, bw2 = Math.min(slot * 0.62, 20)
  const tradeBars = tradeList.map((d, i) => {
    const cx = trX0 + slot * i + slot / 2
    const code = (d.country_code || d.country_name.slice(0, 3)).toUpperCase()
    return { ...d, cx, x: cx - bw2 / 2, y: trYS(d.trade_pct_gdp), w: bw2, h: Math.max(1, trY1 - trYS(d.trade_pct_gdp)), color: d.trade_pct_gdp >= tradeAvg ? POS : INK, label: code }
  })
  const tradeYticks = Array.from({ length: 5 }, (_, i) => { const v = tradeMax * i / 4; return { y: trYS(v), label: v.toFixed(0) + '%' } })

  const PANEL_DEFS = [['gdp', 'GDP'], ['debt', 'Debt'], ['inflation', 'Inflation'], ['scatter', 'Wealth/Jobs'], ['trade', 'Trade']]

  return (
    <div style={{ minHeight: '100vh', background: '#E7E0D0', fontFamily: "'IBM Plex Sans',system-ui,sans-serif", color: '#211E1A', WebkitFontSmoothing: 'antialiased', paddingBottom: 4 }}>

      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: '#15362E', borderBottom: '1px solid #0F2A23' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '16px 28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <div style={{ width: 9, height: 34, background: '#C6A24A', borderRadius: 1, alignSelf: 'center' }} />
            <div>
              <h1 style={{ margin: 0, fontFamily: "'Spectral',serif", fontWeight: 500, fontSize: 25, letterSpacing: '-0.01em', lineHeight: 1, color: '#F2ECDD' }}>Global Economic Panorama</h1>
              <p style={{ margin: '5px 0 0', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9DB1A8' }}>G20 Macroeconomic Indicators · World Bank Open Data</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9DB1A8' }}>Viewing year</div>
              <div style={{ fontFamily: "'Spectral',serif", fontSize: 30, fontWeight: 500, lineHeight: 1, marginTop: 1, color: '#F2ECDD' }}>{selectedYear}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 11px', border: '1px solid #2E5248', borderRadius: 3, background: '#1B4138' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2E7D54', display: 'inline-block' }} />
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.1em', color: '#9DB1A8' }}>LIVE</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1320, margin: '0 auto', padding: '22px 28px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Controls */}
        <section style={{ background: '#FAF8F2', border: '1px solid #E0DACC', borderRadius: 5, padding: '18px 22px', display: 'flex', gap: 30, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A9384' }}>Period · {minY}–{maxY}</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.05em', color: '#211E1A', fontWeight: 500 }}>{selectedYear}</span>
            </div>
            <input type="range" min={minY} max={maxY} value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="ec-slider"
              style={{ width: '100%', background: sliderBg }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: '#A8A192' }}>
              <span>{minY}</span><span>{maxY}</span>
            </div>
          </div>
          <div style={{ width: 1, height: 48, background: '#E0DACC' }} />
          <div>
            <p style={{ margin: '0 0 9px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A9384' }}>Panels</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {PANEL_DEFS.map(([key, label]) => {
                const on = active[key]
                return (
                  <button key={key} onClick={() => toggle(key)} style={{
                    all: 'unset', boxSizing: 'border-box',
                    fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11.5, fontWeight: 500, padding: '6px 13px', borderRadius: 3, cursor: 'pointer', letterSpacing: '0.01em',
                    background: on ? '#15362E' : 'transparent', color: on ? '#F2ECDD' : '#9A9384', border: on ? '1px solid #15362E' : '1px solid #D8D2C2',
                  }}>{label}</button>
                )
              })}
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 11 }}>
            <h2 style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8A8273' }}>G20 Averages</h2>
            <span style={{ flex: 1, height: 1, background: '#DAD3C3' }} />
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#A8A192' }}>Δ vs {prevYear}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
            {kpis.map((k, i) => (
              <div key={i} style={{ background: '#FAF8F2', border: '1px solid #E0DACC', borderRadius: 5, padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 9, minHeight: 104 }}>
                <p style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9384', lineHeight: 1.3 }}>{k.label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontFamily: "'Spectral',serif", fontWeight: 500, fontSize: 29, lineHeight: 0.9, letterSpacing: '-0.01em', color: '#1C4035' }}>{k.value}</span>
                  <span style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, color: '#8A8273', fontWeight: 500 }}>{k.unit}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 'auto' }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, fontWeight: 500, color: k.deltaColor }}>{k.delta}</span>
                  <span style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 9.5, color: '#A8A192' }}>{k.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GDP + Debt */}
        {(active.gdp || active.debt) && (
          <div style={{ display: 'grid', gridTemplateColumns: active.gdp && active.debt ? '1fr 1fr' : '1fr', gap: 18, alignItems: 'start' }}>
            {active.gdp && (
              <section style={{ background: '#FAF8F2', border: '1px solid #E0DACC', borderRadius: 5, padding: '18px 20px', minHeight: 418 }}>
                <div style={{ marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B655A' }}>Largest G20 economies</h2>
                  <p style={{ margin: '3px 0 0', fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, color: '#A8A192' }}>Total GDP in USD · Top 10 · {selectedYear}</p>
                </div>
                <svg viewBox="0 0 580 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
                  {gdpTicks.map((t, i) => (
                    <g key={i}>
                      <line x1={t.x} y1={2} x2={t.x} y2={272} stroke="#EAE5D8" strokeWidth={1} />
                      <text x={t.x} y={290} textAnchor="middle" fill="#A8A192" fontSize={9.5} fontFamily="'IBM Plex Mono',monospace">{t.label}</text>
                    </g>
                  ))}
                  {gdpBars.map((b, i) => (
                    <g key={i}>
                      <text x={106} y={b.ty} textAnchor="end" fill="#4A453C" fontSize={11.5} fontFamily="'IBM Plex Sans',sans-serif">{b.country_name}</text>
                      <rect x={gdpX0} y={b.by} width={b.bw} height={gdpRowH - 12} rx={1.5} fill="#234E43" />
                      <text x={b.lx} y={b.ty} fill="#8A8273" fontSize={10} fontFamily="'IBM Plex Mono',monospace">{fmtBig(b.gdp_usd)}</text>
                      <rect x={0} y={b.by - 4} width={580} height={gdpRowH} fill="transparent" style={{ cursor: 'default' }}
                        onMouseMove={e => tipAt(e, b.country_name, [{ k: 'GDP', v: fmtBig(b.gdp_usd) }])}
                        onMouseLeave={tipOff} />
                    </g>
                  ))}
                </svg>
              </section>
            )}
            {active.debt && (
              <section style={{ background: '#FAF8F2', border: '1px solid #E0DACC', borderRadius: 5, padding: '18px 20px', minHeight: 418 }}>
                <div style={{ marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B655A' }}>Public debt</h2>
                  <p style={{ margin: '3px 0 0', fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, color: '#A8A192' }}>% of GDP · central government · {selectedYear}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxHeight: 286, overflowY: 'auto', paddingRight: 4 }}>
                  {debtRows.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'default' }}
                      onMouseMove={e => tipAt(e, d.country_name, [{ k: 'Debt', v: d.val + ' GDP' }])}
                      onMouseLeave={tipOff}>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#B5AE9E', width: 16, textAlign: 'right' }}>{d.rank}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                          <span style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, color: '#3A352D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.country_name}</span>
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, fontWeight: 500, marginLeft: 8, color: d.color }}>{d.val}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: '#EAE5D8', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, width: d.width + '%', background: d.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 12, borderTop: '1px solid #E8E3D6' }}>
                  {[['#2E7D54', '< 60%'], ['#6E6151', '60–100%'], ['#B0463A', '> 100%']].map(([c, l]) => (
                    <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: '#8A8273' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Inflation */}
        {active.inflation && (
          <section style={{ background: '#FAF8F2', border: '1px solid #E0DACC', borderRadius: 5, padding: '18px 20px' }}>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B655A' }}>Inflation — consumer price index</h2>
              <p style={{ margin: '3px 0 0', fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, color: '#A8A192' }}>Annual change % · {minY}–{maxY} · select countries</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {D.countries.map((c, i) => {
                const on = inflSel.includes(c)
                const idx = inflSel.indexOf(c)
                const col = on ? SERIES[idx % SERIES.length] : null
                return (
                  <button key={c} onClick={() => toggleCountry(c)} style={{
                    all: 'unset', boxSizing: 'border-box',
                    fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 10.5, padding: '3px 9px', borderRadius: 3, cursor: 'pointer',
                    background: on ? col + '1A' : 'transparent', color: on ? col : '#A8A192',
                    border: on ? `1px solid ${col}66` : '1px solid #E0DACC', fontWeight: on ? 600 : 400,
                  }}>{c}</button>
                )
              })}
            </div>
            <svg viewBox="0 0 1180 312" style={{ width: '100%', height: 'auto', display: 'block' }}>
              {inflYticks.map((t, i) => (
                <g key={i}>
                  <line x1={inflX0} y1={t.y} x2={inflX1} y2={t.y} stroke="#EAE5D8" strokeWidth={1} />
                  <text x={40} y={t.y} dy={3.5} textAnchor="end" fill="#A8A192" fontSize={9.5} fontFamily="'IBM Plex Mono',monospace">{t.label}</text>
                </g>
              ))}
              {inflZeroY != null && <line x1={inflX0} y1={inflZeroY} x2={inflX1} y2={inflZeroY} stroke="#C9C2B0" strokeWidth={1} strokeDasharray="4 4" />}
              {inflXticks.map((t, i) => (
                <text key={i} x={t.x} y={304} textAnchor="middle" fill="#A8A192" fontSize={9.5} fontFamily="'IBM Plex Mono',monospace">'{t.label}</text>
              ))}
              {inflSeries.map((s, si) => (
                <g key={si}>
                  <polyline points={s.poly} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  {s.dots.map((p, pi) => (
                    <circle key={pi} cx={p.x} cy={p.y} r={9} fill="transparent" style={{ cursor: 'default' }}
                      onMouseMove={e => tipAt(e, s.name, [{ k: String(p.yr), v: p.v.toFixed(1) + '%' }])}
                      onMouseLeave={tipOff} />
                  ))}
                  {s.end && <circle cx={s.end.x} cy={s.end.y} r={2.6} fill={s.color} />}
                </g>
              ))}
            </svg>
          </section>
        )}

        {/* Scatter + Trade */}
        {(active.scatter || active.trade) && (
          <div style={{ display: 'grid', gridTemplateColumns: active.scatter && active.trade ? '1fr 1fr' : '1fr', gap: 18, alignItems: 'start' }}>
            {active.scatter && (
              <section style={{ background: '#FAF8F2', border: '1px solid #E0DACC', borderRadius: 5, padding: '18px 20px' }}>
                <div style={{ marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B655A' }}>Wealth vs. unemployment</h2>
                  <p style={{ margin: '3px 0 0', fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, color: '#A8A192' }}>GDP per capita (USD) against unemployment % · {selectedYear}</p>
                </div>
                <svg viewBox="0 0 580 290" style={{ width: '100%', height: 'auto', display: 'block' }}>
                  {scatYticks.map((t, i) => (
                    <g key={i}>
                      <line x1={scX0} y1={t.y} x2={scX1} y2={t.y} stroke="#EAE5D8" strokeWidth={1} />
                      <text x={40} y={t.y} dy={3.5} textAnchor="end" fill="#A8A192" fontSize={9.5} fontFamily="'IBM Plex Mono',monospace">{t.label}</text>
                    </g>
                  ))}
                  {scatXticks.map((t, i) => (
                    <text key={i} x={t.x} y={270} textAnchor="middle" fill="#A8A192" fontSize={9.5} fontFamily="'IBM Plex Mono',monospace">{t.label}</text>
                  ))}
                  <text x={303} y={286} textAnchor="middle" fill="#B5AE9E" fontSize={9.5} fontFamily="'IBM Plex Mono',monospace" letterSpacing="0.1em">GDP PER CAPITA →</text>
                  {scatDots.map((d, i) => (
                    <circle key={i} cx={d.cx} cy={d.cy} r={6} fill="#234E43" fillOpacity={0.72} stroke="#FAF8F2" strokeWidth={1} style={{ cursor: 'default' }}
                      onMouseMove={e => tipAt(e, d.country_name, [{ k: 'GDP/cap.', v: '$' + Math.round(d.gdp_per_capita_usd).toLocaleString() }, { k: 'Unemployment', v: d.unemployment_pct.toFixed(1) + '%' }])}
                      onMouseLeave={tipOff} />
                  ))}
                </svg>
              </section>
            )}
            {active.trade && (
              <section style={{ background: '#FAF8F2', border: '1px solid #E0DACC', borderRadius: 5, padding: '18px 20px' }}>
                <div style={{ marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B655A' }}>Trade openness</h2>
                  <p style={{ margin: '3px 0 0', fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, color: '#A8A192' }}>Exports + imports, % of GDP · {selectedYear}</p>
                </div>
                <div style={{ marginBottom: 6, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#8A8273' }}>
                  G20 average · <span style={{ color: POS, fontWeight: 500 }}>{tradeAvg.toFixed(1)}%</span>
                </div>
                <svg viewBox="0 0 580 270" style={{ width: '100%', height: 'auto', display: 'block' }}>
                  {tradeYticks.map((t, i) => (
                    <g key={i}>
                      <line x1={trX0} y1={t.y} x2={trX1} y2={t.y} stroke="#EAE5D8" strokeWidth={1} />
                      <text x={30} y={t.y} dy={3.5} textAnchor="end" fill="#A8A192" fontSize={9} fontFamily="'IBM Plex Mono',monospace">{t.label}</text>
                    </g>
                  ))}
                  <line x1={trX0} y1={trYS(tradeAvg)} x2={trX1} y2={trYS(tradeAvg)} stroke={POS} strokeWidth={1.2} strokeDasharray="4 3" strokeOpacity={0.7} />
                  {tradeBars.map((b, i) => (
                    <g key={i}>
                      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={1.5} fill={b.color} />
                      <text x={b.cx} y={248} textAnchor="middle" fill="#9A9384" fontSize={8} fontFamily="'IBM Plex Mono',monospace">{b.label}</text>
                      <rect x={b.x} y={14} width={b.w} height={218} fill="transparent" style={{ cursor: 'default' }}
                        onMouseMove={e => tipAt(e, b.country_name, [{ k: 'Trade', v: b.trade_pct_gdp.toFixed(1) + '% GDP' }])}
                        onMouseLeave={tipOff} />
                    </g>
                  ))}
                </svg>
              </section>
            )}
          </div>
        )}

        <footer style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #DAD3C3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', color: '#A8A192' }}>Source · World Bank Open Data</span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', color: '#A8A192' }}>20 economies · {minY}–{maxY}</span>
        </footer>
      </main>

      {tip && (
        <div style={{
          position: 'fixed', left: Math.min(tip.x + 16, window.innerWidth - 200), top: tip.y + 16,
          zIndex: 60, background: '#26231E', border: '1px solid #3A352D', borderRadius: 5,
          padding: '9px 12px', pointerEvents: 'none', boxShadow: '0 6px 20px rgba(0,0,0,.22)', minWidth: 120,
        }}>
          <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, fontWeight: 600, color: '#FAF8F2', marginBottom: 4 }}>{tip.title}</div>
          {tip.rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, lineHeight: 1.6 }}>
              <span style={{ color: '#B8B2A4' }}>{r.k}</span>
              <span style={{ color: '#F5F2EA', fontWeight: 500 }}>{r.v}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        *{box-sizing:border-box;}
        .ec-slider{-webkit-appearance:none;appearance:none;height:3px;border-radius:2px;outline:none;cursor:pointer;}
        .ec-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:15px;height:15px;border-radius:50%;background:#15362E;border:2px solid #FAF8F2;box-shadow:0 1px 3px rgba(0,0,0,.25);cursor:pointer;}
        .ec-slider::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#15362E;border:2px solid #FAF8F2;box-shadow:0 1px 3px rgba(0,0,0,.25);cursor:pointer;}
        ::-webkit-scrollbar{width:7px;height:7px;}
        ::-webkit-scrollbar-thumb{background:#D8D2C2;border-radius:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
      `}</style>
    </div>
  )
}
