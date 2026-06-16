-- Queries de referencia para el dashboard

-- Top 10 economías por PIB (último año disponible)
SELECT country_name, year, gdp_usd
FROM economic_data
WHERE year = (SELECT MAX(year) FROM economic_data WHERE gdp_usd IS NOT NULL)
  AND gdp_usd IS NOT NULL
ORDER BY gdp_usd DESC
LIMIT 10;

-- Inflación histórica por país
SELECT country_code, country_name, year, inflation_pct
FROM economic_data
WHERE inflation_pct IS NOT NULL
ORDER BY country_code, year;

-- Promedio G20 por indicador (último año)
SELECT
    AVG(gdp_per_capita_usd)  AS avg_gdp_per_capita,
    AVG(inflation_pct)       AS avg_inflation,
    AVG(unemployment_pct)    AS avg_unemployment,
    AVG(public_debt_pct_gdp) AS avg_public_debt,
    AVG(trade_pct_gdp)       AS avg_trade
FROM economic_data
WHERE year = (SELECT MAX(year) FROM economic_data);

-- Desempleo vs PIB per cápita (scatter plot)
SELECT country_name, year, gdp_per_capita_usd, unemployment_pct
FROM economic_data
WHERE gdp_per_capita_usd IS NOT NULL
  AND unemployment_pct IS NOT NULL
  AND year = (SELECT MAX(year) FROM economic_data WHERE unemployment_pct IS NOT NULL)
ORDER BY gdp_per_capita_usd DESC;

-- Deuda pública ranking
SELECT country_name, year, public_debt_pct_gdp
FROM economic_data
WHERE year = (SELECT MAX(year) FROM economic_data WHERE public_debt_pct_gdp IS NOT NULL)
  AND public_debt_pct_gdp IS NOT NULL
ORDER BY public_debt_pct_gdp DESC;
