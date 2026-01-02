# 📡 Exemplos de Uso da API - Stat-Trade

## 🚀 Início Rápido

### 1. Registrar Utilizador

**Request:**
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

**Response:**
```json
{
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "trader@example.com",
    "firstName": "João",
    "lastName": "Silva"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "password": "senha123"
  }'
```

**Response:**
```json
{
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "trader@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📊 Trades Management

### 3. Criar Trade

**Request:**
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
    "notes": "Trade baseado em análise técnica do gráfico 1h"
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "symbol": "AAPL",
  "entry_price": "150.00",
  "exit_price": "155.00",
  "quantity": "10",
  "side": "BUY",
  "profit_loss": 50.00,
  "roi": 3.33,
  "emotion": "confident",
  "notes": "Trade baseado em análise técnica do gráfico 1h",
  "created_at": "2024-01-02T15:00:00Z"
}
```

### 4. Listar Todos os Trades

**Request:**
```bash
curl -X GET http://localhost:5000/api/trades \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "symbol": "AAPL",
    "entry_price": "150.00",
    "exit_price": "155.00",
    "quantity": "10",
    "side": "BUY",
    "profit_loss": 50.00,
    "roi": 3.33,
    "emotion": "confident"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "symbol": "MSFT",
    "entry_price": "380.00",
    "exit_price": "375.00",
    "quantity": "5",
    "side": "BUY",
    "profit_loss": -25.00,
    "roi": -1.32,
    "emotion": "nervous"
  }
]
```

### 5. Atualizar Trade

**Request:**
```bash
curl -X PUT http://localhost:5000/api/trades/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "entryPrice": 150.00,
    "exitPrice": 156.00,
    "entryDate": "2024-01-02T10:00:00Z",
    "exitDate": "2024-01-02T14:30:00Z",
    "quantity": 10,
    "side": "BUY",
    "notes": "Atualizado - Target atingido"
  }'
```

### 6. Apagar Trade

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/trades/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "message": "Trade deleted successfully"
}
```

### 7. Importar Trades em Batch

**Request:**
```bash
curl -X POST http://localhost:5000/api/trades/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trades": [
      {
        "symbol": "AAPL",
        "entryPrice": 150.00,
        "exitPrice": 155.00,
        "entryDate": "2024-01-01T10:00:00Z",
        "exitDate": "2024-01-01T14:00:00Z",
        "quantity": 10,
        "side": "BUY",
        "notes": "Trade 1"
      },
      {
        "symbol": "MSFT",
        "entryPrice": 380.00,
        "exitPrice": 375.00,
        "entryDate": "2024-01-02T10:00:00Z",
        "exitDate": "2024-01-02T14:00:00Z",
        "quantity": 5,
        "side": "BUY",
        "notes": "Trade 2"
      }
    ]
  }'
```

**Response:**
```json
{
  "message": "2 trades imported",
  "trades": [
    { "id": "...", "symbol": "AAPL", ... },
    { "id": "...", "symbol": "MSFT", ... }
  ]
}
```

---

## 📈 Analytics

### 8. Obter Performance

**Request:**
```bash
curl -X GET http://localhost:5000/api/analytics/performance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "totalTrades": 5,
  "winningTrades": 3,
  "losingTrades": 2,
  "winRate": 60.0,
  "totalProfitLoss": 85.0,
  "averageROI": 2.92,
  "maxProfit": 50.0,
  "maxLoss": -30.0,
  "averageWin": 45.0,
  "averageLoss": -27.5,
  "profitFactor": 1.64
}
```

### 9. Obter Curva de Equity

**Request:**
```bash
curl -X GET http://localhost:5000/api/analytics/equity-curve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  { "entry_date": "2024-01-01T10:00:00Z", "cumulative_profit": 50.00 },
  { "entry_date": "2024-01-01T11:00:00Z", "cumulative_profit": 25.00 },
  { "entry_date": "2024-01-02T09:30:00Z", "cumulative_profit": 65.00 },
  { "entry_date": "2024-01-02T10:15:00Z", "cumulative_profit": 85.00 },
  { "entry_date": "2024-01-02T11:00:00Z", "cumulative_profit": 55.00 }
]
```

### 10. Performance por Símbolo

**Request:**
```bash
curl -X GET http://localhost:5000/api/analytics/by-symbol \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "symbol": "AAPL",
    "total": 2,
    "wins": 2,
    "total_profit": 100.00,
    "avg_roi": 3.45
  },
  {
    "symbol": "MSFT",
    "total": 1,
    "wins": 0,
    "total_profit": -25.00,
    "avg_roi": -1.32
  }
]
```

### 11. Estatísticas Mensais

**Request:**
```bash
curl -X GET http://localhost:5000/api/analytics/monthly \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "month": "2024-01-01T00:00:00Z",
    "total_trades": 5,
    "monthly_profit": 85.00,
    "avg_roi": 2.92
  }
]
```

---

## 📝 Diary (Diário Pessoal)

### 12. Criar Entrada

**Request:**
```bash
curl -X POST http://localhost:5000/api/diary \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Primeiro dia de trading",
    "content": "Comecei o dia com confiança. Fiz 3 trades bem sucedidos e 2 perdedores. Aprendi sobre disciplina e gestão de risco.",
    "emotion": "excited",
    "tradeId": null
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Primeiro dia de trading",
  "content": "Comecei o dia com confiança...",
  "emotion": "excited",
  "trade_id": null,
  "created_at": "2024-01-02T16:00:00Z"
}
```

### 13. Listar Entradas

**Request:**
```bash
curl -X GET http://localhost:5000/api/diary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "title": "Primeiro dia de trading",
    "content": "Comecei o dia com confiança...",
    "emotion": "excited",
    "created_at": "2024-01-02T16:00:00Z"
  }
]
```

### 14. Atualizar Entrada

**Request:**
```bash
curl -X PUT http://localhost:5000/api/diary/550e8400-e29b-41d4-a716-446655440010 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Primeiro dia de trading - ATUALIZADO",
    "content": "Novo conteúdo da entrada...",
    "emotion": "calm"
  }'
```

### 15. Apagar Entrada

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/diary/550e8400-e29b-41d4-a716-446655440010 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🤖 IA Insights

### 16. Obter Sugestões IA

**Request:**
```bash
curl -X GET http://localhost:5000/api/insights/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "insights": [
    {
      "type": "positive",
      "message": "Sua taxa de vitória está em 60%. Continue com a estratégia atual!"
    },
    {
      "type": "warning",
      "message": "Sua win rate é 60.0%. Considere revisar sua estratégia de entrada."
    }
  ],
  "recommendations": [
    "AAPL tem performado bem (2 trades, avg ROI: 3.45%)",
    "MSFT teve performance negativa (-25.00$), considere evitar"
  ],
  "performanceLevel": "Excellent"
}
```

### 17. Análise TradingView

**Request:**
```bash
curl -X GET http://localhost:5000/api/insights/tradingview-analysis/AAPL \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "symbol": "AAPL",
  "recommendation": "BUY",
  "strength": 75,
  "technicalAnalysis": {
    "trend": "Uptrend",
    "support": 150.50,
    "resistance": 155.00
  },
  "indicators": {
    "rsi": 65,
    "macd": "Positive",
    "movingAverages": "Bullish"
  }
}
```

---

## ⚙️ Settings

### 18. Obter Configurações

**Request:**
```bash
curl -X GET http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "tradingStyle": "day_trading",
  "riskPercentage": 2.0,
  "dailyLossLimit": 500.0,
  "tradingHours": {
    "start": "09:30",
    "end": "16:00"
  }
}
```

### 19. Atualizar Configurações

**Request:**
```bash
curl -X PUT http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tradingStyle": "swing_trading",
    "riskPercentage": 3.0,
    "dailyLossLimit": 1000.0,
    "tradingHours": {
      "start": "09:00",
      "end": "17:00"
    }
  }'
```

**Response:**
```json
{
  "tradingStyle": "swing_trading",
  "riskPercentage": 3.0,
  "dailyLossLimit": 1000.0,
  "tradingHours": {
    "start": "09:00",
    "end": "17:00"
  }
}
```

---

## 🧪 Postman Collection

**Importar no Postman:**

```json
{
  "info": {
    "name": "Stat-Trade API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ]
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login"
          }
        }
      ]
    },
    {
      "name": "Trades",
      "item": [
        {
          "name": "List All",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/trades",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ]
          }
        },
        {
          "name": "Create",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/trades"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## 💡 Dicas de Uso

### Headers Sempre Necessários (Routes Protegidas)
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Obter Token
1. Registre um utilizador: `/api/auth/register`
2. ou Faça login: `/api/auth/login`
3. Use o `token` da resposta em todas as requests

### Formato de Datas
```
ISO 8601: "2024-01-02T10:00:00Z"
```

### Filtros Opcionais
Algumas requests podem aceitar query params:
```bash
GET /api/trades?symbol=AAPL&limit=10&offset=0
GET /api/analytics/equity-curve?from=2024-01-01&to=2024-01-31
```

---

## 🚨 Status Codes

| Code | Significado |
|------|------------|
| 200 | OK - Sucesso |
| 201 | Created - Criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido |
| 404 | Not Found - Recurso não encontrado |
| 500 | Server Error - Erro no servidor |

---

Pronto para usar! 🚀
