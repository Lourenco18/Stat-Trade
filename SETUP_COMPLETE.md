# ✅ Guia Completo de Setup e Testes

## 📋 Status Atual

✅ **Tudo Instalado e Pronto!**

- ✅ Node.js v25.2.1
- ✅ npm 11.7.0
- ✅ PostgreSQL@15 (rodando em localhost:5432)
- ✅ Database `stat_trade` criada
- ✅ Tabelas e dados de teste carregados
- ✅ Backend: dependências instaladas
- ✅ Frontend-web: dependências instaladas
- ✅ Mobile: dependências instaladas
- ✅ Arquivo `.env` configurado

---

## 🚀 Iniciar Development

### Opção 1: Iniciar Tudo (Recomendado)

Abra 3 terminais e execute em cada um:

**Terminal 1 - Backend:**
```bash
cd /Users/lourenco/Programming/Stat-Trade/backend
npm run dev
```

Esperado:
```
🎉 Server running on http://localhost:5000
📡 Socket.io listening on port 5000
🕐 Schedulers initialized
```

**Terminal 2 - Frontend:**
```bash
cd /Users/lourenco/Programming/Stat-Trade/frontend-web
npm run dev
```

Esperado:
```
VITE v5.0.8  ready in 234 ms
➜  Local:   http://localhost:5173/
```

**Terminal 3 (Opcional) - Mobile:**
```bash
cd /Users/lourenco/Programming/Stat-Trade/mobile
npm start
```

### Opção 2: Script de Inicialização

```bash
cd /Users/lourenco/Programming/Stat-Trade
./start-dev.sh
```

Escolha uma opção:
- 1) Backend apenas
- 2) Frontend apenas
- 3) Backend + Frontend
- 4) Backend + Frontend + Mobile
- 5) Mobile
- 6) Testes

---

## 🧪 Testar Manualmente

### 1️⃣ Health Check (Backend)

```bash
curl http://localhost:5000/api/health
```

**Esperado:**
```json
{
  "status": "ok",
  "message": "API is running"
}
```

### 2️⃣ Registar Utilizador

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123",
    "firstName": "João",
    "lastName": "Silva"
  }'
```

**Esperado:**
```json
{
  "user": {
    "userId": "...",
    "email": "teste@example.com",
    "firstName": "João",
    "lastName": "Silva"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Guardar o `token` para os próximos testes.

### 3️⃣ Adicionar Trade

```bash
TOKEN="seu_token_aqui"

curl -X POST http://localhost:5000/api/trades \
  -H "Authorization: Bearer $TOKEN" \
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
    "notes": "Trade de teste"
  }'
```

### 4️⃣ Ver Analytics

```bash
curl -X GET http://localhost:5000/api/analytics/performance \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado:**
```json
{
  "totalTrades": 1,
  "winningTrades": 1,
  "losingTrades": 0,
  "winRate": 100.0,
  "totalProfitLoss": 50.0,
  "averageROI": 3.33,
  "maxProfit": 50.0,
  "maxLoss": null,
  "averageWin": 50.0,
  "averageLoss": null,
  "profitFactor": null
}
```

---

## 🌐 Testar no Navegador

1. Abra http://localhost:5173
2. Clique em **"Criar Conta"**
3. Preencha:
   - Email: `teste@example.com`
   - Senha: `senha123`
   - Nome: `João`
   - Apelido: `Silva`
4. Clique em **"Registar"**
5. Deverá ser redirecionado para o Dashboard

### Testar Funcionalidades:

- ✅ **Dashboard**: Ver KPIs e gráficos
- ✅ **Trades**: Adicionar, editar, apagar trades
- ✅ **Diary**: Criar entradas com emoções
- ✅ **Insights**: Ver sugestões de IA
- ✅ **Settings**: Configurar preferências

---

## 🧪 Testes Automáticos

```bash
cd /Users/lourenco/Programming/Stat-Trade
./test-api.sh
```

Este script:
1. Verifica health check
2. Registra novo utilizador
3. Cria trade
4. Obter performance
5. Criar diary entry
6. Obter insights
7. Obter settings

**Esperado:**
```
Testing: 1️⃣  Health Check
✅ Backend is running

Testing: 2️⃣  Register User
...json output...

Testing: 3️⃣  Create Trade
...json output...

✅ All tests completed!
```

---

## 📊 Dados de Teste

A database foi carregada com dados de teste:

**Utilizador:**
```
Email: test@example.com
Password: senha123
```

**Trades de Exemplo:**
- AAPL: 2 trades, ROI +3.45%
- MSFT: 1 trade, ROI -1.32%
- BTC: 1 trade, ROI +5.00%
- EURUSD: 1 trade, ROI -2.50%

**Entradas de Diary:**
- 2 entradas pessoais com emoções

---

## 🔧 Troubleshooting

### Backend não inicia

```bash
# Verificar se porta 5000 está em uso
lsof -i :5000

# Se estiver, matar processo
kill -9 <PID>

# Ou mudar porta no .env
echo "PORT=5001" >> backend/.env
```

### Frontend não inicia

```bash
# Verificar dependências
cd frontend-web
npm install

# Limpar cache
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### PostgreSQL não está rodando

```bash
# Iniciar
brew services start postgresql@15

# Verificar status
pg_isready

# Parar (se necessário)
brew services stop postgresql@15
```

### Database não foi criada

```bash
# Recriar database
psql -U postgres -c "DROP DATABASE stat_trade;" 2>/dev/null || true
psql -U postgres -c "CREATE DATABASE stat_trade;"
psql -U postgres -d stat_trade -f backend/src/migrations/init.sql
```

---

## 📚 Documentação Adicional

- [API_EXAMPLES.md](API_EXAMPLES.md) - 19 exemplos de requests
- [README.md](README.md) - Visão geral do projeto
- [QUICKSTART.md](QUICKSTART.md) - Início rápido
- [DEVELOPMENT.md](DEVELOPMENT.md) - Guia de desenvolvimento
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Resumo técnico
- [POSTGRES_SETUP.md](POSTGRES_SETUP.md) - Setup PostgreSQL

---

## 📱 Testar Mobile (Expo)

1. Instalar **Expo Go** no telemóvel (App Store ou Google Play)
2. Executar: `cd mobile && npm start`
3. Escanear o QR code com Expo Go
4. App abre no telemóvel

---

## ✨ Status Final

| Componente | Status | URL |
|-----------|--------|-----|
| Backend | ✅ Rodando | http://localhost:5000 |
| Frontend | ✅ Rodando | http://localhost:5173 |
| Database | ✅ Pronta | localhost:5432 |
| Mobile | ✅ Pronto | Expo |

**🎉 Tudo pronto para começar!**

Qualquer dúvida, consulta os ficheiros de documentação acima.
