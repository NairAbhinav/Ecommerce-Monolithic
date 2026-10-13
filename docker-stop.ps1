# ==============================================================
# Script: Stop Monolithic Containers
# Note: The database volume 'mongo_data' remains intact and preserved.
# ==============================================================

Write-Host "Stopping and removing ecom-app container..." -ForegroundColor Yellow
docker stop ecom-app 2>$null
docker rm ecom-app 2>$null

Write-Host "Stopping and removing ecom-mongo container..." -ForegroundColor Yellow
docker stop ecom-mongo 2>$null
docker rm ecom-mongo 2>$null

Write-Host "Containers stopped. Persistent volume 'mongo_data' is safely preserved." -ForegroundColor Green
