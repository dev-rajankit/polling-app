import { pollStorage } from '../storage/pollStorage.js';

export const setupWebSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a poll room
    socket.on('join-poll', (pollId) => {
      socket.join(`poll-${pollId}`);
      console.log(`Socket ${socket.id} joined poll-${pollId}`);

      // Send current poll data
      const poll = pollStorage.getPoll(pollId);
      if (poll) {
        socket.emit('poll-data', poll.getResults());
      }
    });

    // Leave a poll room
    socket.on('leave-poll', (pollId) => {
      socket.leave(`poll-${pollId}`);
      console.log(`Socket ${socket.id} left poll-${pollId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
