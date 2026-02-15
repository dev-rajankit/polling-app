import { nanoid } from 'nanoid';

// In-memory storage (replace with database in production)
class PollStorage {
  constructor() {
    this.polls = new Map();
    this.votes = new Map(); // fingerprint -> Set of pollIds
    this.rateLimits = new Map(); // fingerprint -> [{timestamp, pollId}]
  }

  createPoll(poll) {
    const id = nanoid(10);
    poll.id = id;
    this.polls.set(id, poll);
    return poll;
  }

  getPoll(id) {
    return this.polls.get(id) || null;
  }

  hasVoted(pollId, fingerprint) {
    const userVotes = this.votes.get(fingerprint);
    return userVotes ? userVotes.has(pollId) : false;
  }

  recordVote(pollId, fingerprint) {
    if (!this.votes.has(fingerprint)) {
      this.votes.set(fingerprint, new Set());
    }
    this.votes.get(fingerprint).add(pollId);
  }

  checkRateLimit(fingerprint) {
    const now = Date.now();
    const userLimits = this.rateLimits.get(fingerprint) || [];
    
    // Remove votes older than 1 minute
    const recentVotes = userLimits.filter(vote => now - vote.timestamp < 60000);
    this.rateLimits.set(fingerprint, recentVotes);

    if (recentVotes.length >= 5) {
      const oldestVote = recentVotes[0];
      const resetTime = Math.ceil((60000 - (now - oldestVote.timestamp)) / 1000);
      return { allowed: false, resetTime };
    }

    return { allowed: true };
  }

  addRateLimit(fingerprint, pollId) {
    const userLimits = this.rateLimits.get(fingerprint) || [];
    userLimits.push({ timestamp: Date.now(), pollId });
    this.rateLimits.set(fingerprint, userLimits);
  }

  getAllPolls() {
    return Array.from(this.polls.values());
  }

  deletePoll(id) {
    return this.polls.delete(id);
  }
}

export const pollStorage = new PollStorage();
