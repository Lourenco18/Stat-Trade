# 🚀 Stat-Trade - Quick Start Guide

## O que foi criado?

Uma plataforma completa de trading com:

### ✅ Backend (Node.js/Express)
- Autenticação JWT
- API RESTful completa
- PostgreSQL database
- Integração TradingView
- Tarefas agendadas (insights automáticos)
- Real-time updates com Socket.io

### ✅ Frontend Web (React)
- Dashboard com gráficos
- Gestão de trades
- Diário pessoal
- IA Insights
- Configurações de conta
- Interface responsiva

### ✅ Mobile App (React Native)
- Telas principais
- Registro rápido de trades
- Dashboard compacto
- Sincronização com backend

## ⚡ Iniciar em 3 passos

### 1. Setup Database
```bash
# Criar database PostgreSQL
psql -U postgres
CREATE DATABASE stat_trade;
\c stat_trade
\i /Users/lourenco/Programming/Stat-Trade/backend/src/migrations/init.sql
```

### 2. Backend (Terminal 1)
```bash
cd /Users/lourenco/Programming/Stat-Trade/backend
npm install
cp .env.example .env
# Configure o .env com suas credenciais
npm run dev
```

### 3. Frontend Web (Terminal 2)
```bash
cd /Users/lourenco/Programming/Stat-Trade/frontend-web
npm install
npm run dev
```

Aceda em: http://localhost:5173

### 4. Mobile (Terminal 3 - Opcional)
```bash
cd /Users/lourenco/Programming/Stat-Trade/mobile
npm install
npm start
```

## 🔑 Configuração .env Backend

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stat_trade
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRE=7d

# TradingView (obter em https://www.tradingview.com/api/)
TRADINGVIEW_API_KEY=sua_chave_api
TRADINGVIEW_API_URL=https://api.tradingview.com

# Broker (exemplo)
BROKER_API_KEY=sua_chave_broker
BROKER_API_URL=https://api.seu-broker.com
```

## 📊 Funcionalidades Implementadas

### Import Automático
- Endpoint `/api/trades/import` para importar em batch
- Cálculo automático de P&L e ROI

### Análise de Performance
- Win Rate, ROI médio, Profit Factor
- Curva de equity
- Performance por símbolo
- Estatísticas mensais

### Métricas Avançadas
- Gráficos interativos (Chart.js)
- Estatísticas detalhadas
- Histórico de operações

### Psicologia / Diário
- Registro de emoções (confiante, nervoso, animado, calmo)
- Notas por trade
- Reflexões pessoais

### IA Insights
- Análise automática de padrões
- Recomendações baseadas em dados
- Alertas de performance

### Web & Mobile
- Layout responsivo
- Sincronização de dados
- Autenticação JWT

## 🧪 Testar Endpoints (Curl/Postman)

### Registrar
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

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "password": "senha123"
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
    "entryDate": "2024-01-02T10:00:00Z",
    "exitDate": "2024-01-02T14:00:00Z",
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

## 📁 Estrutura de Pastas

```
Stat-Trade/
├── backend/
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── middleware/     # Auth, error handling
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── migrations/     # Database schemas
│   └── package.json
│
├── frontend-web/
│   ├── src/
│   │   ├── pages/          # Dashboard, Trades, Diary, Insights
│   │   ├── components/     # Layout, reusable components
│   │   ├── stores/         # Zustand auth store
│   │   ├── api/            # API clients
│   │   └── main.jsx
│   └── package.json
│
├── mobile/
│   ├── src/
│   │   ├── screens/        # Register, Dashboard, Trades, Insights
│   │   ├── stores/         # Zustand auth store
│   │   ├── api/            # API clients
│   │   └── Navigation.js
│   └── package.json
│
├── README.md               # Documentação completa
├── DEVELOPMENT.md          # Guia de desenvolvimento
└── docker-compose.yml      # Para rodar com Docker
```

## 🔗 Rotas Disponíveis

### Auth
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login

### Trades
- `GET /api/trades` - Listar todos
- `POST /api/trades` - Criar novo
- `PUT /api/trades/:id` - Atualizar
- `DELETE /api/trades/:id` - Apagar
- `POST /api/trades/import` - Importar em batch

### Analytics
- `GET /api/analytics/performance` - KPIs
- `GET /api/analytics/equity-curve` - Curva de equity
- `GET /api/analytics/by-symbol` - Por símbolo
- `GET /api/analytics/monthly` - Mensais

### Diary
- `GET /api/diary` - Listar
- `POST /api/diary` - Criar
- `PUT /api/diary/:id` - Atualizar
- `DELETE /api/diary/:id` - Apagar

### Insights
- `GET /api/insights/suggestions` - IA Insights
- `GET /api/insights/tradingview-analysis/:symbol` - Análise TradingView

### Settings
- `GET /api/settings` - Obter
- `PUT /api/settings` - Atualizar

## 🐛 Troubleshooting

### Erro de conexão com PostgreSQL
1. Verifique se PostgreSQL está rodando: `psql -U postgres`
2. Crie a database: `CREATE DATABASE stat_trade;`
3. Execute as migrações: `psql -U postgres -d stat_trade < backend/src/migrations/init.sql`

### CORS Error no Frontend
- Verifique se URLs estão whitelist em `backend/src/server.js`

### Mobile não conecta
- Use IP da máquina em vez de localhost
- Exemplo: `API_URL = "http://192.168.1.100:5000/api"`

## 📚 Recursos Úteis

- [Express.js](https://expressjs.com)
- [React](https://react.dev)
- [React Native](https://reactnative.dev)
- [TradingView API](https://www.tradingview.com)
- [PostgreSQL](https://www.postgresql.org)

## 🎯 Próximos Passos

1. Teste os endpoints com Postman
2. Crie uma conta no frontend
3. Adicione alguns trades de teste
4. Verifique o dashboard
5. Customize conforme suas necessidades

## 💡 Dicas de Customização

### Adicionar nova métrica
1. Backend: Adicionar query em `analytics.js`
2. Frontend: Criar novo card no Dashboard
3. Mobile: Adicionar em DashboardScreen

### Integrar com broker
1. Criar serviço em `backend/src/services/brokerService.js`
2. Implementar import automático
3. Usar Socket.io para live updates

### Melhorar IA Insights
1. Adicionar mais regras em `schedulerService.js`
2. Integrar machine learning com TensorFlow
3. Analisar padrões emocionais

---

**Pronto para usar!** 🚀

Qualquer dúvida, consulte README.md ou DEVELOPMENT.md
