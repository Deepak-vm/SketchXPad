# SketchXPad 🎨

A real-time collaborative drawing application built with React, Node.js, WebSockets, and Prisma. Create rooms, invite friends, and draw together in real-time!

![SketchXPad Demo](https://img.shields.io/badge/Status-Active-green) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)

## ✨ Features

- 🎨 **Real-time Collaborative Drawing** - Multiple users can draw on the same canvas simultaneously
- 👥 **User Authentication** - Sign up, sign in, or join as a guest
- 🏠 **Room Management** - Create private rooms or join existing ones with room IDs
- 🔒 **Secure Backend** - JWT-based authentication with PostgreSQL database
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚡ **Fast & Real-time** - WebSocket connections for instant collaboration
- 🎭 **Guest Mode** - Start drawing immediately without registration

## 🏗️ Architecture

This is a **monorepo** built with **Turborepo** containing:

```text
SketchXPad/
├── apps/
│   ├── sketchXpad-frontend/    # React frontend with Vite
│   ├── http-backend/           # Express.js REST API server
│   └── ws-backend/             # WebSocket server for real-time features
├── packages/
│   ├── db/                     # Prisma ORM and database schemas
│   ├── common/                 # Shared TypeScript types
│   ├── backend-common/         # Shared backend utilities
│   ├── eslint-config/          # Shared ESLint configurations
│   └── typescript-config/      # Shared TypeScript configurations
```

### Tech Stack

**Frontend:**

- ⚛️ React 19 with TypeScript
- 🚀 Vite for fast development and building
- 🎨 Tailwind CSS for styling
- 📡 Axios for API calls
- 🛣️ React Router for navigation

**Backend:**

- 🟢 Node.js with Express.js
- 🔌 WebSocket (ws) for real-time communication
- 🔐 JWT for authentication
- 🗃️ Prisma ORM for database operations
- 🐘 PostgreSQL (Neon) database

**Development Tools:**

- 📦 pnpm for package management
- 🔄 Turborepo for monorepo management
- 📝 TypeScript for type safety
- 🔧 ESLint for code linting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database ([Neon](https://neon.tech/))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Deepak-vm/SketchXPad.git
   cd SketchXPad
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create `.env` files in the root directory and in `packages/db/`:
   
   **Root `.env`:**

   ```env
   DATABASE_URL="your_postgresql_connection_string"
   JWT_SECRET="your_jwt_secret_key"
   ```
   
   **`packages/db/.env`:**

   ```env
   DATABASE_URL="your_postgresql_connection_string"
   ```

4. **Set up the database**

   ```bash
   cd packages/db
   pnpm prisma migrate deploy
   pnpm prisma generate
   ```

5. **Start the development servers**

   ```bash
   # From the root directory
   pnpm dev
   ```

This will start:

- 🌐 Frontend: `http://localhost:5173`
- 🔗 HTTP Backend: `http://localhost:3000`
- ⚡ WebSocket Backend: `ws://localhost:8080`

## 📖 Usage

### Getting Started

1. **Visit the Application**
   Open `http://localhost:5173` in your browser

2. **Choose Your Mode**
   - **Sign Up/Sign In**: Create an account for persistent rooms and features
   - **Guest Mode**: Start drawing immediately without registration

3. **Create or Join a Room**
   - **Create New Room**: Enter a room name and start drawing
   - **Join Existing Room**: Enter a room ID to join others

4. **Start Drawing**
   - Use the toolbar to select tools (pen, eraser, shapes)
   - Invite others by sharing your room ID
   - See real-time changes from other users

### API Endpoints

#### Authentication

- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/signin` - Sign in to existing account
- `GET /api/auth/me` - Get current user information

#### Rooms

- `POST /room` - Create a new drawing room
- `GET /room/chats/:roomId` - Get room

#### Health

- `GET /health` - Server health check

## 🛠️ Development

### Project Structure

```
apps/sketchXpad-frontend/src/
├── components/
│   ├── Auth.tsx              # Authentication forms
│   ├── DrawingCanvas.tsx     # Main drawing component
│   ├── Header.tsx            # App header
│   ├── Toolbar.tsx           # Drawing tools
│   └── canvas/               # Canvas utilities and types
├── contexts/
│   └── AuthContext.tsx       # Global authentication state
├── hooks/
│   └── useDrawingSocket.ts   # WebSocket hook for real-time drawing
├── pages/
│   ├── HomePage.tsx          # Room management page
│   └── authPage.tsx          # Authentication page
└── .config.ts                # App configuration
```

### Available Scripts

```bash
# Development
pnpm dev          # Start all services in development mode
pnpm build        # Build all packages for production
pnpm lint         # Run ESLint on all packages

# Database
cd packages/db
pnpm prisma studio              # Open Prisma Studio
pnpm prisma migrate dev         # Create and apply new migration
pnpm prisma generate            # Generate Prisma client
```

### Environment Configuration

The application uses different ports for different services:

- **Frontend (Vite)**: Port 5173
- **HTTP Backend**: Port 3000  
- **WebSocket Backend**: Port 8080
- **Database**: As configured in `DATABASE_URL`

## 🔧 Configuration

### Frontend Configuration

Edit `apps/sketchXpad-frontend/src/.config.ts`:

```typescript
export const HTTP_URL = 'http://localhost:3000';
export const WS_URL = 'ws://localhost:8080';
```

### Database Schema

The application uses the following main entities:

- **User**: User accounts with authentication
- **Room**: Drawing rooms with admin management
- **Chat**: Chat messages within rooms

## 🚀 Deployment

### Production Deployment

This project is **currently deployed and live**:

- 🌐 **Frontend**: [https://sketchxpad.vercel.app](https://sketchxpad.vercel.app) (Vercel)
- 🔗 **HTTP Backend**: https://sketchxpad-http-backend.onrender.com (Render)
- ⚡ **WebSocket Backend**: wss://sketchxpad-ws-backend.onrender.com (Render)
- 🗄️ **Database**: Neon PostgreSQL (Serverless)

### Backend Deployment (Render)

Both HTTP and WebSocket backends are deployed on [Render](https://render.com) using their free tier.

**Live Endpoints:**
- Health Check: `https://sketchxpad-http-backend.onrender.com/health`
- Authentication: `https://sketchxpad-http-backend.onrender.com/api/auth/*`
- Rooms: `https://sketchxpad-http-backend.onrender.com/room`
- WebSocket: `wss://sketchxpad-ws-backend.onrender.com`


**Backend (Render):**

- Check service status in Render Dashboard
- View logs in the Logs tab
- Services auto-restart on failure
- Free tier services sleep after 15 minutes of inactivity (50-60s cold start)

**Database:**

```bash
# Check database connection locally
cd packages/db
pnpm prisma studio
```

### Updating Your Deployment

When you push changes to GitHub:

```bash
# Backend (Render)
# Automatic deployment on git push (if auto-deploy enabled)
# Or manually trigger deploy from Render dashboard

# Frontend (Vercel)
# Automatic deployment on git push to main branch
```



## 📊 Performance Tips

- Render free tier services sleep after 15 minutes of inactivity
- Use UptimeRobot or similar to keep services active
- Optimize WebSocket connections
- Implement rate limiting
- Use CDN for static assets (Vercel provides this)
- Monitor and optimize database queries
- Use connection pooling for database (Neon provides this)

---

## 📧 Contact

- GitHub: [@Deepak-vm](https://github.com/Deepak-vm)
- Repository: [SketchXPad](https://github.com/Deepak-vm/SketchXPad)
- Live Demo: [sketchxpad.vercel.app](https://sketchxpad.vercel.app)

---

Happy Drawing! 🎨✨
