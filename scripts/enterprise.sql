-- Create enterprise table
CREATE TABLE enterprise (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
    price_liter DECIMAL(6,2) NOT NULL CHECK (price_liter >= 0)
);


-- Create income and expense tables
CREATE TABLE income (
    id INT PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    detail VARCHAR(255) NOT NULL,
    date DATE NOT NULL
);

CREATE TABLE expense (
    id INT PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    detail VARCHAR(255) NOT NULL,
    date DATE NOT NULL
);

-- Create user buys table
CREATE TABLE IF NOT EXISTS buys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
  buy_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user buy_items table (junction table for orders and products)
CREATE TABLE IF NOT EXISTS buy_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buy_id UUID NOT NULL REFERENCES buys(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to handle stock check and decrement on buy -Insert
CREATE OR REPLACE FUNCTION handle_product_stock_on_buy()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Obtener stock actual del producto
    SELECT quantity INTO current_stock
    FROM products
    WHERE id = NEW.product_id;

    -- Verificar si hay stock suficiente
    IF current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'No hay suficiente stock para el producto % (Stock disponible: %, solicitado: %)',
            NEW.product_id, current_stock, NEW.quantity;
    END IF;

    -- Descontar stock
    UPDATE products
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    -- Registrar movimiento en stock_movements
    INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        created_at
    ) VALUES (
        NEW.product_id,
        'sale',
        NEW.quantity,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for UPDATE
CREATE OR REPLACE FUNCTION handle_product_stock_on_buy_update()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
    quantity_diff INTEGER;
BEGIN
    quantity_diff := NEW.quantity - OLD.quantity;

    -- Si no cambia la cantidad, no hacer nada
    IF quantity_diff = 0 THEN
        RETURN NEW;
    END IF;

    -- Si aumenta la cantidad, verificar stock y descontar
    IF quantity_diff > 0 THEN
        SELECT quantity INTO current_stock
        FROM products
        WHERE id = NEW.product_id;

        IF current_stock < quantity_diff THEN
            RAISE EXCEPTION 'No hay suficiente stock para el producto % (Disponible: %, Extra solicitado: %)',
                NEW.product_id, current_stock, quantity_diff;
        END IF;

        UPDATE products
        SET quantity = quantity - quantity_diff,
            updated_at = NOW()
        WHERE id = NEW.product_id;

        INSERT INTO stock_movements (product_id, movement_type, quantity, created_at)
        VALUES (NEW.product_id, 'sale', quantity_diff, NOW());
    ELSE
        -- Si disminuye la cantidad, devolver stock
        UPDATE products
        SET quantity = quantity + ABS(quantity_diff),
            updated_at = NOW()
        WHERE id = NEW.product_id;

        INSERT INTO stock_movements (product_id, movement_type, quantity, created_at)
        VALUES (NEW.product_id, 'adjustment', ABS(quantity_diff), NOW());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Function for DELETE
CREATE OR REPLACE FUNCTION handle_product_stock_on_buy_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Devolver stock
    UPDATE products
    SET quantity = quantity + OLD.quantity,
        updated_at = NOW()
    WHERE id = OLD.product_id;

    INSERT INTO stock_movements (product_id, movement_type, quantity, created_at)
    VALUES (OLD.product_id, 'adjustment', OLD.quantity, NOW());

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


-- Triggers
CREATE OR REPLACE TRIGGER trigger_handle_product_stock_on_buy
    BEFORE INSERT ON buy_items
    FOR EACH ROW EXECUTE FUNCTION handle_product_stock_on_buy();

CREATE OR REPLACE TRIGGER trigger_handle_product_stock_on_buy_update
    BEFORE UPDATE ON buy_items
    FOR EACH ROW EXECUTE FUNCTION handle_product_stock_on_buy_update();

CREATE OR REPLACE TRIGGER trigger_handle_product_stock_on_buy_delete
    BEFORE DELETE ON buy_items
    FOR EACH ROW EXECUTE FUNCTION handle_product_stock_on_buy_delete();