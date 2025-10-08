# GAIA Backend

Backend simples em JavaScript puro para o projeto GAIA, conectando as funcionalidades de login, cadastro, esqueci a senha e código de verificação.

## 🚀 Como usar

### 1. Instalar dependências
```bash
cd Gaia_Back
npm install
```

### 2. Iniciar o servidor
```bash
npm start
```

O servidor irá rodar em `http://localhost:3000`

## 📋 Endpoints disponíveis

### 🔐 Autenticação

#### POST `/api/register` - Cadastro de usuário
```json
{
  "username": "Nome do Usuário",
  "email": "usuario@email.com",
  "password": "senha123",
  "confirmPassword": "senha123"
}
```

#### POST `/api/login` - Login
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

### 🔄 Recuperação de senha

#### POST `/api/forgot-password` - Solicitar código de verificação
```json
{
  "email": "usuario@email.com"
}
```

#### POST `/api/verify-code` - Verificar código
```json
{
  "email": "usuario@email.com",
  "code": "123456"
}
```

#### POST `/api/reset-password` - Redefinir senha
```json
{
  "email": "usuario@email.com",
  "code": "123456",
  "newPassword": "novaSenha123",
  "confirmPassword": "novaSenha123"
}
```

### 🔍 Utilitários

#### GET `/api/health` - Status do servidor
#### GET `/api/users` - Listar usuários (desenvolvimento)

## 🧪 Testando as APIs

### Exemplo de fluxo completo:

1. **Cadastrar usuário:**
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "João Silva",
    "email": "joao@email.com",
    "password": "123456",
    "confirmPassword": "123456"
  }'
```

2. **Fazer login:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "123456"
  }'
```

3. **Esqueci a senha:**
```bash
curl -X POST http://localhost:3000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com"
  }'
```

4. **Verificar código** (o código aparecerá no console do servidor):
```bash
curl -X POST http://localhost:3000/api/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "code": "123456"
  }'
```

5. **Redefinir senha:**
```bash
curl -X POST http://localhost:3000/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "code": "123456",
    "newPassword": "novaSenha123",
    "confirmPassword": "novaSenha123"
  }'
```

## ⚠️ Observações importantes

- **Armazenamento temporário**: Os dados são armazenados apenas em memória e serão perdidos quando o servidor for reiniciado
- **Códigos de verificação**: Expirem em 10 minutos
- **Senhas**: Em produção, as senhas devem ser hasheadas (bcrypt, scrypt, etc.)
- **CORS**: Habilitado para permitir requisições do frontend
- **Logs**: Os códigos de verificação são exibidos no console do servidor

## 🔗 Integração com Frontend

Para conectar com o frontend, certifique-se de que:

1. O frontend faça requisições para `http://localhost:3000`
2. Os formulários enviem dados no formato JSON
3. Trate as respostas da API adequadamente

### Exemplo de integração JavaScript:
```javascript
// Exemplo para login
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Login realizado:', data.user);
      // Redirecionar ou fazer login
    } else {
      console.error('Erro no login:', data.message);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}
```

## 📝 Estrutura do projeto

```
Gaia_Back/
├── server.js          # Servidor principal
├── package.json       # Dependências
└── README.md         # Este arquivo
```

## 🛠️ Tecnologias utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **CORS** - Middleware para Cross-Origin Resource Sharing
