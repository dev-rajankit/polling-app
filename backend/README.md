# Polling App Backend

Real-time polling application backend built with Express.js and Socket.IO.

## Architecture

```
backend/
├── server.js                 # Express server setup and entry point
├── controllers/              # Request handlers and business logic
│   └── pollController.js     # Poll CRUD operations
├── models/                   # Data models
│   └── Poll.js              # Poll entity class
├── routes/                   # API route definitions
│   └── pollRoutes.js        # Poll endpoints
├── storage/                  # Data persistence layer
│   └── pollStorage.js       # In-memory storage (replace with DB)
└── websocket/               # WebSocket handlers
    └── pollSocket.js        # Real-time event handling
```

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Poll Management

- **POST** `/api/polls` - Create a new poll
  ```json
  {
    "question": "What's your favorite color?",
    "options": ["Red", "Blue", "Green"],
    "fingerprint": "user_unique_id"
  }
  ```

- **GET** `/api/polls/:pollId` - Get poll details
- **POST** `/api/polls/:pollId/vote` - Submit a vote
  ```json
  {
    "optionId": "option_id",
    "fingerprint": "user_unique_id"
  }
  ```

- **GET** `/api/polls/:pollId/vote-status?fingerprint=xxx` - Check if user voted
- **PATCH** `/api/polls/:pollId/close` - Close a poll

### WebSocket Events

**Client → Server:**
- `join-poll` - Join poll room for real-time updates
- `leave-poll` - Leave poll room

**Server → Client:**
- `poll-data` - Initial poll data on join
- `vote-update` - Live vote count updates
- `poll-closed` - Poll closed notification

## Features

- ✅ RESTful API for poll operations
- ✅ Real-time updates via WebSocket
- ✅ Browser fingerprint-based vote tracking
- ✅ Rate limiting (5 votes per minute)
- ✅ Duplicate vote prevention
- ✅ In-memory storage (ready for DB migration)

## Production Considerations

Replace in-memory storage with:
- **PostgreSQL** - Relational data with strong consistency
- **MongoDB** - Document-based, flexible schema
- **Redis** - Fast vote tracking and rate limiting

Add:
- Authentication/Authorization
- Database migrations
- Request validation middleware
- Logging (Winston/Pino)
- Error monitoring (Sentry)
- API documentation (Swagger)
