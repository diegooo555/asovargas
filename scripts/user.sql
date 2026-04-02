-- Habilitar extensión para UUID (solo una vez en la BD)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear tabla
CREATE TABLE
    public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now ()
    );