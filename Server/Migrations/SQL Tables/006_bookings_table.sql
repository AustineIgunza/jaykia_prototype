CREATE TYPE transport_mode AS ENUM('road','railway','flight');
CREATE TYPE trip_status AS ENUM('complete','ongoing','pending');

CREATE TABLE booking(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    pickup_location TEXT NOT NULL,
    drop_off_location TEXT NOT NULL,
    no_of_passengers INT NOT NULL,
    no_of_luggage_items INT NOT NULL,
    mode_of_transport transport_mode NOT NULL,
    flight_number TEXT,
    departure_time TIMESTAMP,
    arrival_time TIMESTAMP,
    cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at TIMESTAMP,
    reason TEXT NOT NULL DEFAULT '',
    trip_status trip_status NOT NULL DEFAULT 'pending',

    CONSTRAINT chk_flight_details CHECK (
        mode_of_transport != 'flight' OR 
        (flight_number IS NOT NULL AND flight_departure IS NOT NULL AND flight_arrival IS NOT NULL)
    ),

    CONSTRAINT chk_cancellation_details CHECK (
        NOT cancelled OR 
        (cancelled_at IS NOT NULL AND reason != '')
    )
);