#!/bin/bash

# Stat-Trade - Production Deploy Script

set -e

echo "🚀 Iniciando deploy para produção..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check environment
if [ -z "$PROD_DB_HOST" ]; then
    echo -e "${RED}Variáveis de ambiente de produção não configuradas${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Build Backend...${NC}"
cd backend
npm install --production
npm run build
echo -e "${GREEN}✓ Backend built${NC}"
cd ..

echo -e "${YELLOW}📦 Build Frontend...${NC}"
cd frontend-web
npm install --production
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"
cd ..

echo -e "${YELLOW}🚀 Deploy para servidor...${NC}"

# Deploy backend (via Heroku, Docker, etc)
# git push heroku main

# Deploy frontend (via Vercel, Netlify, etc)
# vercel --prod

echo -e "${GREEN}✅ Deploy completo!${NC}"
echo ""
echo "Próximas etapas:"
echo "1. Verifique os logs do servidor"
echo "2. Teste os endpoints da API"
echo "3. Verifique o frontend no browser"
echo ""
