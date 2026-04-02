-- =============================================
-- 03-create-ventas.sql
-- Tabla para items de pajillas en ventas + triggers
-- =============================================

-- Create buy_pajilla_items table (junction table for buys and pajillas)
CREATE TABLE IF NOT EXISTS buy_pajilla_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buy_id UUID NOT NULL REFERENCES buys(id) ON DELETE CASCADE,
  pajilla_id UUID NOT NULL REFERENCES pajillas(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_buy_pajilla_items_buy_id ON buy_pajilla_items(buy_id);
CREATE INDEX IF NOT EXISTS idx_buy_pajilla_items_pajilla_id ON buy_pajilla_items(pajilla_id);
CREATE INDEX IF NOT EXISTS idx_buys_client_id ON buys(client_id);
CREATE INDEX IF NOT EXISTS idx_buys_created_at ON buys(created_at);
CREATE INDEX IF NOT EXISTS idx_buy_items_buy_id ON buy_items(buy_id);
CREATE INDEX IF NOT EXISTS idx_buy_items_product_id ON buy_items(product_id);

-- =============================================
-- TRIGGERS: Stock management for pajillas
-- =============================================

-- Function to handle stock check and decrement on buy insert (pajillas)
CREATE OR REPLACE FUNCTION handle_pajilla_stock_on_buy()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    SELECT quantity INTO current_stock
    FROM pajillas
    WHERE id = NEW.pajilla_id;

    IF current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'No hay suficiente stock para la pajilla % (Stock disponible: %, solicitado: %)',
            NEW.pajilla_id, current_stock, NEW.quantity;
    END IF;

    UPDATE pajillas
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.pajilla_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for UPDATE (pajillas)
CREATE OR REPLACE FUNCTION handle_pajilla_stock_on_buy_update()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
    quantity_diff INTEGER;
BEGIN
    quantity_diff := NEW.quantity - OLD.quantity;

    IF quantity_diff = 0 THEN
        RETURN NEW;
    END IF;

    IF quantity_diff > 0 THEN
        SELECT quantity INTO current_stock
        FROM pajillas
        WHERE id = NEW.pajilla_id;

        IF current_stock < quantity_diff THEN
            RAISE EXCEPTION 'No hay suficiente stock para la pajilla % (Disponible: %, Extra solicitado: %)',
                NEW.pajilla_id, current_stock, quantity_diff;
        END IF;

        UPDATE pajillas
        SET quantity = quantity - quantity_diff,
            updated_at = NOW()
        WHERE id = NEW.pajilla_id;
    ELSE
        UPDATE pajillas
        SET quantity = quantity + ABS(quantity_diff),
            updated_at = NOW()
        WHERE id = NEW.pajilla_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for DELETE (pajillas)
CREATE OR REPLACE FUNCTION handle_pajilla_stock_on_buy_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pajillas
    SET quantity = quantity + OLD.quantity,
        updated_at = NOW()
    WHERE id = OLD.pajilla_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for pajilla stock management
CREATE OR REPLACE TRIGGER trigger_handle_pajilla_stock_on_buy
    BEFORE INSERT ON buy_pajilla_items
    FOR EACH ROW EXECUTE FUNCTION handle_pajilla_stock_on_buy();

CREATE OR REPLACE TRIGGER trigger_handle_pajilla_stock_on_buy_update
    BEFORE UPDATE ON buy_pajilla_items
    FOR EACH ROW EXECUTE FUNCTION handle_pajilla_stock_on_buy_update();

CREATE OR REPLACE TRIGGER trigger_handle_pajilla_stock_on_buy_delete
    BEFORE DELETE ON buy_pajilla_items
    FOR EACH ROW EXECUTE FUNCTION handle_pajilla_stock_on_buy_delete();

-- =============================================
-- TRIGGERS: Auto-update buy total_amount
-- =============================================

-- Function to update buy total from both buy_items and buy_pajilla_items
CREATE OR REPLACE FUNCTION update_buy_total()
RETURNS TRIGGER AS $$
DECLARE
    target_buy_id UUID;
BEGIN
    target_buy_id := COALESCE(NEW.buy_id, OLD.buy_id);

    UPDATE buys
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM buy_items
        WHERE buy_id = target_buy_id
    ) + (
        SELECT COALESCE(SUM(total_price), 0)
        FROM buy_pajilla_items
        WHERE buy_id = target_buy_id
    ),
    updated_at = NOW()
    WHERE id = target_buy_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers on buy_items to update buy total
CREATE OR REPLACE TRIGGER trigger_update_buy_total_on_item_insert
    AFTER INSERT ON buy_items
    FOR EACH ROW EXECUTE FUNCTION update_buy_total();

CREATE OR REPLACE TRIGGER trigger_update_buy_total_on_item_update
    AFTER UPDATE ON buy_items
    FOR EACH ROW EXECUTE FUNCTION update_buy_total();

CREATE OR REPLACE TRIGGER trigger_update_buy_total_on_item_delete
    AFTER DELETE ON buy_items
    FOR EACH ROW EXECUTE FUNCTION update_buy_total();

-- Triggers on buy_pajilla_items to update buy total
CREATE OR REPLACE TRIGGER trigger_update_buy_total_on_pajilla_insert
    AFTER INSERT ON buy_pajilla_items
    FOR EACH ROW EXECUTE FUNCTION update_buy_total();

CREATE OR REPLACE TRIGGER trigger_update_buy_total_on_pajilla_update
    AFTER UPDATE ON buy_pajilla_items
    FOR EACH ROW EXECUTE FUNCTION update_buy_total();

CREATE OR REPLACE TRIGGER trigger_update_buy_total_on_pajilla_delete
    AFTER DELETE ON buy_pajilla_items
    FOR EACH ROW EXECUTE FUNCTION update_buy_total();

-- Enable RLS
ALTER TABLE buy_pajilla_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on buy_pajilla_items" ON buy_pajilla_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE buy_pajilla_items IS 'Items de pajillas en las ventas/compras';
COMMENT ON COLUMN buy_pajilla_items.pajilla_id IS 'Referencia a la pajilla vendida';
COMMENT ON COLUMN buy_pajilla_items.quantity IS 'Cantidad de pajillas vendidas';
COMMENT ON COLUMN buy_pajilla_items.unit_price IS 'Precio unitario al momento de la venta';
COMMENT ON COLUMN buy_pajilla_items.total_price IS 'Precio total calculado (quantity * unit_price)';
