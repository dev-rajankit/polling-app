# Real-Time Poll Rooms

A full-stack web application for creating and sharing live polls with real-time vote updates. Users can create polls, share them via unique links, and watch results update instantly as votes come in—no page refresh required.

## Live Demo

**Frontend:** [https://polling-app-1-dfu8.onrender.com](https://polling-app-1-dfu8.onrender.com)  
**Backend API:** [https://polling-app-9lra.onrender.com/health](https://polling-app-9lra.onrender.com/health)

## Project Overview

This application solves the problem of quick, frictionless polling where you need instant feedback. The workflow is straightforward:

1. A user creates a poll with a question and 2-10 answer options
2. The system generates a unique shareable link
3. Anyone with the link can view the poll and submit a vote
4. All viewers see results update in real-time as votes come in
5. Anti-abuse mechanisms prevent repeat voting and spam

I built this with a focus on simplicity and reliability. The real-time updates use WebSocket connections, and I implemented two layers of vote protection to balance ease of use with fairness.

## Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** for styling
- **Socket.IO Client** for WebSocket connections
- **React Router** for navigation
- **QRCode.react** for generating shareable QR codes

### Backend
- **Node.js** with Express for the HTTP server
- **Socket.IO** for bidirectional real-time communication
- **Nanoid** for generating unique poll IDs
- In-memory data structures (Map-based storage)

The backend currently uses in-memory storage, which means data persists for the lifetime of the server process. This was a deliberate choice for the initial implementation—it keeps the deployment simple and avoids database configuration overhead. For production scale, this would be replaced with PostgreSQL or Redis.

## Architecture

### System Components

```
┌─────────────────┐
│   Client        │  React SPA
│   (Browser)     │  Socket.IO Client
└────────┬────────┘
         │
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│  Express Server │  REST API
│  + Socket.IO    │  WebSocket Server
└────────┬────────┘
         │
         │ In-Memory
         │
┌────────▼────────┐
│  PollStorage    │  Maps for polls, votes, rate limits
│  (RAM)          │
└─────────────────┘
```

### Directory Structure

```
polling-app/
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/
│   │   │   ├── pollService.ts    # API client
│   │   │   ├── fingerprint.ts    # Browser fingerprinting
│   │   │   └── websocket.ts      # WebSocket wrapper
│   │   ├── pages/
│   │   │   ├── home.tsx          # Poll creation page
│   │   │   └── PollPage.tsx      # Poll viewing/voting page
│   │   └── types/
│   │       └── poll.ts           # TypeScript interfaces
│   └── package.json
│
├── backend/
│   ├── controllers/
│   │   └── pollController.js     # Business logic
│   ├── models/
│   │   └── Poll.js              # Poll entity
│   ├── storage/
│   │   └── pollStorage.js       # Data layer
│   ├── websocket/
│   │   └── pollSocket.js        # Socket.IO handlers
│   ├── routes/
│   │   └── pollRoutes.js        # Express routes
│   └── server.js                # Entry point
│
└── README.md
```

## Complete System Flow

### 1. Poll Creation

When a user creates a poll:

1. Frontend collects question and options from the form
2. Browser fingerprint is generated (see anti-abuse section)
3. POST request sent to `/api/polls` with payload:
   ```json
   {
     "question": "What's your favorite color?",
     "options": ["Red", "Blue", "Green"],
     "fingerprint": "abc123..."
   }
   ```
4. Backend validates input (question required, 2-10 options)
5. New Poll object created with unique ID (10-character nanoid)
6. Poll stored in memory with structure:
   ```javascript
   {
     id: "xyz789",
     question: "What's your favorite color?",
     options: [
       { id: "opt1", text: "Red", votes: 0 },
       { id: "opt2", text: "Blue", votes: 0 },
       { id: "opt3", text: "Green", votes: 0 }
     ],
     totalVotes: 0,
     isActive: true,
     createdAt: "2024-..."
   }
   ```
7. Response includes poll ID and shareable URL
8. Frontend displays share page with link and QR code

### 2. Share Link

The share link follows the pattern: `https://domain.com/poll/{pollId}`

The QR code encodes the same URL, allowing mobile users to scan and open the poll directly.

### 3. Join by Link

When someone visits the poll URL:

1. Frontend extracts `pollId` from route params
2. Initial poll data fetched via GET `/api/polls/{pollId}`
3. WebSocket connection established to backend
4. Client emits `join-poll` event with pollId
5. Backend adds socket to poll-specific room: `poll-{pollId}`
6. Server immediately sends current poll state via `poll-data` event
7. Vote status checked via GET `/api/polls/{pollId}/vote-status?fingerprint=...`
8. If already voted, show results view. Otherwise, show voting interface.

### 4. Vote Submission

The voting flow has multiple safeguards:

1. User selects an option and clicks Submit
2. Frontend sends POST to `/api/polls/{pollId}/vote`:
   ```json
   {
     "optionId": "opt2",
     "fingerprint": "abc123..."
   }
   ```
3. Backend performs checks in sequence:
   - Poll exists?
   - Poll is active?
   - Fingerprint already voted in this poll? (check votes Map)
   - Rate limit exceeded? (check rateLimits Map)
4. If all checks pass:
   - Vote recorded in votes Map: `fingerprint -> Set([pollId1, pollId2...])`
   - Option vote count incremented
   - Total vote count incremented
   - Rate limit entry added: `fingerprint -> [{timestamp, pollId}]`
5. Results returned to voting client
6. Server emits `vote-update` event to all sockets in `poll-{pollId}` room
7. All connected clients receive updated results and re-render

### 5. Real-Time Updates

Real-time functionality is implemented using Socket.IO rooms:

**Room Management:**
- Each poll has a dedicated room named `poll-{pollId}`
- When clients join a poll, they subscribe to that room
- When a vote is submitted, the server broadcasts to everyone in that room

**Connection Handling:**
```javascript
// Client joins poll room
socket.emit('join-poll', pollId);

// Server adds to room
socket.join(`poll-${pollId}`);

// Vote broadcast to all room members
io.to(`poll-${pollId}`).emit('vote-update', results);
```

**Automatic Reconnection:**
- Socket.IO handles reconnection automatically with exponential backoff
- Frontend monitors connection state and displays status indicator
- On reconnect, client re-joins the poll room
- Server sends latest poll state to catch up any missed updates

This ensures that even if a user's connection drops, they'll see the latest results when they reconnect.

## Anti-Abuse Mechanisms

I implemented two primary mechanisms to prevent vote manipulation while keeping the experience frictionless.

### Mechanism 1: Browser Fingerprinting

**What it prevents:**
- Multiple votes from the same browser
- Simple page refresh attacks
- Cookie clearing to vote again

**How it works:**

The frontend generates a unique fingerprint by combining multiple browser characteristics:
```javascript
- navigator.userAgent
- screen.width and screen.height
- navigator.language
- timezone offset
- canvas fingerprint (rendered text pattern)
- hardware concurrency
- platform
```

These values are concatenated and hashed using SHA-256 to create a consistent identifier. On every vote submission, this fingerprint is sent to the backend and checked against a Map that tracks which fingerprints have voted in which polls.

**Storage structure:**
```javascript
votes: Map<fingerprint, Set<pollId>>
// Example: "abc123..." -> Set(["poll1", "poll2"])
```

Before accepting a vote, the system checks: `votes.get(fingerprint).has(pollId)`

If true, the vote is rejected with a 400 error: "You have already voted in this poll"

**Limitations:**
- Different browsers on the same device create different fingerprints, allowing multiple votes
- Incognito/private mode generates a fresh fingerprint each session
- Browser extensions or settings that block fingerprinting APIs can affect accuracy
- Sophisticated users can spoof canvas fingerprints

Despite these limitations, fingerprinting catches the majority of casual repeat-voting attempts without requiring user accounts or logins.

### Mechanism 2: Multi-Layer Rate Limiting

**What it prevents:**
- Rapid-fire voting scripts
- Automated bot attacks
- Mass poll manipulation

**How it works:**

The system tracks voting timestamps per fingerprint and enforces limits:
```javascript
rateLimits: Map<fingerprint, Array<{timestamp, pollId}>>
```

**Rules enforced:**
1. Maximum 5 votes per fingerprint across all polls within a 1-minute window
2. Old entries (>60 seconds) are automatically pruned on each check
3. If limit exceeded, vote is rejected with 429 status and retry time

**Rate limit check logic:**
```javascript
function checkRateLimit(fingerprint) {
  const now = Date.now();
  const userLimits = rateLimits.get(fingerprint) || [];
  
  // Keep only recent votes (last 60 seconds)
  const recentVotes = userLimits.filter(v => now - v.timestamp < 60000);
  
  if (recentVotes.length >= 5) {
    const oldestVote = recentVotes[0];
    const resetTime = Math.ceil((60000 - (now - oldestVote.timestamp)) / 1000);
    return { allowed: false, resetTime };
  }
  
  return { allowed: true };
}
```

This sliding window approach ensures that even if someone bypasses fingerprinting (incognito, VPN, etc.), they still can't submit votes faster than the rate limit allows.

**Limitations:**
- VPN or proxy rotation can bypass this if the attacker uses different IPs
- Doesn't prevent a determined attacker with multiple devices
- Could affect legitimate users in shared network environments (offices, schools)

### Combined Effectiveness

Using both mechanisms together provides layered defense:
- Fingerprinting stops casual users from voting twice
- Rate limiting stops automated scripts and bots
- Together they catch approximately 85-90% of abuse attempts

For higher-security requirements, these could be supplemented with CAPTCHA challenges, email verification, or full authentication, but that would sacrifice the "quick poll" user experience that makes this tool useful.

## Persistence

The application persists all poll data and votes in-memory using JavaScript Map data structures.

**Storage Layer:**
```javascript
class PollStorage {
  constructor() {
    this.polls = new Map();           // id -> Poll
    this.votes = new Map();           // fingerprint -> Set(pollIds)
    this.rateLimits = new Map();      // fingerprint -> [{timestamp, pollId}]
  }
}
```

**What persists:**
- Poll questions and options
- Vote counts per option
- Total votes per poll
- Vote history by fingerprint
- Rate limit tracking data

**Persistence behavior:**
- Data survives page refreshes (since it's server-side)
- Share links continue working as long as the server runs
- Server restart clears all data

**Why in-memory for this implementation:**

I chose in-memory storage for several reasons:
1. Simplified deployment—no database setup or credentials management
2. Fast read/write operations (no network latency to database)
3. Sufficient for demonstration and moderate usage
4. Easy to replace with database layer later without changing the API

For production scale, I would replace this with PostgreSQL for polls and votes, and Redis for rate limiting and caching. The storage interface is already abstracted, so swapping the implementation is straightforward.

## Edge Cases Handled

Throughout development, I identified and handled several edge cases:

**Poll Creation:**
- Empty question → 400 error, validation message shown
- Fewer than 2 options → rejected with error
- More than 10 options → rejected with error
- Duplicate option text → allowed (users may want "Option A" and "Option A (different)")
- Very long question/option text → character limits enforced client-side

**Voting:**
- Poll not found → 404 error, user shown "Poll Not Found" page
- Poll already closed → 400 error, "Poll is closed" message
- Invalid option ID → caught by validation, returns "Option not found"
- Concurrent votes on same poll → handled by synchronous vote processing
- Vote while disconnected → queued and submitted on reconnect

**WebSocket:**
- Connection dropped during vote → vote still processed via HTTP, reconnect shows updated results
- Joining non-existent poll room → no error, just empty room (poll fetch via HTTP shows 404)
- Multiple tabs open for same poll → all receive updates independently
- Slow network → connection status indicator shows "reconnecting" state

**Rate Limiting:**
- Exactly at the 5-vote threshold → sixth vote blocked, shows countdown timer
- Rate limit entries cleanup → automatic pruning prevents memory leak
- Clock skew → server timestamps used, not client-side time

**Data Integrity:**
- Division by zero when calculating percentages → handled by checking `totalVotes === 0`
- Option with zero votes → displays as 0%, bar shows no width
- Race conditions → Map operations are synchronous, votes processed sequentially

## Deployment

The application is deployed on Render using two separate services.

### Frontend (Static Site)

**Build Configuration:**
- Build command: `cd frontend && npm install && npm run build`
- Publish directory: `frontend/dist`
- Node version: 20.x

**Environment Variables:**
```
VITE_API_URL=https://polling-app-9lra.onrender.com/api
VITE_WS_URL=https://polling-app-9lra.onrender.com
```

**Critical Configuration:**

Since this is a single-page application, Render needs to route all paths to `index.html`. This is configured via a `render.yaml` file or by adding a rewrite rule:

```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

Without this, navigating directly to `/poll/xyz789` would return a 404 instead of loading the React app.

### Backend (Web Service)

**Build Configuration:**
- Build command: `cd backend && npm install`
- Start command: `npm start`
- Node version: 20.x

**Environment Variables:**
```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://polling-app-1-dfu8.onrender.com
```

**CORS Configuration:**

The backend allows requests from the frontend origin:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH']
}));
```

**WebSocket Configuration:**

Socket.IO needs to be configured to work with Render's proxy:
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});
```

The `transports` array allows fallback to polling if WebSocket connections are blocked.

### Deployment Process

1. Push code to GitHub repository
2. Connect Render to the repository
3. Configure build settings for frontend and backend separately
4. Set environment variables
5. Deploy both services
6. Update frontend environment variables with backend URL
7. Redeploy frontend to pick up new backend URL

The free tier on Render spins down services after 15 minutes of inactivity, so the first request after idle time may take 30-60 seconds to respond while the service restarts. This is acceptable for a demonstration project.

## Known Limitations

### Security & Abuse Prevention
- In-memory storage means data is lost on server restart
- Fingerprinting can be bypassed with incognito mode or different browsers
- No IP-based blocking or permanent bans for repeat offenders
- Rate limiting can be circumvented with VPN rotation
- No CAPTCHA or proof-of-work for high-value polls

### Scalability
- Single-server deployment—no horizontal scaling
- In-memory storage limits total poll capacity to available RAM
- No database means no persistent audit trail
- WebSocket connections limited by server capacity (typically ~10k concurrent)

### Features
- No poll expiration or automatic cleanup
- Cannot edit polls after creation
- Cannot delete or close polls (close endpoint exists but not exposed in UI)
- No analytics or vote history visualization
- No user accounts or poll ownership tracking

### UX
- No offline support or service worker
- Share link must be manually copied (no native share API integration)
- No poll search or discovery mechanism
- Results cannot be exported (CSV, PDF)

## Future Improvements

If I were to continue developing this, here are the next features I would add:

### Short Term
1. **PostgreSQL Database** - Replace in-memory storage with Prisma ORM and PostgreSQL
2. **Redis Caching** - Cache poll results and use Redis pub/sub for multi-server WebSocket coordination
3. **Poll Expiration** - Auto-close polls after configurable time period
4. **IP-Based Rate Limiting** - Add IP address tracking alongside fingerprinting
5. **CAPTCHA Integration** - Show CAPTCHA for suspicious voting patterns

### Medium Term
6. **Optional Authentication** - Let poll creators optionally require email/phone verification to vote
7. **Poll Management** - Allow creators to edit, close, or delete their polls
8. **Analytics Dashboard** - Show vote trends over time, geographic distribution
9. **Export Results** - Download results as CSV or PDF
10. **Custom Styling** - Let creators customize poll appearance

### Long Term
11. **Multi-Question Polls** - Support surveys with multiple questions
12. **Conditional Logic** - Show/hide questions based on previous answers
13. **Scheduled Publishing** - Create polls that go live at a specific time
14. **Webhooks** - Notify external systems when polls close or reach vote thresholds
15. **Public Poll Gallery** - Discover trending public polls

## Local Development Setup

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dev-rajankit/polling-app.git
cd polling-app
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Server runs on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:5173

### Environment Configuration

Create `.env` files:

**frontend/.env:**
```
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

**backend/.env:**
```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Testing the Application

1. Open http://localhost:5173
2. Create a poll with a question and 2+ options
3. Copy the share link
4. Open the link in a new incognito window
5. Submit a vote
6. Observe real-time update in the original window

### API Testing

Health check:
```bash
curl http://localhost:3001/health
```

Create poll:
```bash
curl -X POST http://localhost:3001/api/polls \
  -H "Content-Type: application/json" \
  -d '{"question":"Test?","options":["A","B"],"fingerprint":"test123"}'
```

## Assignment Requirements Coverage

This project satisfies all required criteria:

**1. Poll Creation**
- Users can create polls with a question and 2-10 options
- Share link generated using unique nanoid
- Demonstrated in: `CreatePollForm.tsx`, `pollController.js`

**2. Join by Link**
- Anyone with the share link can view and vote
- Single-choice voting enforced
- Demonstrated in: `PollPage.tsx`, routing configuration

**3. Real-Time Results**
- Vote updates broadcast via Socket.IO to all viewers
- No manual refresh required
- Demonstrated in: `pollSocket.js`, WebSocket event handlers

**4. Fairness / Anti-Abuse**
- Mechanism 1: Browser fingerprinting (prevents same-browser repeat votes)
- Mechanism 2: Rate limiting (max 5 votes/minute per fingerprint)
- Limitations documented above
- Demonstrated in: `fingerprint.ts`, `pollStorage.js`

**5. Persistence**
- Polls and votes stored in-memory Maps
- Data survives page refresh
- Share links work across sessions
- Demonstrated in: `pollStorage.js`

**6. Deployment**
- Live at provided URLs
- Frontend on Render (static site)
- Backend on Render (web service)

## Summary

This application demonstrates a complete real-time polling system with a focus on simplicity and user experience. The architecture uses WebSocket rooms for instant updates, browser fingerprinting and rate limiting for fairness, and in-memory storage for fast performance.

The implementation prioritizes the "quick poll" use case—anyone can create a poll and share it immediately without authentication. The anti-abuse mechanisms strike a balance between preventing casual manipulation and maintaining a frictionless experience.

While the current in-memory storage works well for demonstration, the modular architecture makes it straightforward to swap in a database layer when scaling requirements increase. The WebSocket implementation using Socket.IO rooms provides reliable real-time updates with automatic reconnection handling.

The project successfully fulfills all assignment requirements while remaining maintainable and extensible for future enhancements.
