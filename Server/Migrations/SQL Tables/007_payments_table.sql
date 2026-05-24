CREATE TYPE pay_method AS ENUM('bank','mpesa');

CREATE TABLE payments(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES booking(id) ON DELETE CASCADE NOT NULL,
    amount INT,
    payment_method pay_method NOT NULL,
    phone_number TEXT,
    transaction_reference TEXT,
    paid_at TIMESTAMP,

    -- Constraint for M-Pesa
    CONSTRAINT mpesa_fields_check CHECK (
        (payment_method != 'mpesa') OR 
        (phone_number IS NOT NULL AND transaction_reference IS NOT NULL)
    ),

    -- Constraint for Card
    CONSTRAINT card_fields_check CHECK (
        (payment_method != 'bank') OR 
        (transaction_reference IS NOT NULL)
    )
);