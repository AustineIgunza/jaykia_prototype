CREATE TABLE user_roles(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL, 
    role_id SERIAL REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_user_role UNIQUE(user_id,role_id)
);