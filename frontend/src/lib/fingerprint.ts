import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fingerprintPromise: Promise<string> | null = null;

export async function getFingerprint(): Promise<string> {
  if (!fingerprintPromise) {
    fingerprintPromise = (async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        return result.visitorId;
      } catch (error) {
        console.error('Error generating fingerprint:', error);
        // Fallback to a session-based ID
        let sessionId = sessionStorage.getItem('poll-session-id');
        if (!sessionId) {
          sessionId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
          sessionStorage.setItem('poll-session-id', sessionId);
        }
        return sessionId;
      }
    })();
  }
  return fingerprintPromise;
}
