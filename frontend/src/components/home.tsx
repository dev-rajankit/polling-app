import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePollForm from './CreatePollForm';
import ShareLink from './ShareLink';
import { createPoll } from '@/lib/pollService';

function Home() {
  const [createdPollId, setCreatedPollId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreatePoll = async (question: string, options: string[]) => {
    try {
      const poll = await createPoll({ question, options });
      setCreatedPollId(poll.id);
    } catch (error) {
      console.error('Failed to create poll:', error);
      alert('Failed to create poll. Please try again.');
    }
  };

  const handleCreateAnother = () => {
    setCreatedPollId(null);
  };

  return (
    <div className="poll-app-bg min-h-screen py-12">
      {createdPollId ? (
        <ShareLink pollId={createdPollId} onCreateAnother={handleCreateAnother} />
      ) : (
        <CreatePollForm onSubmit={handleCreatePoll} />
      )}
    </div>
  );
}

export default Home
