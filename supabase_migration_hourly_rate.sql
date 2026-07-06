-- Migration: Add hourly_rate as a computed/generated column to the jobs table
-- Generated: 2026-07-06
-- Formula: hourly_rate = monthly_salary / (hours_per_week * 4)
-- This is a STORED generated column — it is automatically computed and persisted
-- by Postgres whenever monthly_salary or hours_per_week changes.
-- No application-level writes are needed for this column.

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2)
  GENERATED ALWAYS AS (
    CASE
      WHEN hours_per_week > 0
      THEN ROUND(monthly_salary / (hours_per_week * 4.0), 2)
      ELSE 0
    END
  ) STORED;

-- Verify the column was added
-- SELECT id, monthly_salary, hours_per_week, hourly_rate FROM jobs LIMIT 5;
