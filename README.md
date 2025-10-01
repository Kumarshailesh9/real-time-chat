# Chat App Monorepo

## Overview
This is a **real-time chat application** built using:

- **Frontend**: Next.js 15 + React 19
- **Backend**: Node.js + Express + Prisma + Socket.IO
- **Database**: MongoDB (managed with Prisma)
- **Package Manager**: pnpm
- **Monorepo Management**: Turborepo

The app supports real-time messaging and user authentication.

## Features

- **User authentication** (signup, login, JWT-based auth)
- **Real-time chat** between users using Socket.IO
- **Friends management** (send, accept, reject friend requests)
- **Storing messages** in MongoDB with Prisma
- **Responsive frontend** UI with Next.js
- **Emoji** chat with emoji .😁

---

## Folder Structure
- **my-monorepo/**
- ├── **apps/**
- │ ├── **frontend/** # Next.js frontend
- │ └── **backend/** # Node.js + Express backend + Prisma + socket.io
- ├── **turbo.json** # Turborepo configuration
- ├── **package.json** # Root package.json
- ├── **pnpm-lock.yaml** 


---


## Frontend Pages

- **/login** – User login
- **/signup** – User registration
- **/dashboard** – Real-time chat interface/ find friends/ accept and reject request etc

## Backend API
- **Node.js + Express**: REST API for user authentication and chat.
- **Prisma ORM with MongoDB**: Stores users, friends, and messages.
- **Socket.IO server**: Handles real-time messaging.
- **JWT authentication**: Secures API routes.

## Setup Instructions

### 1. Clone the repository
```base
git clone <your-github-repo-link>
cd my-monorepo
```

### 2. Install dependencies
```
npm install
```

### 3. Configure Environment Variables

Navigate to backend and Generate Prisma Client
```
cd apps/backend
npx prisma generate

```

Copy .env.example to .env:
```
cp .env.example .env
```
Or create .env file in apps/backend/.env
```
DATABASE_URL="mongodb+srv://username:password@cluster.8bxk.mongodb.net/ChatApp?retryWrites=true&w=majority&appName=Cluster"
//change with your actual url mongodb atlas
```

Fill in your actual values:
```
DATABASE_URL → MongoDB connection string (MongoDB Atlas recommended)
```


MongoDB does not require migrations. Prisma works directly with collections.

### 5. Run the Monorepo
From the root folder:
```
cd ../../
npm run dev
```

This will start both the frontend and backend simultaneously:

Frontend: http://localhost:3000
Backend: http://localhost:5000

### 6. Using the App
Register a new user via /signup
Login via /login
Add friends using click send request button
Start real-time messaging
Messages are stored in MongoDB

## Additional Notes

Ensure pnpm is installed globally (npm install -g pnpm)
- The monorepo uses Turborepo to run multiple packages in parallel
- The backend is fully JS; Prisma client works with MongoDB
- Frontend uses Next.js 15 and will automatically detect backend APIs via .env
