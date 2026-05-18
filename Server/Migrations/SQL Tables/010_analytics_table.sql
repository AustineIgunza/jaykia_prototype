CREATE TYPE analytic_type AS ENUM('users','sales');

CREATE TABLE analytics(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analytics_type analytic_type NOT NULL,
    aggregate_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_analytic_type UNIQUE(analytics_type,created_at)
);