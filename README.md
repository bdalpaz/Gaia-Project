# GAIA - Sistema de Produtividade 👾

Um sistema de gerenciamento de tarefas (Kanban) com uma interface de usuário inspirada na estética de menus de consoles de videogame antigos, combinando um visual retrô com efeitos modernos.

## 🌟 Sobre o Projeto

O GAIA nasceu da ideia de criar uma ferramenta de produtividade (como um quadro Kanban) que fosse mais envolvente e visualmente interessante. A tela inicial simula um menu de "start" de um jogo, e os componentes internos, como o quadro Kanban, mantêm uma estética coesa, utilizando transparência e efeitos de *glassmorphism* (`backdrop-filter`).

## 🚀 Tecnologias Utilizadas

* **HTML5:** Para a estrutura semântica das páginas.
* **CSS3:** Para toda a estilização, incluindo:
    * Flexbox para layout.
    * `backdrop-filter` para o efeito de vidro.
    * `@keyframes` para animações.
    * Fontes customizadas (via Google Fonts).

## 📂 Como Executar

1.
cd Gaia-Project/Gaia_Back
npm install
npm start

2.
cd ..
cd Gaia_Front
python3 -m http.server 3001

3. teste api (manual)
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "Seu Nome", "email": "seu@email.com", "password": "123456", "confirmPassword": "123456"}'

curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "123456"}'

curl -X POST http://localhost:3000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com"}'

5. teste api (auto)
cd /home/anthony/Gaia-Project/Gaia_Back
node test-api.js
