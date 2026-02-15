import { useEffect, useState } from 'react';
import { Poll, ConnectionStatus } from '@/types/poll';
import { Badge } from '@/components/ui/badge';

interface LiveResultsProps {
  poll: Poll;
  connectionStatus?: ConnectionStatus;
  hasVoted?: boolean;
}

export default function LiveResults({ poll, connectionStatus = 'connected', hasVoted }: LiveResultsProps) {
  const [animatedVotes, setAnimatedVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize animated votes
    const initial: Record<string, number> = {};
    poll.options.forEach((option) => {
      initial[option.id] = option.votes;
    });
    setAnimatedVotes(initial);
  }, [poll.id]);

  useEffect(() => {
    // Animate vote changes
    const newVotes: Record<string, number> = {};
    poll.options.forEach((option) => {
      newVotes[option.id] = option.votes;
    });
    
    // Trigger animation by updating state
    setAnimatedVotes(newVotes);
  }, [poll.options]);

  const getPercentage = (votes: number): number => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const getConnectionBadge = () => {
    const statusConfig = {
      connected: { label: 'Connected', className: 'bg-[#2dd4bf] text-[#0f0f14]' },
      connecting: { label: 'Connecting...', className: 'bg-[#fbbf24] text-[#0f0f14]' },
      disconnected: { label: 'Disconnected', className: 'bg-[#ff4757] text-white' },
      reconnecting: { label: 'Reconnecting...', className: 'bg-[#fbbf24] text-[#0f0f14]' },
    };

    const config = statusConfig[connectionStatus];
    return (
      <Badge className={`${config.className} text-xs uppercase tracking-wide`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-[800px] mx-auto px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2
              className="text-3xl font-bold text-[#fafafa]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {poll.question}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00d9ff] rounded-full pulse-dot"></div>
            <span className="text-[#00d9ff] text-sm font-semibold uppercase tracking-wide">
              Live Results
            </span>
          </div>
          {getConnectionBadge()}
          {hasVoted && (
            <Badge className="bg-[#00d9ff] text-[#0f0f14] text-xs uppercase tracking-wide">
              You Voted
            </Badge>
          )}
          {poll.closed && (
            <Badge className="bg-[#ff4757] text-white text-xs uppercase tracking-wide">
              Voting Closed
            </Badge>
          )}
        </div>
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-8 shadow-[0_0_40px_rgba(0,217,255,0.1)]">
        <div className="mb-6">
          <p className="text-[#71717a] text-sm uppercase tracking-wide">Total Votes</p>
          <p className="text-4xl font-bold text-[#fafafa] font-mono-data">{poll.totalVotes}</p>
        </div>

        <div className="space-y-6">
          {poll.options.map((option, index) => {
            const percentage = getPercentage(option.votes);
            return (
              <div
                key={option.id}
                className="stagger-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[#fafafa] text-lg font-medium">{option.text}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[#71717a] text-sm font-mono-data">{option.votes} votes</span>
                    <span className="text-[#00d9ff] text-2xl font-bold font-mono-data min-w-[60px] text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
                <div className="relative w-full h-3 bg-[#27272a] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#00d9ff] rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[#71717a] text-sm">
          Results update in real-time as votes come in
        </p>
      </div>
    </div>
  );
}
