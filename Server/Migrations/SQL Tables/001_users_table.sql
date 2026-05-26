CREATE TABLE users(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    oauth BOOLEAN DEFAULT FALSE,
    oauth_provider TEXT,
    profile_image TEXT,
    phone_number TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    flag BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,

    CONSTRAINT valid_email 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

    CONSTRAINT auth_checker CHECK (
        (password IS NOT NULL) 
        OR 
        (oauth IS NOT NULL AND oauth_provider IS NOT NULL)
    ),

    CONSTRAINT flag_check CHECK (
        flag IS NOT TRUE OR flag_reason IS NOT NULL
    )
);