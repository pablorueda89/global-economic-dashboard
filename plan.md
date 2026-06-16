# Global Economic Health Dashboard — Plan

## Resumen del Proyecto

Dashboard interactivo que visualiza indicadores macroeconómicos del G20 usando la World Bank Open Data API.
Orientado a economistas, analistas de política económica y periodistas de datos.

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| API | World Bank Open Data | Gratuita, sin API key, 16,000+ indicadores |
| ETL | Python 3.11+ (requests, pandas) | Estándar de la industria para pipelines de datos |
| Base de datos | SQLite | Gratuita, sin servidor, perfecta para portafolio |
| Frontend | React + Recharts + TailwindCSS | Moderno, declarativo, visual |
| Control de versiones | Git + GitHub | Visibilidad pública del portafolio |

## Indicadores a Extraer (World Bank)

| Código | Indicador | Descripción |
|--------|-----------|-------------|
| NY.GDP.MKTP.CD | GDP (current US$) | PIB total en dólares corrientes |
| NY.GDP.PCAP.CD | GDP per capita (US$) | PIB per cápita |
| FP.CPI.TOTL.ZG | Inflation (CPI, %) | Inflación anual |
| SL.UEM.TOTL.ZS | Unemployment (% labor force) | Desempleo total |
| GC.DOD.TOTL.GD.ZS | Central gov. debt (% GDP) | Deuda pública como % del PIB |
| NE.TRD.GNFS.ZS | Trade (% of GDP) | Apertura comercial |

## Países del G20

AR, AU, BR, CA, CN, FR, DE, IN, ID, IT, JP, MX, RU, SA, ZA, KR, TR, GB, US, EU

## Fases del Proyecto

### Fase 1 — Estructura y Plan ✅
- [x] Crear directorio del proyecto
- [x] Escribir plan.md
- [x] Crear .gitignore
- [x] Inicializar repositorio Git

### Fase 2 — ETL Pipeline (Python)
- [ ] `config.py` — constantes (países, indicadores, años)
- [ ] `extract.py` — llamadas a World Bank API con paginación
- [ ] `transform.py` — limpieza, normalización, manejo de nulos
- [ ] `load.py` — inserción en SQLite
- [ ] `pipeline.py` — orquestador principal
- [ ] `requirements.txt`

### Fase 3 — Base de Datos (SQLite)
- [ ] `schema.sql` — tablas: countries, indicators, economic_data
- [ ] Índices para consultas rápidas por país y año

### Fase 4 — Control de Versiones
- [ ] Commits atómicos por fase
- [ ] `.gitignore` con exclusión de .db y .env
- [ ] Push a GitHub (repositorio público)

### Fase 5 — Frontend React
- [ ] `create-react-app` o Vite
- [ ] Componentes: KPICard, LineChart, BarChart, WorldMap, CountrySelector
- [ ] Página principal con métricas clave del G20
- [ ] API local o lectura directa desde SQLite exportado a JSON

## Estructura de Directorios

```
global-economic-dashboard/
├── plan.md
├── README.md
├── .gitignore
├── etl/
│   ├── requirements.txt
│   ├── config.py
│   ├── extract.py
│   ├── transform.py
│   ├── load.py
│   └── pipeline.py
├── database/
│   ├── schema.sql
│   └── queries.sql
├── data/
│   └── economic_data.db        ← generado por el pipeline (ignorado en git)
│   └── economic_data.json      ← exportado para el frontend
└── frontend/
    ├── package.json
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── KPICard.jsx
    │   │   ├── GDPChart.jsx
    │   │   ├── InflationChart.jsx
    │   │   ├── UnemploymentChart.jsx
    │   │   ├── CountrySelector.jsx
    │   │   └── DataTable.jsx
    │   ├── hooks/
    │   │   └── useEconomicData.js
    │   └── data/
    │       └── economic_data.json
    └── public/
```

## Métricas Clave en el Dashboard

1. **PIB Top 10 G20** — Gráfico de barras horizontal comparativo
2. **Inflación histórica** — Líneas por país (selector múltiple), 2000–2023
3. **Desempleo vs PIB per cápita** — Scatter plot con burbujas
4. **Deuda pública ranking** — Tabla ordenable
5. **Resumen KPIs** — Cards con promedio G20 de cada indicador
6. **Mapa de calor** — PIB per cápita por región

## Decisiones de Diseño

- **SQLite sobre PostgreSQL**: No requiere servidor externo, ideal para portafolio
- **JSON exportado**: El frontend React consume un JSON estático generado por el pipeline
  (evita necesidad de backend/API server para demo)
- **Datos históricos 2000–2023**: Balance entre carga y riqueza narrativa
- **Sin API key**: World Bank no la requiere, el demo funciona sin configuración
