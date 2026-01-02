# Stat-Trade - Guia de Desenvolvimento

## Estrutura do Projeto

```
stat-trade/
├── backend/                    # API Node.js/Express
│   ├── src/
│   │   ├── server.js          # Entry point
│   │   ├── config/            # Configurações
│   │   ├── middleware/        # Middlewares
│   │   ├── routes/            # Rotas da API
│   │   └── migrations/        # Scripts de DB
│   ├── package.json
│   └── .env.example
├── frontend-web/              # React Web
│   ├── src/
│   │   ├── pages/            # Páginas
│   │   ├── components/       # Componentes
│   │   ├── stores/           # Zustand stores
│   │   ├── api/              # Clientes API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── mobile/                    # React Native
│   ├── src/
│   │   ├── screens/          # Telas
│   │   ├── stores/           # Zustand stores
│   │   ├── api/              # Clientes API
│   │   └── Navigation.js
│   ├── App.js
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Workflow Desenvolvimento

### 1. Iniciar Todos os Serviços

```bash
# Opção A: Com Docker
docker-compose up -d

# Opção B: Manualmente em 3 terminais

# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: Frontend Web
cd frontend-web && npm install && npm run dev

# Terminal 3: Mobile
cd mobile && npm install && npm start
```

### 2. Fluxo de Dados

```
Mobile/Web UI
    ↓
Zustand Store (State Management)
    ↓
API Client (axios/fetch)
    ↓
Backend Express Server
    ↓
PostgreSQL Database
    ↓
Real-time Updates (Socket.io)
```

### 3. Adicionar Nova Feature

#### Backend
1. Criar rota em `src/routes/`
2. Adicionar lógica em `src/services/` (opcional)
3. Criar migração DB se necessário
4. Testar com curl/Postman

#### Frontend Web
1. Criar página em `src/pages/`
2. Criar componentes em `src/components/`
3. Adicionar store em `src/stores/` se necessário
4. Adicionar endpoints API em `src/api/api.js`
5. Integrar com routing

#### Mobile
1. Criar tela em `src/screens/`
2. Adicionar ao Navigation
3. Usar stores do Zustand
4. Testar no Expo

## Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend-web
npm test
```

### Mobile
```bash
cd mobile
npm test
```

## Conventions

### Naming
- Ficheiros: PascalCase (Components), camelCase (utils)
- Variáveis: camelCase
- Constantes: SCREAMING_SNAKE_CASE
- Classes: PascalCase

### Code Style
- Use ESLint
- Use Prettier para formatting
- Commits: Conventional Commits

```bash
git commit -m "feat: add new trade import feature"
git commit -m "fix: resolve database connection issue"
git commit -m "docs: update README"
```

## Performance Tips

### Frontend
- Lazy load pages com React.lazy()
- Memoize componentes com React.memo()
- Use virtual lists para grandes datasets
- Code splitting automático com Vite

### Mobile
- FlatList em vez de ScrollView
- Optimize imagens
- Cache dados com AsyncStorage
- Use React.memo para componentes

### Backend
- Índices nas colunas frequentemente consultadas
- Paginação para queries grandes
- Redis para caching
- Connection pooling

## Security

- ✅ Usar HTTPS em produção
- ✅ Validar todas as inputs
- ✅ Hash passwords com bcrypt
- ✅ JWT com expiração
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Variáveis de ambiente

## Debugging

### Backend
```javascript
// Logs
console.log('Debug:', data);

// Error handling
try {
  // code
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: error.message });
}
```

### Frontend
```javascript
// Redux DevTools
useAuthStore.setState((state) => ({...}));

// Network debugging
axios.interceptors.response.use(
  (res) => console.log('Response:', res),
  (err) => console.error('Error:', err)
);
```

### Mobile
```bash
# Expo Logs
expo logs

# Device Logs
adb logcat
```

## Deployment Checklist

- [ ] Criar variáveis de produção
- [ ] Testar em staging
- [ ] Build produção
- [ ] Setup CI/CD
- [ ] Monitorar logs
- [ ] Backup database
- [ ] Teste de carga

## Recursos Úteis

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [React Native Docs](https://reactnative.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TradingView API](https://www.tradingview.com/pine-script-docs/)

---

Para questões de desenvolvimento, verifique a documentação das dependências.
