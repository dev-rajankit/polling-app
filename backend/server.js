import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pollRoutes from './routes/pollRoutes.js';
import { setupWebSocket } from './websocket/pollSocket.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: "*" }));

app.use(express.json());

// Routes
app.use('/api/polls', pollRoutes);

// WebSocket setup
setupWebSocket(io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
