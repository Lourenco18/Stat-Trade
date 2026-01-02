-- Add stop_loss and take_profit columns to trades
ALTER TABLE trades
    ADD COLUMN IF NOT EXISTS stop_loss DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS take_profit DECIMAL(15, 2);
