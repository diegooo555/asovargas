-- Fortnights table: stores each fortnight period configuration
CREATE TABLE IF NOT EXISTS fortnights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  price_liter_associate NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_liter_buyer NUMERIC(10, 2) NOT NULL DEFAULT 0,
  sostenimiento_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add fortnight_id to production_records
ALTER TABLE production_records ADD COLUMN IF NOT EXISTS fortnight_id UUID REFERENCES fortnights(id) ON DELETE SET NULL;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_fortnights_is_active ON fortnights(is_active);
CREATE INDEX IF NOT EXISTS idx_production_records_fortnight_id ON production_records(fortnight_id);

-- Trigger auto update updated_at
CREATE OR REPLACE FUNCTION update_fortnight_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_fortnights_updated_at ON fortnights;
CREATE TRIGGER trigger_fortnights_updated_at
  BEFORE UPDATE ON fortnights
  FOR EACH ROW
  EXECUTE FUNCTION update_fortnight_updated_at();
