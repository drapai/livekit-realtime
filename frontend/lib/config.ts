export const CONFIG = {
  API_URL:
    typeof window !== 'undefined' && window.location.hostname.includes('drap.ai')
      ? '' // Use same-origin proxy
      : 'http://localhost:8000',
  LIVEKIT_URL: 'wss://livekit.drap.ai',
  DEFAULT_ROOM: 'voice-room',
};

export interface TokenResponse {
  token: string;
  url: string;
}

export interface TranscriptMessage {
  speaker: string;
  text: string;
  timestamp: string;
}
