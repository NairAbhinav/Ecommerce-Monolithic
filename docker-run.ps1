# ==============================================================
# Script: Run Monolithic E-Commerce Application (Pure Docker CLI)
# Without using Docker Compose
# ==============================================================

Write-Host ">>> Step 1: Creating persistent Docker volume for MongoDB..." -ForegroundColor Cyan
docker volume create mongo_data

Write-Host ">>> Step 2: Creating Docker network..." -ForegroundColor Cyan
docker network create ecom-network 2>$null

Write-Host ">>> Step 3: Starting MongoDB Container with Persistent Volume..." -ForegroundColor Cyan
docker stop ecom-mongo 2>$null
docker rm ecom-mongo 2>$null
docker run -d `
  --name ecom-mongo `
  --network ecom-network `
  -v mongo_data:/data/db `
  -p 27017:27017 `
  mongo:7

Write-Host ">>> Step 4: Building Monolithic Web Application Docker Image..." -ForegroundColor Cyan
docker build -t ecom-monolith:latest .

Write-Host ">>> Step 5: Starting Monolithic Web Application Container..." -ForegroundColor Cyan
docker stop ecom-app 2>$null
docker rm ecom-app 2>$null
docker run -d `
  --name ecom-app `
  --network ecom-network `
  -p 5000:5000 `
  -e MONGO_URI="mongodb://ecom-mongo:27017/phone-ecom" `
  -e JWT_SECRET="super_secret_jwt_token_key_987654321" `
  -e NODE_ENV="production" `
  ecom-monolith:latest

Write-Host ">>> Step 6: Waiting for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host ">>> Step 7: Seeding MongoDB Database inside Container..." -ForegroundColor Cyan
docker exec -i ecom-app node seed.js

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Monolithic Website is running successfully!" -ForegroundColor Green
Write-Host "URL: http://localhost:5000" -ForegroundColor Green
Write-Host "Database persistence: docker volume 'mongo_data' (/data/db)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
