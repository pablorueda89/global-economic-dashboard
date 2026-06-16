import sqlite3
import json
import logging
import pandas as pd
from pathlib import Path
from config import DB_PATH, JSON_PATH, INDICATORS

logger = logging.getLogger(__name__)


def init_db(conn: sqlite3.Connection):
    """Create tables if they don't exist."""
    with open("../database/schema.sql", "r") as f:
        conn.executescript(f.read())
    conn.commit()
    logger.info("Database schema initialized.")


def load_to_sqlite(df: pd.DataFrame, db_path: str = DB_PATH):
    """Load the transformed DataFrame into SQLite."""
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    init_db(conn)

    # Upsert via replace
    df.to_sql("economic_data", conn, if_exists="replace", index=False)
    conn.commit()

    row_count = conn.execute("SELECT COUNT(*) FROM economic_data").fetchone()[0]
    logger.info(f"Loaded {row_count} rows into SQLite at {db_path}")

    conn.close()


def export_to_json(df: pd.DataFrame, summary: dict, json_path: str = JSON_PATH):
    """Export data to JSON for the React frontend."""
    Path(json_path).parent.mkdir(parents=True, exist_ok=True)

    # Replace NaN with None for valid JSON
    df_clean = df.where(pd.notna(df), other=None)

    output = {
        "summary": summary,
        "countries": sorted(df_clean["country_name"].unique().tolist()),
        "years": sorted(df_clean["year"].unique().tolist()),
        "indicators": {v: k for k, v in INDICATORS.items()},
        "data": df_clean.to_dict(orient="records"),
    }

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    logger.info(f"Exported JSON to {json_path} ({len(output['data'])} records)")
