# Real-Time Polling Application

A full-stack real-time polling application with instant vote updates, anti-abuse mechanisms, and a beautiful Swiss-inspired UI with HUD accents.

## 🏗️ Architecture

```
polling-app/
├── frontend/               # React Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── lib/          # Services and utilities
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript types
│   ├── public/           # Static assets
│   ├── index.html        # Entry HTML
│   ├── vite.config.ts    # Vite configuration
│   └── package.json      # Frontend dependencies
│
├── backend/              # Express + Socket.IO Backend
│   ├── controllers/      # Business logic
│   ├── models/          # Data models
│   ├── storage/         # Data persistence
│   ├── websocket/       # Real-time handlers
│   ├── server.js        # Entry point
│   └── package.json     # Backend dependencies
│
├── vite.config.ts       # Root Vite config (monorepo)
├── tsconfig.json        # Root TypeScript config
└── package.json         # Root scripts
```

## 🚀 Tech Stack

**Frontend:** React 18 • TypeScript • Vite • Tailwind CSS • Socket.IO Client • FingerprintJS  
**Backend:** Node.js • Express • Socket.IO • In-memory storage (ready for DB)

## 🎯 Features

✅ Poll creation with 2-10 options  
✅ Real-time vote updates via WebSocket  
✅ Shareable links with QR codes  
✅ Browser fingerprint-based vote tracking  
✅ Rate limiting (5 votes/minute)  
✅ Duplicate vote prevention  
✅ Connection status indicators  
✅ Smooth animations  

## 📦 Quick Start

### Install All Dependencies

```bash
npm install
npm run backend:install
```

### Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run backend
```

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:3001

## 🔧 Environment Setup

### Frontend (.env.local in root)
```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

### Backend (.env in backend/)
```
PORT=3001
NODE_ENV=development
```

## 📚 API Endpoints

```
POST   /api/polls              - Create poll
GET    /api/polls/:id          - Get poll
POST   /api/polls/:id/vote     - Submit vote
GET    /api/polls/:id/vote-status - Check vote status
PATCH  /api/polls/:id/close    - Close poll
```

## 🔌 WebSocket Events

**Client → Server:** `join-poll`, `leave-poll`  
**Server → Client:** `poll-data`, `vote-update`, `poll-closed`

## 🎨 Design System

Swiss International with HUD Accents  
**Colors:** Deep charcoal (#0f0f14) • Electric cyan (#00d9ff) • Crisp white (#fafafa)  
**Fonts:** Space Grotesk • Inter • JetBrains Mono

## 📁 Project Structure Details

### Frontend Structure
```
frontend/src/
├── components/
│   ├── CreatePollForm.tsx    # Poll creation form
│   ├── VotingInterface.tsx   # Vote submission UI
│   ├── LiveResults.tsx       # Real-time results display
│   ├── ShareLink.tsx         # Share link with QR code
│   └── ui/                   # ShadCN components
├── lib/
│   ├── pollService.ts        # API client & WebSocket
│   ├── fingerprint.ts        # Browser fingerprinting
│   └── utils.ts              # Helper functions
├── pages/
│   └── PollView.tsx          # Poll viewing page
└── types/
    └── poll.ts               # TypeScript interfaces
```

### Backend Structure
```
backend/
├── controllers/
│   └── pollController.js     # Poll business logic
├── models/
│   └── Poll.js              # Poll entity class
├── storage/
│   └── pollStorage.js       # In-memory storage
├── websocket/
│   └── pollSocket.js        # WebSocket handlers
└── server.js                # Express + Socket.IO setup
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
cd backend
# Deploy with npm start
```

## 📝 License

MIT License
