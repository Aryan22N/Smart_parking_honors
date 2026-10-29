-- V1: Create schema for Smart Parking Management System

CREATE TABLE IF NOT EXISTS parking_slots (
    id BIGSERIAL PRIMARY KEY,
    slot_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_slot_status CHECK (status IN ('AVAILABLE', 'OCCUPIED'))
);

CREATE TABLE IF NOT EXISTS parking_sessions (
    id BIGSERIAL PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL,
    parking_slot_id BIGINT NOT NULL,
    entry_time TIMESTAMPTZ NOT NULL,
    exit_time TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    total_fee NUMERIC(10, 2) DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parking_session_slot FOREIGN KEY (parking_slot_id) REFERENCES parking_slots(id) ON DELETE RESTRICT,
    CONSTRAINT chk_session_status CHECK (status IN ('ACTIVE', 'COMPLETED')),
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('UNPAID', 'PAID'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parking_slots_status ON parking_slots(status);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_status ON parking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_vehicle ON parking_sessions(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_slot_id ON parking_sessions(parking_slot_id);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_entry_time ON parking_sessions(entry_time);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_exit_time ON parking_sessions(exit_time);

-- Prevent concurrent active sessions for the same vehicle at database level
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_vehicle_session ON parking_sessions (vehicle_number) WHERE status = 'ACTIVE';
