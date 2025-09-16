-- Create Variables table for financial data management
CREATE TABLE IF NOT EXISTS variables (
    variable_id SERIAL PRIMARY KEY,
    detail VARCHAR(255) NOT NULL,
    amount DECIMAL(15,8) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_variables_updated_at 
    BEFORE UPDATE ON variables 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample variables
INSERT INTO variables (detail, amount) VALUES 
    ('Precio por litro de leche', 2000.00),
    ('Comisión por transacción', 0.0004),
    ('Descuento por volumen', 0.05),
    ('Tasa de cambio USD', 4200.00),
    ('Límite de crédito máximo', 1000000.00)
ON CONFLICT DO NOTHING;
