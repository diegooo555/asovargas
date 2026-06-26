-- =============================================
-- MIGRATION SCRIPT - CORREGIDO Y AUDITADO
-- Generado: 2026-06-25
-- =============================================

BEGIN;

-- =============================================
-- PASO 1: Crear tabla fortnight (quincena)
-- =============================================

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

COMMENT ON TABLE fortnight IS 'Representa una quincena de producción. Contiene los precios vigentes para ese período.';

COMMENT ON COLUMN fortnight.enterprise_liter_price IS 'Precio por litro que la empresa reconoce en esa quincena';

COMMENT ON COLUMN fortnight.support_fee IS 'Cuota de sostenimiento a descontar por cliente en esta quincena';

-- =============================================
-- PASO 2: Actualizar tabla production_records
-- =============================================

-- Se agrega como NULLABLE para no romper filas existentes.
-- Ver instrucciones post-migración al final del script.
ALTER TABLE production_records
  ADD COLUMN IF NOT EXISTS fortnight_id UUID REFERENCES fortnight (id) ON DELETE RESTRICT;

ALTER TABLE production_records
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE production_records
  ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_production_records_fortnight_id ON production_records (fortnight_id);

COMMENT ON COLUMN production_records.fortnight_id IS 'Quincena a la que pertenece este registro de producción';

-- =============================================
-- PASO 3: Crear tabla debt_payment (pago de deuda)
-- =============================================

CREATE TABLE
  IF NOT EXISTS debt_payment (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    debt_id UUID NOT NULL REFERENCES debts (debt_id) ON DELETE RESTRICT,
    fortnight_id UUID NOT NULL REFERENCES fortnight (id) ON DELETE RESTRICT,
    total NUMERIC(10, 2) NOT NULL CHECK (total > 0),
    note TEXT,
    created_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW ()
  );

CREATE INDEX IF NOT EXISTS idx_debt_payment_debt_id ON debt_payment (debt_id);

CREATE INDEX IF NOT EXISTS idx_debt_payment_fortnight_id ON debt_payment (fortnight_id);

COMMENT ON TABLE debt_payment IS 'Registra los abonos o pagos realizados a una deuda dentro de una quincena';

COMMENT ON COLUMN debt_payment.total IS 'Monto pagado en este abono (debe ser positivo)';

COMMENT ON COLUMN debt_payment.fortnight_id IS 'Quincena en la que se realizó el pago, para incluirlo en el cálculo de la factura';

-- =============================================
-- PASO 4: Crear tabla invoice_client_fortnight (factura de quincena)
-- =============================================

CREATE TABLE
  IF NOT EXISTS invoice_client_fortnight (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients (client_id) ON DELETE RESTRICT,
    fortnight_id UUID NOT NULL REFERENCES fortnight (id) ON DELETE RESTRICT,
    total_liters NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_liters >= 0),
    price_total_liters NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price_total_liters >= 0),
    total_debts NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_debts >= 0),
    support_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (support_fee >= 0),
    total_invoice NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW (),
      updated_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW (),
    CONSTRAINT uq_invoice_client_fortnight UNIQUE (client_id, fortnight_id)
  );

CREATE INDEX IF NOT EXISTS idx_invoice_client_fortnight_client_id ON invoice_client_fortnight (client_id);

CREATE INDEX IF NOT EXISTS idx_invoice_client_fortnight_fortnight_id ON invoice_client_fortnight (fortnight_id);

CREATE OR REPLACE TRIGGER trigger_invoice_client_fortnight_updated_at
  BEFORE UPDATE ON invoice_client_fortnight
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column ();

COMMENT ON TABLE invoice_client_fortnight IS 'Factura generada al cierre de cada quincena por cliente.';

COMMENT ON COLUMN invoice_client_fortnight.total_liters IS 'Suma de litros registrados en production_records para este cliente y quincena';

COMMENT ON COLUMN invoice_client_fortnight.price_total_liters IS 'Valor bruto = total_liters * precio_litro de la quincena según tipo de cliente';

COMMENT ON COLUMN invoice_client_fortnight.total_debts IS 'Suma de debt_payment.total para este cliente en esta quincena';

COMMENT ON COLUMN invoice_client_fortnight.total_invoice IS 'Valor neto = price_total_liters - total_debts - support_fee';

-- =============================================
-- PASO 5: RLS
-- =============================================

ALTER TABLE fortnight ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on fortnight" ON fortnight
  FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE debt_payment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on debt_payment" ON debt_payment
  FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE invoice_client_fortnight ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on invoice_client_fortnight" ON invoice_client_fortnight
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMIT;

-- =============================================
-- POST-MIGRACIÓN (ejecutar manualmente después)
-- =============================================
--
-- 1. Asignar quincena a registros históricos:
--    UPDATE production_records
--    SET fortnight_id = '<uuid-quincena-historica>'
--    WHERE fortnight_id IS NULL;
--
-- 2. Una vez todos los registros tengan quincena, forzar NOT NULL:
--    ALTER TABLE production_records ALTER COLUMN fortnight_id SET NOT NULL;
--
-- 3. Verificar integridad:
--    SELECT COUNT(*) FROM production_records WHERE fortnight_id IS NULL;
-- =============================================