-- Crear tabla de historial de producción
CREATE TABLE IF NOT EXISTS production_records_history (
  production_record_id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
  liters DECIMAL(10,2) NOT NULL CHECK (liters >= 0),
  production_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para archivar registros de producción
CREATE OR REPLACE FUNCTION archive_production_records()
RETURNS void AS $$
BEGIN
  -- Pasar todos los registros cuya fecha sea menor o igual a la actual
  INSERT INTO production_records_history (
    production_record_id,
    client_id,
    liters,
    production_datetime,
    created_at,
    updated_at
  )
  SELECT
    production_record_id,
    client_id,
    liters,
    production_datetime,
    created_at,
    updated_at
  FROM production_records
  WHERE production_datetime <= NOW();

  -- Eliminar solo esos registros archivados
  DELETE FROM production_records
  WHERE production_datetime <= NOW();
END;
$$ LANGUAGE plpgsql;

