# Resource Booking System 

A full-stack **Resource Booking System** with:

- **Backend:** Node.js, Express, Prisma, SQLite (switchable to Postgres/MySQL)
- **Frontend:** React + Vite + Zustand + MUI
- **Authentication:** JWT-based login (Users & Admins)

### Features
✅ Users can sign up, log in, and book resources  
✅ Admins can manage resources (add/edit/delete), view bookings, and override schedules  
✅ Conflict detection for overlapping bookings  
✅ Dockerized for local development & production  

---

## 📦 Project Structure

```
.
├── backend/                # Node.js + Express + Prisma
│   ├── Dockerfile
│   ├── prisma/             # Prisma schema & migrations
│   └── src/                # Controllers, routes, middleware
├── scheduler_frontend/     # React + Vite + Zustand + MUI
│   ├── Dockerfile
│   └── src/
├── docker-compose.yml      # One-shot local setup
└── README.md
```

---

## 🐳 Run with Docker (Recommended)

Make sure you have Docker & Docker Compose installed.

### 1. Build & Run
```bash
docker-compose up --build
```
This will:
- Start backend on http://localhost:4000
- Start frontend on http://localhost:3000

### 2. First-Time Setup
- Open browser at http://localhost:3000
- Default admin credentials:

```
username: admin
password: admin
```

---

---
## ⚙️ Environment Variables

**Backend** (`backend/.env`)
```
DATABASE_URL=file:/app/prisma/dev.db
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
```

**Frontend** (`scheduler_frontend/.env`)
```
VITE_API_URL=http://localhost:4000
```

---

## 🔧 Local Development (without Docker)

### 1. Clone Repository
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```
Backend runs on 👉 http://localhost:4000

### 3. Frontend Setup
```bash
cd scheduler_frontend
npm install
npm run dev
```
Frontend runs on 👉 http://localhost:3000

## 🛠️ Tech Stack
- **Frontend**
  - React + Vite
  - Zustand (state management)
  - MUI + ShadCN (UI components)
- **Backend**
  - Express.js
  - Prisma ORM
  - JWT Auth
- **Database**
  - SQLite (default, easy local dev)
  - Postgres/MySQL (production-ready)
- **Infra**
  - Docker & Docker Compose
  - Jenkins + SonarQube (for CI/CD)

---

## 🎥 Project Demo

[![Watch the demo](https://img.youtube.com/vi/hFYq_hzExTg/0.jpg)](https://youtu.be/hFYq_hzExTg)