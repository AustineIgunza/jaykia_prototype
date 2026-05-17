CREATE TABLE users(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT,
    oauth TEXT,
    oauth_provider TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT valid_email 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

    CONSTRAINT auth_checker
        CHECK (LENGTH(password) > 0) OR (LENGTH(oauth) > 0 AND LENGTH(oauth_provider))
);