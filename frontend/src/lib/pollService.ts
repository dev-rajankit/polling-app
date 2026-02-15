import { Poll, CreatePollRequest, VoteRequest } from '@/types/poll';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });
  }
  return socket;
};

export const getSocket = () => socket;

export async function createPoll(request: CreatePollRequest): Promise<Poll> {
  const response = await fetch(`${API_URL}/api/polls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create poll');
  }

  const result = await response.json();
  return result.poll;
}

export async function getPoll(pollId: string): Promise<Poll | null> {
  try {
    const response = await fetch(`${API_URL}/api/polls/${pollId}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch poll');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching poll:', error);
    return null;
  }
}

export async function checkIfVoted(pollId: string, fingerprint: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_URL}/api/polls/${pollId}/vote-status?fingerprint=${fingerprint}`
    );
    
    if (!response.ok) return false;
    
    const result = await response.json();
    return result.hasVoted;
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
}

export async function submitVote(request: VoteRequest): Promise<{ success: boolean; error?: string; poll?: Poll }> {
  try {
    const response = await fetch(`${API_URL}/api/polls/${request.pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        optionId: request.optionId,
        fingerprint: request.fingerprint,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to submit vote' };
    }

    const result = await response.json();
    return { success: true, poll: result.results };
  } catch (error) {
    console.error('Error submitting vote:', error);
    return { success: false, error: 'Network error' };
  }
}

export function subscribeToPolls(pollId: string, callback: (poll: Poll) => void) {
  const socket = initializeSocket();

  socket.emit('join-poll', pollId);

  const handlePollData = (poll: Poll) => callback(poll);
  const handleVoteUpdate = (poll: Poll) => callback(poll);
  const handlePollClosed = (poll: Poll) => callback(poll);

  socket.on('poll-data', handlePollData);
  socket.on('vote-update', handleVoteUpdate);
  socket.on('poll-closed', handlePollClosed);

  return () => {
    socket.emit('leave-poll', pollId);
    socket.off('poll-data', handlePollData);
    socket.off('vote-update', handleVoteUpdate);
    socket.off('poll-closed', handlePollClosed);
  };
}

export function notifyPollUpdate(_poll: Poll) {
  // No longer needed - handled by WebSocket
}
