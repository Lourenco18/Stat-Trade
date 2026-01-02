-- Add leverage column to accounts
ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS leverage DECIMAL(10,2);
