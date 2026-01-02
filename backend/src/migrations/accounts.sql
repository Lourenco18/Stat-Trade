-- Migration para adicionar sistema de contas de prop firms

-- Criar tabela de contas
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    prop_firm VARCHAR(255),
    account_type VARCHAR(50) NOT NULL, -- 'evaluation', 'funded', 'personal'
    stage VARCHAR(50), -- 'phase1', 'phase2', 'funded'
    initial_balance DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    profit_target DECIMAL(15, 2),
    daily_loss_limit DECIMAL(15, 2),
    max_loss_limit DECIMAL(15, 2),
    max_drawdown DECIMAL(15, 2),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'passed', 'failed', 'funded'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna account_id na tabela trades
ALTER TABLE trades ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON trades(account_id);

-- Criar tabela de histórico de drawdown diário
CREATE TABLE IF NOT EXISTS daily_drawdown (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    starting_balance DECIMAL(15, 2) NOT NULL,
    ending_balance DECIMAL(15, 2) NOT NULL,
    daily_pnl DECIMAL(15, 2) NOT NULL,
    drawdown_percent DECIMAL(5, 2),
    max_drawdown_percent DECIMAL(5, 2),
    breached_daily_limit BOOLEAN DEFAULT FALSE,
    breached_max_limit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_drawdown_account ON daily_drawdown(account_id);
CREATE INDEX IF NOT EXISTS idx_daily_drawdown_date ON daily_drawdown(date);
