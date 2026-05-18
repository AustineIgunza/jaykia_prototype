CREATE TYPE refund_approval AS ENUM('pending','accepted','rejected');

CREATE TABLE refunds(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES booking(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    approved refund_approval,
    created_at TIMESTAMP DEFAULT NOW(),
    cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at TIMESTAMP
);