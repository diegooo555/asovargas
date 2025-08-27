-- Create client table
CREATE TABLE IF NOT EXISTS clients (
  client_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type_client VARCHAR(100) NOT NULL CHECK (type_client IN ('associate', 'buyer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production record table
CREATE TABLE IF NOT EXISTS production_records (
  production_record_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
  liters DECIMAL(10,2) NOT NULL CHECK (liters >= 0),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debt table
CREATE TABLE IF NOT EXISTS debts (
  debt_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
  description TEXT,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debt_records table
CREATE TABLE IF NOT EXISTS debt_records (
  record_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID NOT NULL REFERENCES debts(debt_id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'payment', 'update', 'cancelled')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_debt_records_debt_id ON debt_records(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_records_action ON debt_records(action);


-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_production_records_client_id ON production_records(client_id);
CREATE INDEX IF NOT EXISTS idx_debts_client_id ON debts(client_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);

-- Function to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER trigger_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_production_records_updated_at
  BEFORE UPDATE ON production_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Function to log debt changes
CREATE OR REPLACE FUNCTION log_debt_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert when a new debt is created
  IF TG_OP = 'INSERT' THEN
    INSERT INTO debt_records (debt_id, action, amount, note, created_at)
    VALUES (NEW.debt_id, 'created', NEW.total, 'Debt created', NOW());

    RETURN NEW;
  END IF;

  -- Insert when a debt is updated
  IF TG_OP = 'UPDATE' THEN
    -- Detect status change
    IF NEW.status <> OLD.status THEN
      INSERT INTO debt_records (debt_id, action, amount, note, created_at)
      VALUES (NEW.debt_id, NEW.status, NEW.total, 'Status changed', NOW());
    ELSE
      -- Generic update
      INSERT INTO debt_records (debt_id, action, amount, note, created_at)
      VALUES (NEW.debt_id, 'update', NEW.total, 'Debt updated', NOW());
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger on debts table
CREATE OR REPLACE TRIGGER trigger_log_debt_changes
AFTER INSERT OR UPDATE ON debts
FOR EACH ROW
EXECUTE FUNCTION log_debt_changes();
