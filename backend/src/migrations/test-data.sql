-- Script de dados de teste para Stat-Trade

-- Inserir utilizador de teste
INSERT INTO users (id, email, password, first_name, last_name, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'trader@example.com', '$2b$10$abcdefghijk', 'João', 'Silva', NOW());

-- Inserir trades de teste
INSERT INTO trades (id, user_id, symbol, entry_price, exit_price, entry_date, exit_date, quantity, side, profit_loss, roi, notes, emotion, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'AAPL', 150.00, 155.00, '2024-01-01 10:00:00', '2024-01-01 14:00:00', 10, 'BUY', 50.00, 3.33, 'Trade técnico', 'confident', NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'MSFT', 380.00, 375.00, '2024-01-01 11:00:00', '2024-01-01 15:00:00', 5, 'BUY', -25.00, -1.32, 'Saída por stop loss', 'nervous', NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'GOOGL', 140.00, 145.00, '2024-01-02 09:30:00', '2024-01-02 13:00:00', 8, 'BUY', 40.00, 3.57, 'Breakout técnico', 'confident', NOW()),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'TSLA', 245.00, 250.00, '2024-01-02 10:15:00', '2024-01-02 14:30:00', 4, 'BUY', 20.00, 2.04, 'Pullback bullish', 'calm', NOW()),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'AMZN', 175.00, 170.00, '2024-01-02 11:00:00', '2024-01-02 15:00:00', 6, 'BUY', -30.00, -2.86, 'Reversão inesperada', 'nervous', NOW());

-- Inserir entradas de diário de teste
INSERT INTO diary_entries (id, user_id, title, content, emotion, trade_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Primeiro dia de trading', 'Comecei o dia com confiança. Fiz 3 trades bem sucedidos e 2 perdedores. Aprendi sobre disciplina e gestão de risco.', 'excited', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Lições de hoje', 'Dois trades perdedores me fizeram pensar. Preciso melhorar minha entrada e parar de tradar quando estou cansado.', 'calm', NULL, NOW());

-- Inserir configurações de teste
INSERT INTO user_settings (user_id, trading_style, risk_percentage, daily_loss_limit, trading_hours, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'day_trading', 2.00, 500.00, '{"start": "09:30", "end": "16:00"}', NOW());

-- Inserir insights de teste
INSERT INTO insights (user_id, type, message, data, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'positive', 'Sua taxa de vitória está em 60%. Continue com a estratégia atual!', '{"winRate": 0.60}', NOW()),
('550e8400-e29b-41d4-a716-446655440000', 'warning', 'Você teve uma perda significativa em AMZN. Considere revisar sua estratégia para esse símbolo.', '{"symbol": "AMZN", "loss": -30}', NOW());
