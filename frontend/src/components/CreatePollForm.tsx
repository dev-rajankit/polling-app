import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface CreatePollFormProps {
  onSubmit: (question: string, options: string[]) => void;
}

export default function CreatePollForm({ onSubmit }: CreatePollFormProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [errors, setErrors] = useState<{ question?: string; options?: string }>({});

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { question?: string; options?: string } = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    }

    const filledOptions = options.filter((opt) => opt.trim() !== '');
    if (filledOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(question, filledOptions);
  };

  return (
    <div className="w-full max-w-[640px] mx-auto px-4">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-[#fafafa] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Create a Poll
        </h1>
        <p className="text-[#a1a1aa] text-lg">
          Ask a question, add options, and share the link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-[0_0_40px_rgba(0,217,255,0.1)]">
          <label className="block text-[#fafafa] text-sm font-semibold mb-3 uppercase tracking-wide">
            Your Question
          </label>
          <Input
            type="text"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setErrors({ ...errors, question: undefined });
            }}
            placeholder="What's your question?"
            className="bg-[#0f0f14] border-[#27272a] text-[#fafafa] text-2xl h-16 rounded-lg focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff] transition-all"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          />
          {errors.question && (
            <p className="text-[#ff4757] text-sm mt-2">{errors.question}</p>
          )}
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-[0_0_40px_rgba(0,217,255,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-[#fafafa] text-sm font-semibold uppercase tracking-wide">
              Options
            </label>
            <span className="text-[#71717a] text-xs font-mono-data">
              {options.length} / 10
            </span>
          </div>

          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="bg-[#0f0f14] border-[#27272a] text-[#fafafa] text-lg h-14 rounded-lg focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff] transition-all"
                  />
                </div>
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="h-14 w-14 text-[#71717a] hover:text-[#ff4757] hover:bg-[#27272a] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {errors.options && (
            <p className="text-[#ff4757] text-sm mt-3">{errors.options}</p>
          )}

          {options.length < 10 && (
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              className="w-full mt-4 h-12 border-dashed border-[#27272a] text-[#00d9ff] hover:bg-[#27272a] hover:text-[#00d9ff] hover:border-[#00d9ff] transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-14 bg-[#00d9ff] hover:bg-[#00b8d4] text-[#0f0f14] font-bold text-lg rounded-lg shadow-[0_4px_20px_rgba(0,217,255,0.3)] hover:shadow-[0_6px_24px_rgba(0,217,255,0.4)] transition-all active:scale-[0.97]"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Create Poll
        </Button>
      </form>
    </div>
  );
}
