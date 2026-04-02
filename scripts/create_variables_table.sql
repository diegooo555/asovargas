-- Create Variables table for financial data management
CREATE TABLE IF NOT EXISTS variables (
    variable_id SERIAL PRIMARY KEY,
    detail VARCHAR(255) NOT NULL,
    amount DECIMAL(20,8) NOT NULL DEFAULT 0,
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
    ('Valor Factura', 25408000),
    ('Litro Asociado', 2000),
    ('Litro No Asociado', 1850),
    ('Cuota Sostenimiento', 20000)
ON CONFLICT DO NOTHING;


CREATE TABLE IF NOT EXISTS fortnight_variables (
    variable_id SERIAL PRIMARY KEY,
    detail VARCHAR(255) NOT NULL,
    date_value DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO fortnight_variables (detail, date_value) VALUES
    ('Inicio Quincena', '2025-09-01'),
    ('Fin Quincena', '2025-09-15')
ON CONFLICT DO NOTHING;
