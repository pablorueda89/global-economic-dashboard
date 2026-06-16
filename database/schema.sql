-- Global Economic Health Dashboard — SQLite Schema

CREATE TABLE IF NOT EXISTS economic_data (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    country_code        TEXT    NOT NULL,
    country_name        TEXT    NOT NULL,
    year                INTEGER NOT NULL,
    gdp_usd             REAL,
    gdp_per_capita_usd  REAL,
    inflation_pct       REAL,
    unemployment_pct    REAL,
    public_debt_pct_gdp REAL,
    trade_pct_gdp       REAL,
    UNIQUE(country_code, year)
);

CREATE INDEX IF NOT EXISTS idx_country ON economic_data(country_code);
CREATE INDEX IF NOT EXISTS idx_year    ON economic_data(year);
CREATE INDEX IF NOT EXISTS idx_country_year ON economic_data(country_code, year);
