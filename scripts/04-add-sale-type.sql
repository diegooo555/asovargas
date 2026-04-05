-- =============================================
-- 04-add-sale-type.sql
-- Añadir tipo de venta a la tabla buys
-- Opciones: contado, transferencia, credito
-- =============================================

-- Crear el tipo enum para tipo de venta
CREATE TYPE sale_type AS ENUM ('contado', 'transferencia', 'credito');

-- Agregar columna sale_type a la tabla buys con default 'contado'
ALTER TABLE buys
  ADD COLUMN sale_type sale_type NOT NULL DEFAULT 'contado';

-- Comentarios
COMMENT ON COLUMN buys.sale_type IS 'Tipo de venta: contado, transferencia o crédito';
