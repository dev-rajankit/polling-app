import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Poll, ConnectionStatus } from '@/types/poll';
import { getPoll, submitVote, checkIfVoted, subscribeToPolls, notifyPollUpdate } from '@/lib/pollService';
import { getFingerprint } from '@/lib/fingerprint';
import VotingInterface from '@/components/VotingInterface';
import LiveResults from '@/components/LiveResults';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

export default function PollView() {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [fingerprint, setFingerprint] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    const initializePoll = async () => {
      if (!pollId) {
        navigate('/');
        return;
      }

      try {
        // Get fingerprint
        const fp = await getFingerprint();
        setFingerprint(fp);

        // Load poll
        const loadedPoll = await getPoll(pollId);
        if (!loadedPoll) {
          toast.error('Poll not found', {
            description: 'This poll does not exist or has been removed.',
          });
          navigate('/');
          return;
        }

        setPoll(loadedPoll);

        // Check if already voted
        const voted = await checkIfVoted(pollId, fp);
        setHasVoted(voted);

        // Simulate WebSocket connection
        setConnectionStatus('connected');

        // Subscribe to poll updates
        const unsubscribe = subscribeToPolls(pollId, (updatedPoll) => {
          setPoll(updatedPoll);
        });

        setLoading(false);

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing poll:', error);
        toast.error('Error loading poll');
        setLoading(false);
      }
    };

    initializePoll();
  }, [pollId, navigate]);

  const handleVote = async (optionId: string) => {
    if (!poll || !fingerprint) return;

    setIsSubmitting(true);

    try {
      const result = await submitVote({
        pollId: poll.id,
        optionId,
        fingerprint,
      });

      if (!result.success) {
        toast.error('Vote failed', {
          description: result.error,
        });
        
        if (result.error?.includes('already voted')) {
          setHasVoted(true);
        }
        
        setIsSubmitting(false);
        return;
      }

      // Update local state
      setPoll(result.poll!);
      setHasVoted(true);

      // Notify other listeners
      notifyPollUpdate(result.poll!);

      toast.success('Vote submitted!', {
        description: 'Your vote has been recorded.',
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="poll-app-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#27272a] border-t-[#00d9ff] rounded-full animate-spin mb-4"></div>
          <p className="text-[#71717a] text-lg">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="poll-app-bg min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-16 w-16 text-[#ff4757] mx-auto mb-4" />
          <h1
            className="text-3xl font-bold text-[#fafafa] mb-2"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Poll Not Found
          </h1>
          <p className="text-[#71717a] mb-6">
            This poll doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#00d9ff] hover:bg-[#00b8d4] text-[#0f0f14] font-bold px-6 py-3 rounded-lg transition-all"
          >
            Create a New Poll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-app-bg min-h-screen py-12">
      {hasVoted || poll.closed ? (
        <LiveResults poll={poll} connectionStatus={connectionStatus} hasVoted={hasVoted} />
      ) : (
        <VotingInterface poll={poll} onSubmit={handleVote} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
