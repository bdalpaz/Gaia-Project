# GaiaProject
Trabalho de Abex 

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