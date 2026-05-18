CREATE TABLE migrations(
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);