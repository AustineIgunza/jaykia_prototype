CREATE TABLE ratings(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES booking(id) ON DELETE CASCADE NOT NULL,
    rating INT NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_rating_per_trip UNIQUE(user_id,booking_id)
);