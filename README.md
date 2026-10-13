# Monolithic E-Commerce Web Application (Electrophonic)

A modern full-stack MERN (MongoDB, Express, React, Node.js) mobile phone & accessories e-commerce platform converted into a high-performance **Monolithic Web Application**, containerized **without Docker Compose**, using **Docker Volumes** for persistent database storage.

---

## 🌟 Architecture Overview

### Monolithic Transition
Previously, the application was split across 6 microservices (Auth, User, Product, Search, Cart, Order) plus an API Gateway proxy with duplicate sync logic.

**In this Monolithic Architecture:**
1. **Single Unified Express Backend (`backend/`)**:
   - Consolidates all business logic: Authentication, Users, Products, Search/Filtering, Cart, and Orders.
   - All inter-service HTTP requests (`axios.post('http://localhost:5002/...')`, etc.) are eliminated and replaced by direct, performant MongoDB model operations.
   - Eliminates duplicate search database synchronization; full searching, filtering, and sorting query the `Product` collection directly.
   - In production, the single Express server delivers both the REST API (`/api/*`) and the compiled React SPA static assets (`dist` / `public`) on port `5000`.
2. **React 19 + Vite Frontend (`frontend/`)**:
   - Modern Tailwind CSS dark-mode UI with Redux Toolkit state management.
   - Uses relative API routing (`/api`) so it seamlessly runs inside containers and proxies during local development.
3. **Unified Single Database**:
   - Single MongoDB database (`phone-ecom`) holding `User`, `Product`, `Review`, `Cart`, and `Order` collections with foreign references.

---

## 🐳 Docker Deployment (Without Docker Compose)

This application is containerized using native Docker CLI commands only.

### 1. Database Persistence with Docker Volume
MongoDB data is kept strictly persistent using a named Docker Volume:
```bash
docker volume create mongo_data
```
> When MongoDB runs with `-v mongo_data:/data/db`, all database collections, user accounts, and product catalog items persist across container stops, restarts, and removals.

### 2. Create Docker Network
Create a custom bridge network so the monolithic app and MongoDB containers communicate seamlessly by container name:
```bash
docker network create ecom-network
```

### 3. Run MongoDB Container
```bash
docker run -d \
  --name ecom-mongo \
  --network ecom-network \
  -v mongo_data:/data/db \
  -p 27017:27017 \
  mongo:7
```

### 4. Build Monolithic Application Image
Build the multi-stage Docker image that compiles the React frontend and packages the Express backend:
```bash
docker build -t ecom-monolith:latest .
```

### 5. Run Monolithic Web Application Container
```bash
docker run -d \
  --name ecom-app \
  --network ecom-network \
  -p 5000:5000 \
  -e MONGO_URI="mongodb://ecom-mongo:27017/phone-ecom" \
  -e JWT_SECRET="super_secret_jwt_token_key_987654321" \
  -e NODE_ENV="production" \
  ecom-monolith:latest
```

### 6. Seed the Database
Seed sample users, rich product catalog, reviews, and test orders into the persistent database:
```bash
docker exec -i ecom-app node seed.js
```

### 🚀 Access the Website
Open your browser at: **[http://localhost:5000](http://localhost:5000)**

---

## ⚡ Quick One-Click Scripts

For convenience, ready-to-run automation scripts are provided:

- **Windows (PowerShell)**:
  ```powershell
  .\docker-run.ps1
  ```
  To stop containers (preserving database volume):
  ```powershell
  .\docker-stop.ps1
  ```

- **Linux / macOS / Git Bash**:
  ```bash
  chmod +x docker-run.sh docker-stop.sh
  ./docker-run.sh
  ```
  To stop:
  ```bash
  ./docker-stop.sh
  ```

---

## 💻 Local Development (Without Docker)

You can also run the monolithic application locally:

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Seed Local MongoDB
Ensure a local MongoDB server is running on `mongodb://localhost:27017`, then run:
```bash
npm run seed
```

### 3. Run in Development Mode
Starts both the monolithic backend (port `5000`) and the Vite development server (port `5173`) concurrently:
```bash
npm run dev
```

---

## 🔑 Default Seeded Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin123` |
| **Seller** | `seller@gmail.com` | `seller123` |
| **Customer** | `customer@gmail.com` | `customer123` |
