#!/bin/bash

echo "🧪 Testando Stat-Trade API"
echo "=============================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="http://localhost:5000/api"

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}Testing:${NC} $description"
    
    if [ -z "$data" ]; then
        curl -s -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null || echo "Error"
    else
        curl -s -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" | jq '.' 2>/dev/null || echo "Error"
    fi
    echo ""
}

# 1. Health Check
echo -e "${YELLOW}1️⃣  Health Check${NC}"
HEALTH=$(curl -s http://localhost:5000/api/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    exit 1
fi
echo ""

# 2. Register
echo -e "${YELLOW}2️⃣  Register User${NC}"
REGISTER_DATA='{
  "email": "teste@example.com",
  "password": "senha123",
  "firstName": "João",
  "lastName": "Silva"
}'
REGISTER=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "$REGISTER_DATA")
echo "$REGISTER" | jq '.'

TOKEN=$(echo "$REGISTER" | jq -r '.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}❌ Registration failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ User registered successfully${NC}"
echo "Token: $TOKEN"
echo ""

# 3. Get Trades (should be empty)
echo -e "${YELLOW}3️⃣  Get Trades${NC}"
curl -s -X GET "$API_URL/trades" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 4. Create Trade
echo -e "${YELLOW}4️⃣  Create Trade${NC}"
TRADE_DATA='{
  "symbol": "AAPL",
  "entryPrice": 150.00,
  "exitPrice": 155.00,
  "entryDate": "2024-01-02T10:00:00Z",
  "exitDate": "2024-01-02T14:00:00Z",
  "quantity": 10,
  "side": "BUY",
  "emotion": "confident",
  "notes": "Test trade"
}'
TRADE=$(curl -s -X POST "$API_URL/trades" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$TRADE_DATA")
echo "$TRADE" | jq '.'

TRADE_ID=$(echo "$TRADE" | jq -r '.id' 2>/dev/null)
echo ""

# 5. Get Performance Analytics
echo -e "${YELLOW}5️⃣  Get Performance${NC}"
curl -s -X GET "$API_URL/analytics/performance" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 6. Create Diary Entry
echo -e "${YELLOW}6️⃣  Create Diary Entry${NC}"
DIARY_DATA='{
  "title": "First trading day",
  "content": "Made my first trade successfully!",
  "emotion": "excited"
}'
curl -s -X POST "$API_URL/diary" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$DIARY_DATA" | jq '.'
echo ""

# 7. Get Insights
echo -e "${YELLOW}7️⃣  Get Insights${NC}"
curl -s -X GET "$API_URL/insights/suggestions" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 8. Get Settings
echo -e "${YELLOW}8️⃣  Get Settings${NC}"
curl -s -X GET "$API_URL/settings" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ All tests completed!${NC}"
echo -e "${GREEN}========================================${NC}"
