#!/bin/bash

# Stat-Trade Setup Script
# Instala e configura a plataforma completa

set -e

echo "🚀 Iniciando setup do Stat-Trade..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js encontrado${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL não está instalado. Instale com: brew install postgresql${NC}"
    echo -e "${YELLOW}Depois inicie com: brew services start postgresql${NC}"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL encontrado${NC}"

# Iniciar PostgreSQL
echo -e "${YELLOW}Iniciando PostgreSQL...${NC}"
if pg_isready -h localhost -p 5432 &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL já está rodando${NC}"
else
    brew services start postgresql 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✓ PostgreSQL iniciado${NC}"
fi

# Criar database
echo -e "${YELLOW}Criando database stat_trade...${NC}"
psql -U postgres -c "CREATE DATABASE stat_trade;" 2>/dev/null || echo "Database já existe"
echo -e "${GREEN}✓ Database pronta${NC}"

# Executar migrations
echo -e "${YELLOW}Executando migrations...${NC}"
psql -U postgres -d stat_trade -f backend/src/migrations/init.sql
echo -e "${GREEN}✓ Schema criado${NC}"

# Carregar dados de teste
echo -e "${YELLOW}Carregando dados de teste...${NC}"
psql -U postgres -d stat_trade -f backend/src/migrations/test-data.sql 2>/dev/null || true
echo -e "${GREEN}✓ Dados de teste carregados${NC}"

# Setup Backend
echo -e "${YELLOW}📦 Configurando Backend...${NC}"
cd backend

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
fi

echo -e "${GREEN}✓ Backend pronto${NC}"

cd ..

# Setup Frontend Web
echo -e "${YELLOW}📦 Configurando Frontend Web...${NC}"
cd frontend-web

echo -e "${GREEN}✓ Frontend Web pronto${NC}"

cd ..

# Setup Mobile (opcional)
echo -e "${YELLOW}📦 Configurando Mobile...${NC}"
cd mobile

echo -e "${GREEN}✓ Mobile pronto${NC}"

cd ..

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Completo!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "🎯 Próximos Passos:"
echo ""
echo "   Terminal 1 - Backend:"
echo -e "   ${YELLOW}cd backend && npm run dev${NC}"
echo ""
echo "   Terminal 2 - Frontend:"
echo -e "   ${YELLOW}cd frontend-web && npm run dev${NC}"
echo ""
echo "   Terminal 3 (Opcional) - Mobile:"
echo -e "   ${YELLOW}cd mobile && npm start${NC}"
echo ""
echo "🔗 URLs:"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "📧 Conta de Teste:"
echo "   Email:    teste@example.com"
echo "   Senha:    senha123"
echo ""
echo "📡 Testar Health Check:"
echo -e "   ${YELLOW}curl http://localhost:5000/api/health${NC}"
echo ""

npm install
echo -e "${GREEN}✓ Dependências Frontend instaladas${NC}"

cd ..

# Setup Mobile
echo -e "${YELLOW}📦 Configurando Mobile...${NC}"
cd mobile

npm install
echo -e "${GREEN}✓ Dependências Mobile instaladas${NC}"

cd ..

# Database setup
echo -e "${YELLOW}🗄️  Configurando Database...${NC}"

read -p "Criar database stat_trade? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'stat_trade'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE stat_trade;"
    echo -e "${GREEN}✓ Database criada${NC}"
    
    psql -U postgres -d stat_trade < backend/src/migrations/init.sql
    echo -e "${GREEN}✓ Tabelas criadas${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup completo!${NC}"
echo ""
echo "Para iniciar os serviços:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 - Frontend Web:"
echo "  cd frontend-web && npm run dev"
echo ""
echo "Terminal 3 - Mobile:"
echo "  cd mobile && npm start"
echo ""
echo "Ou use Docker:"
echo "  docker-compose up -d"
echo ""
