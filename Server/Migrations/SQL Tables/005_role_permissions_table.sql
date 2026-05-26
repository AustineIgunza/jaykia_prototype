CREATE TABLE role_permissions(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id SERIAL REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
    permission_id SERIAL REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_role_permissions UNIQUE(role_id,permission_id)
);