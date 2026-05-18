CREATE TABLE user_permissions(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    permission_id SERIAL REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_user_permissions UNIQUE(user_id,permission_id)
);