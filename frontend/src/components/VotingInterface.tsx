import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Poll } from '@/types/poll';

interface VotingInterfaceProps {
  poll: Poll;
  onSubmit: (optionId: string) => void;
  isSubmitting?: boolean;
}

export default function VotingInterface({ poll, onSubmit, isSubmitting }: VotingInterfaceProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption) {
      onSubmit(selectedOption);
    }
  };

  return (
    <div className="w-full max-w-[640px] mx-auto px-4">
      <div className="mb-12">
        <h1
          className="text-4xl font-bold text-[#fafafa] mb-2 leading-tight"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {poll.question}
        </h1>
        <p className="text-[#71717a] text-sm">
          Select one option and submit your vote
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          <div className="space-y-3">
            {poll.options.map((option, index) => (
              <Label
                key={option.id}
                htmlFor={option.id}
                className="stagger-fade-in block"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div
                  className={`relative bg-[#18181b] border rounded-xl p-5 cursor-pointer transition-all duration-200 hover:bg-[#1f1f23] ${
                    selectedOption === option.id
                      ? 'border-[#00d9ff] shadow-[0_0_20px_rgba(0,217,255,0.2)]'
                      : 'border-[#27272a] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="border-2 w-6 h-6 data-[state=checked]:border-[#00d9ff] data-[state=checked]:bg-[#00d9ff]"
                    />
                    <span className="text-lg text-[#fafafa] flex-1">
                      {option.text}
                    </span>
                  </div>
                </div>
              </Label>
            ))}
          </div>
        </RadioGroup>

        <Button
          type="submit"
          disabled={!selectedOption || isSubmitting}
          className="w-full h-14 bg-[#00d9ff] hover:bg-[#00b8d4] text-[#0f0f14] font-bold text-lg rounded-lg shadow-[0_4px_20px_rgba(0,217,255,0.3)] hover:shadow-[0_6px_24px_rgba(0,217,255,0.4)] transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Vote'}
        </Button>
      </form>
    </div>
  );
}
