const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Armazenamento temporário em memória (simulando banco de dados)
const users = [];
const resetCodes = new Map(); // Armazena códigos de verificação temporariamente

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

        res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
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
