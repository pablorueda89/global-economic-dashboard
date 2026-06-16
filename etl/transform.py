from __future__ import annotations
import pandas as pd
import logging
from config import INDICATORS, START_YEAR, END_YEAR

logger = logging.getLogger(__name__)


def transform(raw_records: list[dict]) -> pd.DataFrame:
    """Clean, pivot, and normalize raw World Bank records into a wide DataFrame."""
    df = pd.DataFrame(raw_records)

    # Cast types
    df["year"] = pd.to_numeric(df["year"], errors="coerce")
    df["value"] = pd.to_numeric(df["value"], errors="coerce")

    # Drop rows outside the target year range
    df = df[(df["year"] >= START_YEAR) & (df["year"] <= END_YEAR)]

    # Pivot: one row per (country, year), one column per indicator
    pivot = df.pivot_table(
        index=["country_code", "country_name", "year"],
        columns="indicator_column",
        values="value",
        aggfunc="first",
    ).reset_index()

    pivot.columns.name = None

    # Ensure all indicator columns exist (fill missing with NaN)
    for col in INDICATORS.values():
        if col not in pivot.columns:
            pivot[col] = float("nan")

    # Round numeric columns to 2 decimal places
    numeric_cols = list(INDICATORS.values())
    pivot[numeric_cols] = pivot[numeric_cols].round(2)

    # Sort
    pivot = pivot.sort_values(["country_code", "year"]).reset_index(drop=True)

    logger.info(f"Transform complete. Shape: {pivot.shape}")
    _log_coverage(pivot)

    return pivot


def _log_coverage(df: pd.DataFrame):
    """Log data coverage per indicator."""
    numeric_cols = list(INDICATORS.values())
    for col in numeric_cols:
        if col in df.columns:
            filled = df[col].notna().sum()
            total = len(df)
            pct = 100 * filled / total if total else 0
            logger.info(f"  {col}: {filled}/{total} rows filled ({pct:.1f}%)")


def build_summary(df: pd.DataFrame) -> dict:
    """Build a summary dict with latest year averages across G20."""
    latest_year = int(df["year"].max())
    latest = df[df["year"] == latest_year]

    summary = {"latest_year": latest_year, "g20_averages": {}}
    for col in INDICATORS.values():
        if col in latest.columns:
            avg = latest[col].mean()
            summary["g20_averages"][col] = round(avg, 2) if pd.notna(avg) else None

    return summary
