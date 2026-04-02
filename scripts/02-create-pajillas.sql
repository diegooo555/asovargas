-- Create pajillas (insemination straws) table
CREATE TABLE
  IF NOT EXISTS pajillas (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    bull_name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL CHECK (purchase_price >= 0),
    sale_price DECIMAL(10, 2) NOT NULL CHECK (sale_price >= 0),
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW (),
      updated_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW ()
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pajillas_bull_name ON pajillas (bull_name);

CREATE INDEX IF NOT EXISTS idx_pajillas_company ON pajillas (company);

CREATE INDEX IF NOT EXISTS idx_pajillas_breed ON pajillas (breed);

CREATE INDEX IF NOT EXISTS idx_pajillas_created_at ON pajillas (created_at);

-- Create function to update updated_at timestamp for pajillas
CREATE
OR REPLACE TRIGGER trigger_pajillas_updated_at BEFORE
UPDATE ON pajillas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

-- Enable Row Level Security (RLS)
ALTER TABLE pajillas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations on pajillas" ON pajillas FOR ALL USING (true)
WITH
  CHECK (true);

-- Add comments
COMMENT ON TABLE pajillas IS 'Tabla para gestionar pajillas de inseminación de toros';

COMMENT ON COLUMN pajillas.bull_name IS 'Nombre del toro del cual proviene el semen';

COMMENT ON COLUMN pajillas.company IS 'Empresa proveedora del semen';

COMMENT ON COLUMN pajillas.breed IS 'Raza del toro';

COMMENT ON COLUMN pajillas.purchase_price IS 'Valor de compra de la pajilla';

COMMENT ON COLUMN pajillas.sale_price IS 'Valor de venta de la pajilla';

COMMENT ON COLUMN pajillas.quantity IS 'Cantidad disponible en inventario';

CREATE TABLE
  IF NOT EXISTS pajillas_movements (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    pajilla_id UUID NOT NULL REFERENCES pajillas (id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (
      movement_type IN ('increase', 'decrease', 'adjustment')
    ),
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW ()
  );


-- Funcion para registrar los movimientos de las pajillas

CREATE OR REPLACE FUNCTION handle_pajilla_quantity_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actuar si cambia la cantidad
    IF OLD.quantity != NEW.quantity THEN
        
        DECLARE
            quantity_diff INTEGER := NEW.quantity - OLD.quantity;
        BEGIN

            -- Registrar movimiento
            IF quantity_diff > 0 THEN
                INSERT INTO pajillas_movements (
                    pajilla_id,
                    movement_type,
                    quantity,
                    created_at
                ) VALUES (
                    NEW.id,
                    'increase',
                    quantity_diff,
                    NOW()
                );

            ELSIF quantity_diff < 0 THEN
                INSERT INTO pajillas_movements (
                    pajilla_id,
                    movement_type,
                    quantity,
                    created_at
                ) VALUES (
                    NEW.id,
                    'decrease',
                    ABS(quantity_diff),
                    NOW()
                );
            END IF;

        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;  


-- Trigger para registrar los movimientos de las pajillas
CREATE OR REPLACE TRIGGER trigger_handle_pajilla_quantity_update
AFTER UPDATE ON pajillas
FOR EACH ROW
EXECUTE FUNCTION handle_pajilla_quantity_update();