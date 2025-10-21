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
- PostgreSQL database (recommended [Neon](https://neon.tech/))

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

This project is currently deployed and live:

- **Frontend**: Deploy to [Vercel](https://vercel.com) (recommended)
- **Backend**: Deployed on AWS EC2 Free Tier
- **Database**: Neon PostgreSQL (Serverless)

### Backend Deployment (AWS EC2)

📖 **[Complete EC2 Deployment Guide →](DEPLOY_EC2.md)**

Step-by-step guide to deploy your SketchXPad backends on AWS EC2 Free Tier, including:
- EC2 instance setup and configuration
- Installing Node.js, pnpm, and PM2
- Building and deploying both backends
- Process management and auto-restart
- Security group configuration
- Optional Nginx reverse proxy and HTTPS setup

**Quick Summary:**
1. Launch EC2 t2.micro instance (Ubuntu 22.04)
2. Install dependencies (Node.js 20, pnpm, PM2)
3. Clone repository and install packages
4. Configure environment variables
5. Build all packages with `pnpm run build`
6. Start servers with PM2
7. Configure security groups for ports 3000, 8080

### Frontend Deployment (Vercel)

#### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your repository: `Deepak-vm/SketchXPad`
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/sketchXpad-frontend`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`
5. Click **"Deploy"**

#### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd apps/sketchXpad-frontend

# Login and deploy
vercel login
vercel

# Deploy to production
vercel --prod
```

### Frontend Configuration for Production

Update `apps/sketchXpad-frontend/src/.config.ts` with your deployed backend URLs:

```typescript
// Production configuration
export const HTTP_URL = 'http://your-ec2-ip:3000';
export const WS_URL = 'ws://your-ec2-ip:8080';

// Or with custom domain
export const HTTP_URL = 'https://api.your-domain.com';
export const WS_URL = 'wss://ws.your-domain.com';
```

### Environment Variables

Ensure these are set in your deployment environments:

**Backend (EC2):**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `PORT` - Server port (3000 for HTTP, 8080 for WebSocket)

**Frontend (Vercel):**
- `VITE_HTTP_URL` - HTTP backend URL (optional, can use .config.ts)
- `VITE_WS_URL` - WebSocket backend URL (optional, can use .config.ts)

### Post-Deployment Checklist

- [ ] Backend health check accessible: `http://your-ec2-ip:3000/health`
- [ ] WebSocket server responding: `ws://your-ec2-ip:8080`
- [ ] Database migrations deployed
- [ ] PM2 processes running and saved
- [ ] PM2 startup configured for auto-restart
- [ ] EC2 Security Groups configured (ports 22, 80, 443, 3000, 8080)
- [ ] Frontend deployed to Vercel
- [ ] Frontend connected to backend successfully
- [ ] CORS configured properly on backend
- [ ] SSL/HTTPS configured (optional, via Cloudflare or Nginx)

### Monitoring & Maintenance

**Backend (EC2):**
```bash
# Check PM2 status
pm2 list

# View logs
pm2 logs

# Restart services
pm2 restart all

# Monitor resources
pm2 monit
```

**Database:**
```bash
# Check database connection
cd packages/db
pnpm prisma studio
```

### Updating Your Deployment

When you push changes to GitHub:

```bash
# On EC2 (Backend)
cd ~/SketchXPad
git pull origin main
pnpm install
pnpm run build
pm2 restart all

# On Vercel (Frontend)
# Automatic deployment on git push (if configured)
# Or manually: vercel --prod
```

## 🔒 Security Considerations

- Always use environment variables for secrets
- Enable HTTPS for production (use Cloudflare or Let's Encrypt)
- Configure CORS properly (don't use `*` in production)
- Use strong JWT secrets
- Keep dependencies updated
- Regular security audits with `pnpm audit`
- Use PM2 for process management and monitoring
- Configure proper firewall rules on EC2

## 📊 Performance Tips

- Enable gzip compression on Nginx
- Use PM2 cluster mode for load balancing
- Optimize WebSocket connections
- Implement rate limiting
- Use CDN for static assets (Vercel provides this)
- Monitor and optimize database queries
- Use connection pooling for database

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Contact

- GitHub: [@Deepak-vm](https://github.com/Deepak-vm)
- Repository: [SketchXPad](https://github.com/Deepak-vm/SketchXPad)

---

**Happy Drawing! 🎨✨**