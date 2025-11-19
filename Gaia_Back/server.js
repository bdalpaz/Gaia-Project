const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Chave secreta para JWT (em produção, usar variável de ambiente)
const JWT_SECRET = 'gaia_secret_key_2025_change_in_production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Armazenamento temporário em memória (simulando banco de dados)
const users = [];
const resetCodes = new Map(); // Armazena códigos de verificação temporariamente
const tasks = []; // Armazena tarefas do kanban

// Função para gerar código de verificação aleatório
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Função para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função para encontrar usuário por email
function findUserByEmail(email) {
    return users.find(user => user.email === email);
}

// Função para encontrar usuário por ID
function findUserById(id) {
    return users.find(user => user.id === id);
}

// Middleware de autenticação JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de acesso não fornecido'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }
        req.user = user;
        next();
    });
}

// Rota de cadastro
app.post('/api/register', (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validações básicas
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'As senhas não coincidem'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'A senha deve ter pelo menos 6 caracteres'
            });
        }

        // Verificar se usuário já existe
        if (findUserByEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Usuário já cadastrado com este email'
            });
        }

        // Criar novo usuário
        const newUser = {
            id: users.length + 1,
            username,
            email,
            password, // Em produção, hash da senha seria necessário
            createdAt: new Date()
        };

        users.push(newUser);

        res.status(201).json({
            success: true,
            message: 'Usuário cadastrado com sucesso',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota de login
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // Validações básicas
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }

        // Buscar usuário
        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // Verificar senha (em produção, comparar hash)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                username: user.username 
            },
            JWT_SECRET,
            { expiresIn: '7d' } // Token expira em 7 dias
        );

        res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para solicitar redefinição de senha
app.post('/api/forgot-password', (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email é obrigatório'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }

        // Verificar se usuário existe
        const user = findUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Gerar código de verificação
        const verificationCode = generateVerificationCode();
        
        // Armazenar código temporariamente (expira em 10 minutos)
        resetCodes.set(email, {
            code: verificationCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            userId: user.id
        });

        // Em produção, enviar email com o código
        console.log(`Código de verificação para ${email}: ${verificationCode}`);

        res.status(200).json({
            success: true,
            message: 'Código de verificação enviado para seu email',
            email: email
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para verificar código de redefinição
app.post('/api/verify-code', (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email e código são obrigatórios'
            });
        }

        // Buscar dados de redefinição
        const resetData = resetCodes.get(email);
        if (!resetData) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido ou expirado'
            });
        }

        // Verificar se código expirou
        if (new Date() > resetData.expiresAt) {
            resetCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: 'Código expirado. Solicite um novo código'
            });
        }

        // Verificar código
        if (resetData.code !== code) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Código verificado com sucesso',
            email: email
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para redefinir senha
app.post('/api/reset-password', (req, res) => {
    try {
        const { email, code, newPassword, confirmPassword } = req.body;

        if (!email || !code || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'As senhas não coincidem'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'A senha deve ter pelo menos 6 caracteres'
            });
        }

        // Verificar código de redefinição
        const resetData = resetCodes.get(email);
        if (!resetData) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido ou expirado'
            });
        }

        if (new Date() > resetData.expiresAt) {
            resetCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: 'Código expirado. Solicite um novo código'
            });
        }

        if (resetData.code !== code) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido'
            });
        }

        // Atualizar senha do usuário
        const user = findUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        user.password = newPassword; // Em produção, hash da senha
        resetCodes.delete(email); // Remover código usado

        res.status(200).json({
            success: true,
            message: 'Senha redefinida com sucesso'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para listar usuários (para desenvolvimento)
app.get('/api/users', (req, res) => {
    res.status(200).json({
        success: true,
        users: users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
        }))
    });
});

// ==================== ROTAS DE TAREFAS KANBAN ====================

// GET /api/tasks - Buscar todas as tarefas do usuário
app.get('/api/tasks', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const userTasks = tasks.filter(task => task.userId === userId);
        
        res.status(200).json({
            success: true,
            tasks: userTasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar tarefas'
        });
    }
});

// POST /api/tasks - Criar nova tarefa
app.post('/api/tasks', authenticateToken, (req, res) => {
    try {
        const { title, status, description } = req.body;
        const userId = req.user.id;

        if (!title || !status) {
            return res.status(400).json({
                success: false,
                message: 'Título e status são obrigatórios'
            });
        }

        // Validar status
        const validStatuses = ['todo', 'inprogress', 'review', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status inválido. Use: todo, inprogress, review ou done'
            });
        }

        const newTask = {
            id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
            userId: userId,
            title: title,
            description: description || '',
            status: status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        tasks.push(newTask);

        res.status(201).json({
            success: true,
            message: 'Tarefa criada com sucesso',
            task: newTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar tarefa'
        });
    }
});

// PUT /api/tasks/:id - Atualizar tarefa
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const { title, status, description } = req.body;
        const userId = req.user.id;

        const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === userId);
        
        if (taskIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }

        // Validar status se fornecido
        if (status) {
            const validStatuses = ['todo', 'inprogress', 'review', 'done'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status inválido. Use: todo, inprogress, review ou done'
                });
            }
        }

        // Atualizar tarefa
        if (title) tasks[taskIndex].title = title;
        if (status) tasks[taskIndex].status = status;
        if (description !== undefined) tasks[taskIndex].description = description;
        tasks[taskIndex].updatedAt = new Date().toISOString();

        res.status(200).json({
            success: true,
            message: 'Tarefa atualizada com sucesso',
            task: tasks[taskIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar tarefa'
        });
    }
});

// DELETE /api/tasks/:id - Deletar tarefa
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const userId = req.user.id;

        const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === userId);
        
        if (taskIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }

        tasks.splice(taskIndex, 1);

        res.status(200).json({
            success: true,
            message: 'Tarefa deletada com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar tarefa'
        });
    }
});

// PUT /api/tasks/:id/move - Mover tarefa entre colunas
app.put('/api/tasks/:id/move', authenticateToken, (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const { status, position } = req.body;
        const userId = req.user.id;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status é obrigatório'
            });
        }

        const validStatuses = ['todo', 'inprogress', 'review', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status inválido. Use: todo, inprogress, review ou done'
            });
        }

        const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === userId);
        
        if (taskIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }

        tasks[taskIndex].status = status;
        tasks[taskIndex].updatedAt = new Date().toISOString();

        res.status(200).json({
            success: true,
            message: 'Tarefa movida com sucesso',
            task: tasks[taskIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao mover tarefa'
        });
    }
});

// GET /api/me - Obter informações do usuário autenticado
app.get('/api/me', authenticateToken, (req, res) => {
    try {
        const user = findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar informações do usuário'
        });
    }
});

// Rota para verificar status do servidor
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Servidor GAIA funcionando',
        timestamp: new Date().toISOString()
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor GAIA rodando na porta ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👥 Usuários: http://localhost:${PORT}/api/users`);
});

module.exports = app;
