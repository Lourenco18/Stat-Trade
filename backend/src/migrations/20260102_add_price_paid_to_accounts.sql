-- Add price_paid column to accounts for tracking account purchase cost
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS price_paid DECIMAL(15, 2) DEFAULT 0;
