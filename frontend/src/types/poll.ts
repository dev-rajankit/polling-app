export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
  isActive?: boolean;
  closed?: boolean;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
}

export interface VoteRequest {
  pollId: string;
  optionId: string;
  fingerprint: string;
}

export interface WebSocketMessage {
  type: 'vote_update' | 'poll_update' | 'error' | 'connection_status';
  data?: any;
  pollId?: string;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
