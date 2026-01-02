# 🗄️ Instalação do PostgreSQL

## macOS

### Opção 1: Homebrew (Recomendado)

```bash
# Instalar PostgreSQL
brew install postgresql@15

# Iniciar serviço
brew services start postgresql@15

# Verificar se está rodando
pg_isready
```

### Opção 2: Docker

```bash
# Puxar imagem PostgreSQL
docker pull postgres:15

# Criar container
docker run --name stat-trade-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=stat_trade \
  -p 5432:5432 \
  -d postgres:15

# Verificar
docker ps | grep stat-trade-db
```

### Opção 3: PostgreSQL.app

1. Baixar em: https://postgresapp.com/
2. Executar instalador
3. PostgreSQL inicia automaticamente

---

## Linux (Ubuntu/Debian)

```bash
# Atualizar pacotes
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo service postgresql start

# Verificar
sudo -u postgres psql -c "SELECT version();"
```

---

## Windows

1. Baixar instalador: https://www.postgresql.org/download/windows/
2. Executar instalador
3. Seguir o wizard de instalação
4. PostgreSQL inicia automaticamente

---

## Verificar Instalação

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Ver versão
\version

# Sair
\q
```

---

## Após Instalação

Executar o setup completo:

```bash
cd /Users/lourenco/Programming/Stat-Trade
./setup.sh
```

Este script irá:
- ✅ Criar database `stat_trade`
- ✅ Executar migrations (criar tabelas)
- ✅ Carregar dados de teste
- ✅ Preparar backend, frontend e mobile

---

## Troubleshooting

### PostgreSQL já está rodando?

```bash
# Verificar
pg_isready

# Output esperado:
# accepting connections
```

### Erro de conexão?

```bash
# Tentar conectar manualmente
psql -U postgres -h localhost
```

### Porta 5432 já está em uso?

```bash
# Mudar porta no .env do backend
DB_PORT=5433
```

### Resetar database completamente

```bash
# Parar PostgreSQL
brew services stop postgresql@15

# Remover dados
rm -rf /usr/local/var/postgres

# Recomeçar
brew services start postgresql@15
```

---

Pronto! Agora pode executar `./setup.sh` 🚀
