import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareLinkProps {
  pollId: string;
  onCreateAnother: () => void;
}

export default function ShareLink({ pollId, onCreateAnother }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);
  const pollUrl = `${window.location.origin}/poll/${pollId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openPoll = () => {
    window.open(pollUrl, '_blank');
  };

  return (
    <div className="w-full max-w-[640px] mx-auto px-4">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2dd4bf] rounded-full mb-4">
          <Check className="h-8 w-8 text-[#0f0f14]" />
        </div>
        <h1 className="text-5xl font-bold text-[#fafafa] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Poll Created!
        </h1>
        <p className="text-[#a1a1aa] text-lg">
          Share this link with anyone to collect votes
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-[0_0_40px_rgba(0,217,255,0.1)]">
          <label className="block text-[#fafafa] text-sm font-semibold mb-3 uppercase tracking-wide">
            Share Link
          </label>
          <div className="flex gap-3">
            <div className="flex-1 bg-[#0f0f14] border border-[#27272a] rounded-lg px-4 py-3 overflow-x-auto">
              <code className="text-[#00d9ff] font-mono-data text-sm break-all">
                {pollUrl}
              </code>
            </div>
            <Button
              onClick={copyToClipboard}
              className={`h-auto px-6 ${
                copied
                  ? 'bg-[#2dd4bf] hover:bg-[#2dd4bf]'
                  : 'bg-[#00d9ff] hover:bg-[#00b8d4]'
              } text-[#0f0f14] font-bold rounded-lg shadow-[0_4px_20px_rgba(0,217,255,0.3)] transition-all active:scale-[0.97]`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-[0_0_40px_rgba(0,217,255,0.1)]">
          <label className="block text-[#fafafa] text-sm font-semibold mb-4 uppercase tracking-wide">
            QR Code
          </label>
          <div className="flex justify-center bg-white p-6 rounded-lg">
            <QRCodeSVG value={pollUrl} size={200} level="M" />
          </div>
          <p className="text-[#71717a] text-sm text-center mt-4">
            Scan to open poll on mobile devices
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={openPoll}
            variant="outline"
            className="flex-1 h-14 border-[#27272a] text-[#fafafa] hover:bg-[#27272a] hover:text-[#00d9ff] hover:border-[#00d9ff] rounded-lg transition-all"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Poll
          </Button>
          <Button
            onClick={onCreateAnother}
            className="flex-1 h-14 bg-[#00d9ff] hover:bg-[#00b8d4] text-[#0f0f14] font-bold rounded-lg shadow-[0_4px_20px_rgba(0,217,255,0.3)] transition-all active:scale-[0.97]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Create Another
          </Button>
        </div>
      </div>
    </div>
  );
}
