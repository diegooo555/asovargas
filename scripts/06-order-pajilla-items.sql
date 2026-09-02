-- =============================================
-- 06-order-pajilla-items.sql
-- Agregar canastilla_number a pajillas + tabla order_pajilla_items + triggers
-- =============================================

-- 1. Agregar columna canastilla_number a la tabla pajillas
ALTER TABLE pajillas ADD COLUMN IF NOT EXISTS canastilla_number INTEGER NOT NULL DEFAULT 1;

-- Comentario
COMMENT ON COLUMN pajillas.canastilla_number IS 'Número de canastilla a la que pertenece la pajilla';

-- 2. Crear tabla order_pajilla_items (items de pajillas en órdenes de compra/restock)
CREATE TABLE IF NOT EXISTS order_pajilla_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  pajilla_id UUID NOT NULL REFERENCES pajillas(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_order_pajilla_items_order_id ON order_pajilla_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_pajilla_items_pajilla_id ON order_pajilla_items(pajilla_id);

-- =============================================
-- TRIGGERS: Stock management para ordenes (RESTOCK - incrementa stock)
-- =============================================

-- INSERT: Incrementar stock de pajillas al agregar a orden
CREATE OR REPLACE FUNCTION handle_pajilla_stock_on_order_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pajillas
  SET quantity = quantity + NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.pajilla_id;

  INSERT INTO pajillas_movements (pajilla_id, movement_type, quantity, created_at)
  VALUES (NEW.pajilla_id, 'increase', NEW.quantity, NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- UPDATE: Ajustar stock cuando cambia la cantidad en la orden
CREATE OR REPLACE FUNCTION handle_pajilla_stock_on_order_update()
RETURNS TRIGGER AS $$
DECLARE
  quantity_diff INTEGER;
BEGIN
  quantity_diff := NEW.quantity - OLD.quantity;

  IF quantity_diff = 0 THEN
    RETURN NEW;
  END IF;

  UPDATE pajillas
  SET quantity = quantity + quantity_diff,
      updated_at = NOW()
  WHERE id = NEW.pajilla_id;

  IF quantity_diff > 0 THEN
    INSERT INTO pajillas_movements (pajilla_id, movement_type, quantity, created_at)
    VALUES (NEW.pajilla_id, 'increase', quantity_diff, NOW());
  ELSE
    INSERT INTO pajillas_movements (pajilla_id, movement_type, quantity, created_at)
    VALUES (NEW.pajilla_id, 'decrease', ABS(quantity_diff), NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- DELETE: Decrementar stock al eliminar item de la orden
CREATE OR REPLACE FUNCTION handle_pajilla_stock_on_order_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pajillas
  SET quantity = quantity - OLD.quantity,
      updated_at = NOW()
  WHERE id = OLD.pajilla_id;

  INSERT INTO pajillas_movements (pajilla_id, movement_type, quantity, created_at)
  VALUES (OLD.pajilla_id, 'decrease', OLD.quantity, NOW());

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers
CREATE OR REPLACE TRIGGER trigger_handle_pajilla_stock_on_order_insert
  AFTER INSERT ON order_pajilla_items
  FOR EACH ROW EXECUTE FUNCTION handle_pajilla_stock_on_order_insert();

CREATE OR REPLACE TRIGGER trigger_handle_pajilla_stock_on_order_update
  AFTER UPDATE ON order_pajilla_items
  FOR EACH ROW EXECUTE FUNCTION handle_pajilla_stock_on_order_update();

CREATE OR REPLACE TRIGGER trigger_handle_pajilla_stock_on_order_delete
  AFTER DELETE ON order_pajilla_items
  FOR EACH ROW EXECUTE FUNCTION handle_pajilla_stock_on_order_delete();

-- =============================================
-- TRIGGER: Auto-actualizar total de la orden (incluye order_items + order_pajilla_items)
-- =============================================

CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
DECLARE
  target_order_id UUID;
BEGIN
  target_order_id := COALESCE(NEW.order_id, OLD.order_id);

  UPDATE orders
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM order_items
    WHERE order_id = target_order_id
  ) + (
    SELECT COALESCE(SUM(total_price), 0)
    FROM order_pajilla_items
    WHERE order_id = target_order_id
  ),
  updated_at = NOW()
  WHERE id = target_order_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Eliminar triggers existentes de order_items para reemplazarlos
DROP TRIGGER IF EXISTS trigger_update_order_total_insert ON order_items;
DROP TRIGGER IF EXISTS trigger_update_order_total_update ON order_items;
DROP TRIGGER IF EXISTS trigger_update_order_total_delete ON order_items;

-- Recrear triggers de order_items
CREATE OR REPLACE TRIGGER trigger_update_order_total_insert
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE OR REPLACE TRIGGER trigger_update_order_total_update
  AFTER UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE OR REPLACE TRIGGER trigger_update_order_total_delete
  AFTER DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- Triggers para order_pajilla_items
CREATE OR REPLACE TRIGGER trigger_update_order_total_on_pajilla_insert
  AFTER INSERT ON order_pajilla_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE OR REPLACE TRIGGER trigger_update_order_total_on_pajilla_update
  AFTER UPDATE ON order_pajilla_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE OR REPLACE TRIGGER trigger_update_order_total_on_pajilla_delete
  AFTER DELETE ON order_pajilla_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE order_pajilla_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on order_pajilla_items" ON order_pajilla_items
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Comentarios
-- =============================================
COMMENT ON TABLE order_pajilla_items IS 'Items de pajillas en las órdenes de compra/restock a proveedores';
COMMENT ON COLUMN order_pajilla_items.pajilla_id IS 'Referencia a la pajilla ordenada';
COMMENT ON COLUMN order_pajilla_items.quantity IS 'Cantidad de pajillas ordenadas';
COMMENT ON COLUMN order_pajilla_items.unit_price IS 'Precio unitario de compra al momento de la orden';
COMMENT ON COLUMN order_pajilla_items.total_price IS 'Precio total calculado (quantity * unit_price)';
