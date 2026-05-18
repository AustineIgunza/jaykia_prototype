CREATE TYPE feed_type AS ENUM('comment','issue','critique');

CREATE TABLE feedback(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    feedback_type feed_type NOT NULL,
    feedback TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);