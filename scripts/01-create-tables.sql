-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL CHECK (purchase_price >= 0),
  sale_price DECIMAL(10,2) NOT NULL CHECK (sale_price >= 0),
  expenses DECIMAL(10,2) NOT NULL CHECK (expenses >= 0),
  profit_percentage DECIMAL(5,2) NOT NULL CHECK (profit_percentage >= 0 AND profit_percentage <= 100),
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user order_items table (junction table for orders and products)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'order', 'adjustment')),
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


--user 

-- Create users table
create table users (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  email varchar(255) unique not null,
  password varchar(255) not null,
  created_at timestamp with time zone default now()
);

-- Insert a new user
insert into users (name, email, password)
values ('Diego', 'diegoooh2o@gmail.ocm', 'StrongPass123!');



-- Function to update product quantity when order items are added
CREATE OR REPLACE FUNCTION update_product_quantity_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product quantity by adding the ordered quantity
    UPDATE products 
    SET quantity = quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Create stock movement record for tracking
    INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        created_at
    ) VALUES (
        NEW.product_id,
        'order',
        NEW.quantity,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to execute the function when order items are inserted
CREATE OR REPLACE TRIGGER trigger_update_product_quantity_on_order
    AFTER INSERT ON order_items
    FOR EACH ROW 
    EXECUTE FUNCTION update_product_quantity_on_order();

-- Function to handle quantity updates when order items are modified
CREATE OR REPLACE FUNCTION handle_product_quantity_on_order_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If quantity changed, adjust the product quantity
    IF OLD.quantity != NEW.quantity THEN
        -- Calculate the difference
        DECLARE
            quantity_diff INTEGER := NEW.quantity - OLD.quantity;
        BEGIN
            -- Update product quantity
            UPDATE products 
            SET quantity = quantity + quantity_diff,
                updated_at = NOW()
            WHERE id = NEW.product_id;
            
            -- Create stock movement record for the adjustment
            IF quantity_diff > 0 THEN
                INSERT INTO stock_movements (
                    product_id,
                    movement_type,
                    quantity,
                    created_at
                ) VALUES (
                    NEW.product_id,
                    'adjustment',
                    quantity_diff,
                    NOW()
                );
            ELSIF quantity_diff < 0 THEN
                INSERT INTO stock_movements (
                    product_id,
                    movement_type,
                    quantity,
                    created_at
                ) VALUES (
                    NEW.product_id,
                    'adjustment',
                    ABS(quantity_diff),
                    NOW()
                );
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order item updates
CREATE OR REPLACE TRIGGER trigger_handle_product_quantity_on_order_update
    AFTER UPDATE ON order_items
    FOR EACH ROW 
    EXECUTE FUNCTION handle_product_quantity_on_order_update();

-- Function to handle quantity updates when order items are deleted
CREATE OR REPLACE FUNCTION handle_product_quantity_on_order_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Subtract the quantity from product when order item is deleted
    UPDATE products 
    SET quantity = quantity - OLD.quantity,
        updated_at = NOW()
    WHERE id = OLD.product_id;
    
    -- Create stock movement record for the removal
    INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        created_at
    ) VALUES (
        OLD.product_id,
        'adjustment',
        OLD.quantity,
        NOW()
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order item deletions
CREATE OR REPLACE TRIGGER trigger_handle_product_quantity_on_order_delete
    AFTER DELETE ON order_items
    FOR EACH ROW 
    EXECUTE FUNCTION handle_product_quantity_on_order_delete();

-- Add a comment to document the behavior
COMMENT ON FUNCTION update_product_quantity_on_order() IS 
'Automatically increments product quantity when order items are created and logs stock movements';

COMMENT ON FUNCTION handle_product_quantity_on_order_update() IS 
'Handles product quantity adjustments when order items are updated';

COMMENT ON FUNCTION handle_product_quantity_on_order_delete() IS 
'Handles product quantity decrements when order items are deleted';



-------first version


-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Create function to update order total
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders 
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update order totals
CREATE OR REPLACE TRIGGER trigger_update_order_total_insert
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE OR REPLACE TRIGGER trigger_update_order_total_update
  AFTER UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE OR REPLACE TRIGGER trigger_update_order_total_delete
  AFTER DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE OR REPLACE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
