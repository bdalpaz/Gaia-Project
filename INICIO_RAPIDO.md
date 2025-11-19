# 🚀 Guia Rápido de Início - GAIA

## Início Rápido (3 passos)

### 1️⃣ Instalar e Iniciar o Backend

```bash
cd Gaia_Back
npm install
npm start
```

✅ Você verá: `🚀 Servidor GAIA rodando na porta 3000`

### 2️⃣ Abrir o Frontend

**Opção A - Direto no navegador:**
- Abra: `Gaia_Front/login/index.html`

**Opção B - Com servidor HTTP:**
```bash
cd Gaia_Front
python3 -m http.server 8000
# Acesse: http://localhost:8000/login/index.html
```

### 3️⃣ Usar o Sistema

1. **Criar conta** → Clique em "Registre-se"
2. **Fazer login** → Use email e senha
3. **Acessar Kanban** → Clique em "Kanban" na home
4. **Adicionar tarefa** → Clique no botão "+"
5. **Mover tarefa** → Arraste entre as colunas

## ⚡ Comandos Úteis

```bash
# Verificar se o backend está rodando
curl http://localhost:3000/api/health

# Ver usuários cadastrados
curl http://localhost:3000/api/users
```

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| "npm não encontrado" | Instale Node.js: https://nodejs.org/ |
| "Porta 3000 em uso" | Pare outros processos ou mude a porta |
| "Erro de conexão" | Verifique se o backend está rodando |
| Tarefas não aparecem | Faça logout e login novamente |

## 📍 URLs Importantes

- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Frontend**: Abra `Gaia_Front/login/index.html`

---

**Pronto! Agora você pode usar o GAIA! 🎉**


