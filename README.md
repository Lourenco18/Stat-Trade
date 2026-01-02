# Stat-Trade - Plataforma de Análise de Trading

Uma plataforma completa para análise, acompanhamento e otimização de operações de trading com IA Insights e integração TradingView.

## 🎯 Funcionalidades

### ✅ Import Automático
- Importar trades automaticamente do broker
- Suporte a múltiplas corretoras
- Sincronização contínua de dados

### 📊 Análise de Performance
- Taxa de vitória (Win Rate)
- Expectativa matemática
- ROI e métricas avançadas
- Profit Factor e curvas de equity

### 📈 Métricas Avançadas
- Gráficos interativos
- Relatórios detalhados
- Curvas de equity
- Performance por símbolo
- Estatísticas mensais

### 🧠 Psicologia / Diário Pessoal
- Registro de emoções antes/depois dos trades
- Notas e reflexões
- Análise de padrões comportamentais
- Histórico de sentimentos

### 📱 Web & Mobile
- Interface responsiva para web (React)
- App mobile completa (React Native)
- Sincronização em tempo real
- Acesso offline com cache

### 🤖 IA Insights
- Sugestões automáticas baseadas em dados
- Análise de padrões de trading
- Recomendações personalizadas
- Identificação de oportunidades

## 🛠 Tech Stack

### Backend
- **Framework**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: JWT
- **Real-time**: Socket.io
- **APIs**: TradingView, Broker APIs

### Frontend Web
- **Framework**: React 18
- **Routing**: React Router v6
- **State**: Zustand
- **UI**: Tailwind CSS
- **Charts**: Chart.js
- **HTTP**: Axios

### Mobile
- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **State**: Zustand
- **Charts**: React Native Chart Kit
- **Storage**: AsyncStorage

## 📋 Requisitos

- Node.js 16+
- PostgreSQL 12+
- npm ou yarn
- Expo CLI (para mobile)

## 🚀 Instalação e Setup

### 1. Clone o repositório

```bash
cd /Users/lourenco/Programming/Stat-Trade
```

### 2. Setup Backend

```bash
cd backend
npm install

# Crie arquivo .env
cp .env.example .env

# Configure as variáveis de ambiente
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=stat_trade
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret
# TRADINGVIEW_API_KEY=your_key
```

#### Criar Database PostgreSQL

```bash
psql -U postgres

CREATE DATABASE stat_trade;
\c stat_trade

# Execute o arquivo de migração
\i src/migrations/init.sql
```

#### Iniciar Backend

```bash
npm run dev  # Modo desenvolvimento
# ou
npm start   # Modo produção
```

### 3. Setup Frontend Web

```bash
cd ../frontend-web
npm install

# Inicie o servidor
npm run dev
```

A aplicação web estará disponível em `http://localhost:5173`

### 4. Setup Mobile

```bash
cd ../mobile
npm install

# Inicie o Expo
npm start

# Para iOS: pressione 'i'
# Para Android: pressione 'a'
# Para Web: pressione 'w'
```

## 📱 Funcionalidades por Plataforma

### Web
✅ Dashboard completo  
✅ Gestão avançada de trades  
✅ Diário pessoal  
✅ IA Insights detalhados  
✅ Gráficos e relatórios  
✅ Configurações de conta  

### Mobile
✅ Dashboard resumido  
✅ Novo trade rápido  
✅ Visualização de trades  
✅ Diário pessoal  
✅ IA Insights  
✅ Sincronização offline  

## 🔑 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo utilizador
- `POST /api/auth/login` - Login

### Trades
- `GET /api/trades` - Listar todos os trades
- `POST /api/trades` - Criar novo trade
- `PUT /api/trades/:id` - Atualizar trade
- `DELETE /api/trades/:id` - Apagar trade
- `POST /api/trades/import` - Importar trades em batch

### Analytics
- `GET /api/analytics/performance` - Estatísticas gerais
- `GET /api/analytics/equity-curve` - Curva de equity
- `GET /api/analytics/by-symbol` - Performance por símbolo
- `GET /api/analytics/monthly` - Estatísticas mensais

### Diary
- `GET /api/diary` - Listar entradas
- `POST /api/diary` - Criar entrada
- `PUT /api/diary/:id` - Atualizar entrada
- `DELETE /api/diary/:id` - Apagar entrada

### Insights
- `GET /api/insights/suggestions` - Sugestões IA
- `GET /api/insights/tradingview-analysis/:symbol` - Análise TradingView

## 🔐 Variáveis de Ambiente

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stat_trade
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
TRADINGVIEW_API_KEY=your_key
TRADINGVIEW_API_URL=https://api.tradingview.com
BROKER_API_KEY=your_broker_key
BROKER_API_URL=https://api.your-broker.com
```

## 📊 Estrutura Database

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP
);

-- Trades
CREATE TABLE trades (
  id UUID PRIMARY KEY,
  user_id UUID,
  symbol VARCHAR(20),
  entry_price DECIMAL,
  exit_price DECIMAL,
  quantity DECIMAL,
  side VARCHAR(10),
  profit_loss DECIMAL,
  roi DECIMAL,
  notes TEXT,
  emotion VARCHAR(50),
  created_at TIMESTAMP
);

-- Diary Entries
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY,
  user_id UUID,
  title VARCHAR(255),
  content TEXT,
  emotion VARCHAR(50),
  created_at TIMESTAMP
);

-- User Settings
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY,
  trading_style VARCHAR(50),
  risk_percentage DECIMAL,
  daily_loss_limit DECIMAL,
  trading_hours JSONB
);
```

## 🎓 Exemplos de Uso

### Registrar e Login
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "password": "senha123",
    "firstName": "João",
    "lastName": "Silva"
  }'
```

### Criar Trade
```bash
curl -X POST http://localhost:5000/api/trades \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "entryPrice": 150.00,
    "exitPrice": 155.00,
    "quantity": 10,
    "side": "BUY",
    "emotion": "confident",
    "notes": "Trade baseado em análise técnica"
  }'
```

### Obter Performance
```bash
curl -X GET http://localhost:5000/api/analytics/performance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📈 Dashboard Metrics

O dashboard mostra:
- **Win Rate**: Percentagem de trades vencedores
- **Total Profit**: Lucro/prejuízo total
- **Average ROI**: Retorno médio por trade
- **Total Trades**: Número total de operações
- **Profit Factor**: Razão entre ganhos e perdas
- **Max Profit/Loss**: Maior ganho e perda
- **Equity Curve**: Gráfico de evolução da conta

## 🚀 Deploy

### Heroku (Backend)
```bash
heroku login
heroku create stat-trade-api
git push heroku main
```

### Vercel (Frontend Web)
```bash
npm install -g vercel
vercel
```

### App Mobile
Exportar para App Store/Play Store via Expo:
```bash
eas build --platform all
eas submit
```

## 🐛 Troubleshooting

### Database Connection Error
- Verifique se PostgreSQL está rodando
- Confirme credenciais no .env
- Verifique porta 5432

### CORS Error
- Whitelist URLs em backend/src/server.js
- Verifique se frontend URL está configurada

### Mobile Connection
- Use IP da máquina em vez de localhost
- Verifique se firewall permite conexão

## 📞 Suporte

Para questões e feedback:
- Abra uma issue no GitHub
- Email: support@stat-trade.com

## 📄 Licença

MIT License - veja LICENSE.md

## 🎯 Roadmap

- [ ] Integração automática com múltiplas corretoras
- [ ] WebSocket em tempo real para atualizar preços
- [ ] ML avançado com TensorFlow
- [ ] Backtest de estratégias
- [ ] Social Trading (partilhar estratégias)
- [ ] API pública para bots de trading
- [ ] Suporte a criptomoedas
- [ ] Análise de Sentimento em redes sociais

---

Made with ❤️ for traders
