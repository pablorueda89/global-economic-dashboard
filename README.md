# Global Economic Health Dashboard

Dashboard interactivo que visualiza indicadores macroeconómicos del G20 usando la [World Bank Open Data API](https://data.worldbank.org/).

## Stack

- **API**: World Bank Open Data (gratuita, sin API key)
- **ETL**: Python 3.11+ con `requests` y `pandas`
- **Base de datos**: SQLite
- **Frontend**: React + Recharts + TailwindCSS

## Indicadores

| Indicador | Código World Bank |
|-----------|------------------|
| PIB total | NY.GDP.MKTP.CD |
| PIB per cápita | NY.GDP.PCAP.CD |
| Inflación (IPC) | FP.CPI.TOTL.ZG |
| Desempleo | SL.UEM.TOTL.ZS |
| Deuda pública (% PIB) | GC.DOD.TOTL.GD.ZS |
| Apertura comercial | NE.TRD.GNFS.ZS |

## Inicio rápido

### 1. Ejecutar el pipeline ETL

```bash
cd etl
pip install -r requirements.txt
python pipeline.py
```

Esto extrae datos de la World Bank API, los transforma y los carga en `data/economic_data.db`.
También exporta `data/economic_data.json` para el frontend.

### 2. Levantar el frontend

```bash
cd frontend
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

## Estructura

```
global-economic-dashboard/
├── plan.md           ← Roadmap del proyecto
├── etl/              ← Pipeline Python
├── database/         ← Schema SQL
├── data/             ← Datos generados (ignorados en git, excepto .json)
└── frontend/         ← App React
```

## Países cubiertos

Argentina, Australia, Brasil, Canadá, China, Francia, Alemania, India,
Indonesia, Italia, Japón, México, Rusia, Arabia Saudita, Sudáfrica,
Corea del Sur, Turquía, Reino Unido, Estados Unidos, Unión Europea.
