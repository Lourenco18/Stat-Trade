#!/bin/bash

# Script para iniciar todos os serviços do Stat-Trade
# Uso: ./start-dev.sh

set -e

echo "🚀 Iniciando Stat-Trade Development"
echo "===================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Função para mostrar menu
show_menu() {
    echo -e "${YELLOW}Escolha uma opção:${NC}"
    echo "1) Iniciar Backend apenas"
    echo "2) Iniciar Frontend apenas"
    echo "3) Iniciar Backend + Frontend"
    echo "4) Iniciar tudo (Backend + Frontend + Mobile)"
    echo "5) Iniciar Mobile"
    echo "6) Testes (Health + API)"
    echo ""
    read -p "Opção (1-6): " option
}

# Função para iniciar backend
start_backend() {
    echo -e "${YELLOW}📡 Iniciando Backend em http://localhost:5000${NC}"
    echo "   (Pressione Ctrl+C para parar)"
    echo ""
    cd /Users/lourenco/Programming/Stat-Trade/backend
    npm run dev
}

# Função para iniciar frontend
start_frontend() {
    echo -e "${YELLOW}🌐 Iniciando Frontend em http://localhost:5173${NC}"
    echo "   (Pressione Ctrl+C para parar)"
    echo ""
    cd /Users/lourenco/Programming/Stat-Trade/frontend-web
    npm run dev
}

# Função para iniciar mobile
start_mobile() {
    echo -e "${YELLOW}📱 Iniciando Mobile com Expo${NC}"
    echo "   (Escaneia o QR code com Expo Go)"
    echo ""
    cd /Users/lourenco/Programming/Stat-Trade/mobile
    npm start
}

# Função para testar
run_tests() {
    echo -e "${YELLOW}🧪 Testando API${NC}"
    echo ""
    
    # Esperar backend estar pronto
    sleep 3
    
    # Health check
    echo "Verificando health check..."
    if curl -s http://localhost:5000/api/health | grep -q "ok"; then
        echo -e "${GREEN}✅ Backend respondendo${NC}"
    else
        echo -e "${RED}❌ Backend não respondendo${NC}"
        return 1
    fi
    
    echo ""
    echo "Executando testes completos..."
    bash /Users/lourenco/Programming/Stat-Trade/test-api.sh
}

# Menu principal
if [ $# -eq 0 ]; then
    show_menu
else
    option=$1
fi

case $option in
    1)
        start_backend
        ;;
    2)
        start_frontend
        ;;
    3)
        echo -e "${YELLOW}Abrindo 2 terminais para Backend e Frontend...${NC}"
        echo ""
        echo "Terminal 1 - Backend:"
        start_backend &
        BACKEND_PID=$!
        
        sleep 3
        
        echo ""
        echo "Terminal 2 - Frontend:"
        start_frontend &
        FRONTEND_PID=$!
        
        wait
        ;;
    4)
        echo -e "${YELLOW}Abrindo 3 terminais...${NC}"
        
        echo "Terminal 1 - Backend:"
        start_backend &
        BACKEND_PID=$!
        
        sleep 3
        
        echo ""
        echo "Terminal 2 - Frontend:"
        start_frontend &
        FRONTEND_PID=$!
        
        sleep 3
        
        echo ""
        echo "Terminal 3 - Mobile:"
        start_mobile &
        MOBILE_PID=$!
        
        wait
        ;;
    5)
        start_mobile
        ;;
    6)
        run_tests
        ;;
    *)
        echo -e "${RED}Opção inválida${NC}"
        exit 1
        ;;
esac
