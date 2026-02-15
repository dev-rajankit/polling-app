import express from 'express';
import {
  createPoll,
  getPoll,
  submitVote,
  closePoll,
  checkVoteStatus
} from '../controllers/pollController.js';

const router = express.Router();

// Create a new poll
router.post('/', createPoll);

// Get poll by ID
router.get('/:pollId', getPoll);

// Submit a vote
router.post('/:pollId/vote', submitVote);

// Close a poll
router.patch('/:pollId/close', closePoll);

// Check if user has voted
router.get('/:pollId/vote-status', checkVoteStatus);

export default router;
