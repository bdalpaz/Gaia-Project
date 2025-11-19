# GAIA - Sistema de Produtividade 👾

Um sistema de gerenciamento de tarefas (Kanban) com autenticação de usuários e interface inspirada na estética de menus de consoles de videogame antigos, combinando um visual retrô com efeitos modernos.

## 🌟 Sobre o Projeto

O GAIA nasceu da ideia de criar uma ferramenta de produtividade (como um quadro Kanban) que fosse mais envolvente e visualmente interessante. A tela inicial simula um menu de "start" de um jogo, e os componentes internos, como o quadro Kanban, mantêm uma estética coesa, utilizando transparência e efeitos de *glassmorphism* (`backdrop-filter`).

## 🚀 Como Utilizar

### Pré-requisitos

- **Node.js** (versão 14 ou superior)
- **npm** (geralmente vem com Node.js)
- Um navegador web moderno

### Passo 1: Instalar Dependências do Backend

Abra um terminal e navegue até a pasta do backend:

```bash
cd Gaia_Back
npm install
```

Isso instalará as dependências necessárias:
- `express` - Framework web
- `cors` - Middleware para permitir requisições do frontend
- `jsonwebtoken` - Para autenticação JWT

### Passo 2: Iniciar o Servidor Backend

Ainda na pasta `Gaia_Back`, execute:

```bash
npm start
```

Você verá uma mensagem como:
```
🚀 Servidor GAIA rodando na porta 3000
📍 URL: http://localhost:3000
🔍 Health check: http://localhost:3000/api/health
👥 Usuários: http://localhost:3000/api/users
```

**Mantenha este terminal aberto** enquanto usar o sistema.

### Passo 3: Abrir o Frontend

Você tem duas opções:

#### Opção A: Abrir diretamente no navegador
1. Navegue até a pasta `Gaia_Front/login/`
2. Abra o arquivo `index.html` no seu navegador

#### Opção B: Usar um servidor HTTP local (recomendado)
```bash
# Em um novo terminal, na pasta raiz do projeto
cd Gaia_Front
python3 -m http.server 8000
# Ou se tiver Node.js instalado:
npx http-server -p 8000
```

Depois acesse: `http://localhost:8000/login/index.html`

### Passo 4: Criar uma Conta

1. Na tela de login, clique em **"Registre-se"**
2. Preencha os campos:
   - **Nome de Usuário**
   - **E-mail**
   - **Senha** (mínimo 6 caracteres)
   - **Repita sua Senha**
3. Marque a opção de termos de uso
4. Clique em **"Registrar"**

Após o cadastro, você será redirecionado para a tela de login.

### Passo 5: Fazer Login

1. Digite seu **E-mail** e **Senha**
2. Clique em **"Login"**
3. Você será redirecionado para a **Home**

### Passo 6: Usar o Kanban

1. Na Home, clique em **"Kanban"** ou pressione **ENTER**
2. Você verá o quadro Kanban com 4 colunas:
   - **A Fazer** (todo)
   - **Em Progresso** (inprogress)
   - **Revisão** (review)
   - **Feito** (done)

#### Funcionalidades do Kanban:

- **Adicionar Tarefa**: Clique no botão **"+"** no topo
- **Mover Tarefa**: Arraste e solte uma tarefa entre as colunas
- **Editar Tarefa**: Dê **duplo clique** em uma tarefa para editar o título
- **Deletar Todas as Tarefas**: Clique no botão de **lixeira** (apaga todas as tarefas)

## 📋 Funcionalidades Implementadas

### ✅ Autenticação
- Cadastro de usuários
- Login com JWT (token válido por 7 dias)
- Verificação de autenticação em páginas protegidas
- Logout

### ✅ Kanban
- Criar tarefas
- Visualizar tarefas do usuário logado
- Mover tarefas entre colunas (drag and drop)
- Editar tarefas
- Deletar tarefas
- Cada usuário vê apenas suas próprias tarefas

### ✅ Backend API
- Endpoints RESTful para autenticação
- Endpoints CRUD para tarefas
- Autenticação JWT em rotas protegidas
- Armazenamento em memória (dados persistem enquanto o servidor estiver rodando)

## 🔧 Estrutura do Projeto

```
Gaia-Project-1/
├── Gaia_Back/              # Backend (Node.js + Express)
│   ├── server.js          # Servidor principal com todas as rotas
│   ├── package.json       # Dependências do backend
│   └── README.md          # Documentação do backend
│
└── Gaia_Front/            # Frontend (HTML + CSS + JavaScript)
    ├── login/             # Páginas de autenticação
    │   ├── index.html     # Tela de login
    │   └── Cadastro/      # Tela de cadastro
    │
    └── home/              # Páginas principais
        ├── home.html      # Menu principal
        └── kanban/        # Quadro Kanban
            ├── kanban.html
            ├── script.js
            └── kanban-styles.css
```

## 🔐 Endpoints da API

### Autenticação

- `POST /api/register` - Cadastrar novo usuário
- `POST /api/login` - Fazer login (retorna token JWT)
- `GET /api/me` - Obter informações do usuário autenticado

### Tarefas (requer autenticação)

- `GET /api/tasks` - Listar todas as tarefas do usuário
- `POST /api/tasks` - Criar nova tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `PUT /api/tasks/:id/move` - Mover tarefa entre colunas
- `DELETE /api/tasks/:id` - Deletar tarefa

### Utilitários

- `GET /api/health` - Verificar status do servidor
- `GET /api/users` - Listar usuários (desenvolvimento)

## ⚠️ Observações Importantes

1. **Armazenamento em Memória**: Os dados (usuários e tarefas) são armazenados apenas em memória. Isso significa que:
   - Os dados são perdidos quando o servidor é reiniciado
   - Em produção, você deve usar um banco de dados real (MongoDB, PostgreSQL, etc.)

2. **Segurança**: 
   - As senhas não estão hasheadas (use bcrypt em produção)
   - A chave JWT está hardcoded (use variáveis de ambiente em produção)
   - CORS está habilitado para desenvolvimento

3. **Porta do Backend**: O backend roda na porta `3000` por padrão. Se precisar mudar, edite a constante `PORT` em `Gaia_Back/server.js`

## 🐛 Solução de Problemas

### Erro: "npm não encontrado"
- Instale o Node.js: https://nodejs.org/
- O npm vem junto com o Node.js

### Erro: "Porta 3000 já está em uso"
- Pare outros processos usando a porta 3000
- Ou altere a porta no arquivo `server.js`

### Erro: "Erro de conexão" no frontend
- Verifique se o backend está rodando
- Verifique se a URL da API está correta (`http://localhost:3000`)
- Verifique o console do navegador (F12) para mais detalhes

### Tarefas não aparecem
- Verifique se você está logado
- Verifique se o token JWT ainda é válido
- Recarregue a página

## 🎯 Próximos Passos (Melhorias Futuras)

- [ ] Adicionar banco de dados (MongoDB/PostgreSQL)
- [ ] Hash de senhas com bcrypt
- [ ] Variáveis de ambiente para configuração
- [ ] Testes automatizados
- [ ] Deploy em produção
- [ ] Funcionalidade de calendário integrada
- [ ] Compartilhamento de tarefas entre usuários

## 📝 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **jsonwebtoken** - Autenticação JWT
- **CORS** - Middleware para Cross-Origin Resource Sharing

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização com glassmorphism
- **JavaScript (Vanilla)** - Lógica e integração com API
- **Google Fonts** - Tipografia

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para organização e produtividade**
