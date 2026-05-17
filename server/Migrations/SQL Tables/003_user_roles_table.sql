CREATE TABLE user_roles(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id), 
    role_id UUID REFERENCES roles(id)
);