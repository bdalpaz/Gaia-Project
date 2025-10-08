// Arquivo para testar as APIs do GAIA Backend
// Execute: node test-api.js

const BASE_URL = 'http://localhost:3000';

// Função para fazer requisições
async function makeRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const result = await response.json();
        
        console.log(`\n📡 ${method} ${endpoint}`);
        console.log('📤 Enviado:', data || 'N/A');
        console.log('📥 Resposta:', result);
        console.log('📊 Status:', response.status);
        
        return { success: response.ok, data: result, status: response.status };
    } catch (error) {
        console.error(`❌ Erro na requisição ${endpoint}:`, error.message);
        return { success: false, error: error.message };
    }
}

// Função principal para testar todas as APIs
async function testAPIs() {
    console.log('🧪 Iniciando testes das APIs do GAIA Backend\n');
    console.log('=' .repeat(50));

    // 1. Teste de saúde do servidor
    await makeRequest('/api/health');

    // 2. Cadastro de usuário
    const userData = {
        username: 'João Silva',
        email: 'joao@teste.com',
        password: '123456',
        confirmPassword: '123456'
    };
    
    const registerResult = await makeRequest('/api/register', 'POST', userData);

    // 3. Login
    const loginData = {
        email: 'joao@teste.com',
        password: '123456'
    };
    
    await makeRequest('/api/login', 'POST', loginData);

    // 4. Esqueci a senha
    const forgotPasswordData = {
        email: 'joao@teste.com'
    };
    
    await makeRequest('/api/forgot-password', 'POST', forgotPasswordData);

    // 5. Aguardar um pouco e verificar código (simulado)
    console.log('\n⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Verificar código (você precisará pegar o código do console do servidor)
    console.log('\n⚠️  ATENÇÃO: Verifique o console do servidor para obter o código de verificação!');
    console.log('💡 Digite o código no console e pressione Enter para continuar...');
    
    // Simular código (em produção, seria obtido do email)
    const verificationCode = '123456'; // Substitua pelo código real do servidor
    
    const verifyCodeData = {
        email: 'joao@teste.com',
        code: verificationCode
    };
    
    await makeRequest('/api/verify-code', 'POST', verifyCodeData);

    // 7. Redefinir senha
    const resetPasswordData = {
        email: 'joao@teste.com',
        code: verificationCode,
        newPassword: 'novaSenha123',
        confirmPassword: 'novaSenha123'
    };
    
    await makeRequest('/api/reset-password', 'POST', resetPasswordData);

    // 8. Tentar login com nova senha
    const newLoginData = {
        email: 'joao@teste.com',
        password: 'novaSenha123'
    };
    
    await makeRequest('/api/login', 'POST', newLoginData);

    // 9. Listar usuários
    await makeRequest('/api/users');

    // 10. Testar erros
    console.log('\n🧪 Testando cenários de erro:');
    
    // Login com credenciais inválidas
    await makeRequest('/api/login', 'POST', {
        email: 'inexistente@teste.com',
        password: 'senhaerrada'
    });

    // Cadastro com senhas diferentes
    await makeRequest('/api/register', 'POST', {
        username: 'Teste Erro',
        email: 'erro@teste.com',
        password: '123456',
        confirmPassword: '654321'
    });

    console.log('\n✅ Testes concluídos!');
    console.log('=' .repeat(50));
}

// Função para teste interativo
async function interactiveTest() {
    console.log('\n🎮 Modo interativo de teste');
    console.log('Escolha uma opção:');
    console.log('1. Testar todas as APIs automaticamente');
    console.log('2. Testar cadastro');
    console.log('3. Testar login');
    console.log('4. Testar esqueci a senha');
    console.log('5. Sair');
    
    // Simular escolha 1 (teste automático)
    console.log('\n🔧 Executando teste automático...');
    await testAPIs();
}

// Verificar se fetch está disponível (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.log('❌ Este script requer Node.js 18+ ou instalação do node-fetch');
    console.log('💡 Alternativa: use curl ou Postman para testar as APIs');
    console.log('📖 Consulte o README.md para exemplos de curl');
    process.exit(1);
}

// Executar testes
interactiveTest().catch(console.error);
