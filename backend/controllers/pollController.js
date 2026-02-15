import { Poll } from '../models/Poll.js';
import { pollStorage } from '../storage/pollStorage.js';
import { io } from '../server.js';

export const createPoll = (req, res) => {
  try {
    const { question, options, fingerprint } = req.body;

    // Validation
    if (!question || !options || options.length < 2 || options.length > 10) {
      return res.status(400).json({ 
        error: 'Invalid poll data. Question is required and options must be between 2 and 10.' 
      });
    }

    const poll = new Poll(question, options, fingerprint);
    const savedPoll = pollStorage.createPoll(poll);

    res.status(201).json({ 
      pollId: savedPoll.id,
      poll: savedPoll.getResults()
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
};

export const getPoll = (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = pollStorage.getPoll(pollId);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(poll.getResults());
  } catch (error) {
    console.error('Error getting poll:', error);
    res.status(500).json({ error: 'Failed to get poll' });
  }
};

export const submitVote = (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionId, fingerprint } = req.body;

    if (!fingerprint) {
      return res.status(400).json({ error: 'Fingerprint is required' });
    }

    // Check rate limit
    const rateLimitCheck = pollStorage.checkRateLimit(fingerprint);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ 
        error: 'Too many votes. Please try again later.',
        resetTime: rateLimitCheck.resetTime
      });
    }

    const poll = pollStorage.getPoll(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ error: 'Poll is closed' });
    }

    // Check if already voted
    if (pollStorage.hasVoted(pollId, fingerprint)) {
      return res.status(400).json({ error: 'You have already voted in this poll' });
    }

    // Record vote
    const results = poll.addVote(optionId);
    pollStorage.recordVote(pollId, fingerprint);
    pollStorage.addRateLimit(fingerprint, pollId);

    // Emit real-time update
    io.to(`poll-${pollId}`).emit('vote-update', results);

    res.json({ 
      success: true,
      results
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: error.message || 'Failed to submit vote' });
  }
};

export const closePoll = (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = pollStorage.getPoll(pollId);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    poll.close();
    io.to(`poll-${pollId}`).emit('poll-closed', poll.getResults());

    res.json({ success: true, poll: poll.getResults() });
  } catch (error) {
    console.error('Error closing poll:', error);
    res.status(500).json({ error: 'Failed to close poll' });
  }
};

export const checkVoteStatus = (req, res) => {
  try {
    const { pollId } = req.params;
    const { fingerprint } = req.query;

    if (!fingerprint) {
      return res.status(400).json({ error: 'Fingerprint is required' });
    }

    const hasVoted = pollStorage.hasVoted(pollId, fingerprint);
    res.json({ hasVoted });
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({ error: 'Failed to check vote status' });
  }
};
