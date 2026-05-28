CREATE TYPE pay_method AS ENUM('bank','mobile');
CREATE TYPE payment_status AS ENUM('pending','paid','failed');
CREATE TYPE quote_type AS ENUM('invoice','payment');

CREATE TABLE payments(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES booking(id) ON DELETE CASCADE NOT NULL,
    amount INT,
    quote quote_type,
    payment_method pay_method,
    payment_status payment_status DEFAULT 'pending',
    transaction_reference TEXT,
    paid_at TIMESTAMP,
);