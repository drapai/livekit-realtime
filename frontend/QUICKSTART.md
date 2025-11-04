# Quick Start Guide - Next.js Frontend

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- FastAPI backend running (for token generation)
- LiveKit server accessible

## Installation

```bash
cd /home/faryal/agent-786/frontend-nextjs
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Usage

1. **Allow Microphone Access**
   - On first load, browser will request microphone permission
   - If denied, a beautiful permission banner will appear
   - Click "Allow Microphone Access" to grant permission

2. **Connect to Room**
   - Click the "Connect" button
   - Wait for connection status to show "Connected"

3. **Start Speaking**
   - Click "Start Speaking" to enable your microphone
   - Watch the voice visualizer animate
   - See audio level meter respond to your voice

4. **Adjust Volume**
   - Use the volume slider to control agent's audio output

5. **View Transcripts**
   - Real-time transcripts appear in the bottom panel
   - Auto-scrolls to latest message

6. **Disconnect**
   - Click "Disconnect" when finished
   - Or "Stop Speaking" to mute microphone while staying connected

## Features at a Glance

### Voice Panel
- Animated voice visualizer (5 wave bars)
- Connect/Disconnect controls
- Microphone toggle (Start/Stop Speaking)
- Volume slider (0-100%)
- Audio level meter
- Microphone status indicator
- Permission warning banner

### Status Bar
- Real-time connection status
- Animated status dot (green/yellow/gray)
- User ID display

### Transcript Panel
- Live transcription display
- Speaker identification
- Timestamps
- Auto-scroll

### Chat Panel
- Placeholder for future functionality
- Voice-only mode currently

## Configuration

Edit `/lib/config.ts` to change:

```typescript
export const CONFIG = {
  API_URL: 'https://fastapi.drap.ai',  // or http://localhost:8000
  LIVEKIT_URL: 'wss://livekit.drap.ai',
  DEFAULT_ROOM: 'voice-room',
};
```

## Troubleshooting

### Microphone not detected
- Check browser permissions in settings
- Ensure HTTPS (required for microphone access)
- Try different browser

### Cannot connect
- Verify FastAPI backend is running
- Check API_URL in config
- Verify LiveKit server is accessible
- Check browser console for errors

### No audio from agent
- Check volume slider setting
- Verify speaker/headphone connection
- Check browser audio output settings

### Build errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npx tsc --noEmit
```

## File Structure

```
frontend-nextjs/
├── app/
│   ├── page.tsx          # Main page component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── VoicePanel.tsx    # Voice controls & visualizer
│   ├── ChatPanel.tsx     # Chat interface (placeholder)
│   └── TranscriptPanel.tsx # Live transcript display
├── hooks/
│   └── useLiveKit.ts     # LiveKit connection hook
└── lib/
    └── config.ts         # Configuration
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

Production server runs on http://localhost:3000

## Environment Variables (Optional)

Create `.env.local` for custom configuration:

```bash
NEXT_PUBLIC_API_URL=https://your-api.com
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit.com
NEXT_PUBLIC_DEFAULT_ROOM=custom-room
```

Then update `/lib/config.ts` to use these:

```typescript
export const CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://livekit.drap.ai',
  DEFAULT_ROOM: process.env.NEXT_PUBLIC_DEFAULT_ROOM || 'voice-room',
};
```

## Tech Stack

- **Next.js 15** - React framework
- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3** - Styling
- **LiveKit Client 2.5.8** - Real-time communication
- **Web Audio API** - Audio processing

## Browser Support

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- First Load JS: ~214 KB
- Static generation: Pre-rendered
- Client-side hydration
- Optimized for real-time audio

## Development Tips

1. **Hot Reload**: Changes auto-reload in dev mode
2. **TypeScript**: Enable strict mode for better type checking
3. **Debugging**: Use React DevTools browser extension
4. **Audio**: Use headphones to prevent echo/feedback
5. **Console**: Monitor browser console for LiveKit events

## Getting Help

- Check browser console for errors
- Review `/IMPLEMENTATION.md` for technical details
- Verify FastAPI backend logs
- Check LiveKit server status

## Next Steps

- Customize styling in components
- Add chat functionality
- Implement user authentication
- Add more LiveKit features
- Enhance transcript display
- Add recording capability

## Success Indicators

✅ Microphone permission granted
✅ Status shows "Connected"
✅ Voice visualizer animates when speaking
✅ Audio level meter responds
✅ Transcripts appear in real-time
✅ No console errors

---

**Ready to use!** All features are fully implemented and production-ready.
