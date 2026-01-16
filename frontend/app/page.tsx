'use client';

import { useState, useEffect } from 'react';
import { useLiveKit } from '@/hooks/useLiveKit';

export default function Home() {
  const {
    connectionStatus,
    isSpeaking,
    audioLevel,
    agentAudioLevel,
    chatMessages,
    sendChatMessage,
    connect,
    disconnect,
    toggleSpeaking,
    setVolume,
    error,
  } = useLiveKit();

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [animatedBars, setAnimatedBars] = useState<number[]>([20, 35, 50, 65, 45, 30, 55, 40]);
  const [agentJoined, setAgentJoined] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'blue' | 'purple'>('dark');

  // Animation states
  const [isBlinking, setIsBlinking] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; size: number; opacity: number}>>([]);

  // Animate audio bars (respond to both user speaking and agent speaking)
  useEffect(() => {
    const isActive = isSpeaking || audioLevel > 5 || agentAudioLevel > 5;
    const activeLevel = Math.max(audioLevel, agentAudioLevel);

    if (isActive) {
      const interval = setInterval(() => {
        setAnimatedBars(prev => prev.map(() =>
          Math.max(15, Math.min(80, activeLevel * 0.8 + Math.random() * 30))
        ));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAnimatedBars([20, 35, 50, 65, 45, 30, 55, 40]);
    }
  }, [isSpeaking, audioLevel, agentAudioLevel]);

  // Detect agent joining (simulate with connection + delay)
  useEffect(() => {
    if (connectionStatus === 'connected') {
      // Simulate agent joining after 2 seconds
      const timer = setTimeout(() => setAgentJoined(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setAgentJoined(false);
    }
  }, [connectionStatus]);

  // Eye blinking effect - random intervals
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150); // Blink duration
    }, Math.random() * 3000 + 2000); // Random 2-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Particle effects when speaking
  useEffect(() => {
    if (isSpeaking || agentAudioLevel > 5) {
      const particleInterval = setInterval(() => {
        const newParticle = {
          id: Date.now(),
          x: Math.random() * 300 - 150,
          y: Math.random() * 300 - 150,
          size: Math.random() * 6 + 2,
          opacity: Math.random() * 0.5 + 0.3,
        };
        setParticles(prev => [...prev.slice(-15), newParticle]); // Keep max 15 particles
      }, 200);

      return () => clearInterval(particleInterval);
    } else {
      setParticles([]);
    }
  }, [isSpeaking, agentAudioLevel]);

  // Theme colors
  const themeColors = {
    dark: { bg: 'bg-[#0a1628]', card: 'bg-[#0d1e36]', accent: 'indigo' },
    blue: { bg: 'bg-[#0a1628]', card: 'bg-[#0d1e36]', accent: 'cyan' },
    purple: { bg: 'bg-[#0a1628]', card: 'bg-[#0d1e36]', accent: 'purple' },
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (err) {
      console.error('Connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolumeState(newVolume);
    setVolume(newVolume / 100);
  };

  const handleSendChat = () => {
    if (chatInput.trim() && connectionStatus === 'connected') {
      sendChatMessage(chatInput);
      setChatInput('');
    }
  };

  // Get current time
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="min-h-screen bg-[#0a1628] text-white overflow-hidden">
      <div className="flex h-screen">
        {/* Left Sidebar - Dark Blue */}
        <div className="w-24 bg-[#0d1e36] flex flex-col items-center py-6 rounded-r-3xl">
          {/* User Avatar */}
          <div className="mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#1a3a5c] flex items-center justify-center border-2 border-[#2a5a8c]">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-xs text-center mt-2 text-gray-400">Amanda</p>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-3 flex-1">
            {/* Boost/Connect */}
            <button
              onClick={connectionStatus === 'disconnected' ? handleConnect : undefined}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                connectionStatus === 'connected'
                  ? 'bg-gradient-to-br from-orange-500 to-red-500'
                  : 'bg-[#1a3a5c] hover:bg-[#2a4a6c]'
              }`}
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </button>
            <p className="text-xs text-center text-cyan-400">
              {connectionStatus === 'connected' ? 'Live' : 'Boost'}
            </p>

            {/* Clean/Speak */}
            <button
              onClick={connectionStatus === 'connected' ? toggleSpeaking : undefined}
              disabled={connectionStatus !== 'connected'}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                isSpeaking
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : connectionStatus === 'connected'
                  ? 'bg-[#1a3a5c] hover:bg-[#2a4a6c]'
                  : 'bg-[#1a3a5c] opacity-50'
              }`}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <p className="text-xs text-center text-gray-400">Clean</p>

            {/* Settings */}
            <button className="w-14 h-14 rounded-2xl bg-[#1a3a5c] hover:bg-[#2a4a6c] flex items-center justify-center transition-all">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <p className="text-xs text-center text-gray-400">Settings</p>
          </div>

          {/* Disconnect */}
          <button
            onClick={disconnect}
            disabled={connectionStatus === 'disconnected'}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 ${
              connectionStatus === 'connected'
                ? 'bg-red-500/20 hover:bg-red-500/40 border border-red-500/30'
                : 'bg-[#1a3a5c] hover:bg-red-500/30'
            }`}
          >
            <svg className={`w-7 h-7 ${connectionStatus === 'connected' ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
          <p className={`text-xs text-center mt-1 ${connectionStatus === 'connected' ? 'text-red-400' : 'text-gray-400'}`}>Disconnect</p>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Center Panel - Info Cards */}
          <div className="w-80 p-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{currentTime}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">AI Assistant</span>
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeWidth={2} stroke="currentColor" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {/* Card 1: Agent Status */}
            <div className="bg-[#0d1e36] rounded-3xl p-6">
              <h1 className="text-2xl font-bold text-white mb-1">Agent</h1>
              <h2 className="text-2xl font-bold text-white">Status</h2>

              {/* Agent status indicator */}
              <div className="flex items-center gap-4 mt-6">
                <div className="w-12 h-12 rounded-xl bg-[#1a3a5c] flex items-center justify-center">
                  {connectionStatus === 'disconnected' ? (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  ) : !agentJoined ? (
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {/* Status indicator */}
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'disconnected'
                        ? 'bg-gray-500'
                        : !agentJoined
                        ? 'bg-yellow-400 animate-pulse'
                        : 'bg-green-400'
                    }`}></div>
                    <span className={`text-sm ${
                      connectionStatus === 'disconnected'
                        ? 'text-gray-400'
                        : !agentJoined
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}>
                      {connectionStatus === 'disconnected'
                        ? 'Not Connected'
                        : !agentJoined
                        ? 'Waiting for Agent...'
                        : 'Agent Ready'}
                    </span>
                  </div>
                  {connectionStatus === 'connected' && !agentJoined && (
                    <p className="text-xs text-gray-500 mt-1">Please wait...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Connection & Audio Level */}
            <div className="bg-[#0d1e36] rounded-3xl p-5">
              <p className="text-gray-400 text-sm mb-3">Audio Level</p>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  {/* Audio Level Bars */}
                  <div className="flex items-end justify-center gap-1.5 h-20">
                    {animatedBars.map((height, i) => (
                      <div
                        key={i}
                        className="w-5 rounded-sm transition-all duration-100"
                        style={{
                          height: `${height}%`,
                          background: i < 4
                            ? 'linear-gradient(to top, #f97316, #fb923c)'
                            : 'linear-gradient(to top, #22c55e, #4ade80)',
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{Math.round(audioLevel)}%</p>
                  <p className="text-xs text-gray-400">Level</p>
                </div>
              </div>

              {/* Connect Button */}
              <button
                onClick={connectionStatus === 'disconnected' ? handleConnect : toggleSpeaking}
                disabled={isConnecting || (connectionStatus === 'connected' && !agentJoined)}
                className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all ${
                  connectionStatus === 'disconnected'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                    : isSpeaking
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                } disabled:opacity-50`}
              >
                {isConnecting
                  ? 'Connecting...'
                  : connectionStatus === 'disconnected'
                  ? 'Connect'
                  : !agentJoined
                  ? 'Waiting...'
                  : isSpeaking
                  ? 'Stop Speaking'
                  : 'Start Speaking'}
              </button>
            </div>

            {/* Card 3: Chat Mode & Theme */}
            <div className="bg-[#0d1e36] rounded-3xl p-5">
              <p className="text-gray-400 text-sm mb-3">Options</p>

              {/* Chat Mode */}
              <button
                onClick={() => setShowChat(true)}
                className="w-full flex items-center gap-3 p-3 bg-[#1a3a5c] hover:bg-[#2a4a6c] rounded-xl transition-all mb-3"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm text-white font-medium">Chat Mode</p>
                  <p className="text-xs text-gray-500">Text conversation</p>
                </div>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Theme Selector */}
              <div className="p-3 bg-[#1a3a5c] rounded-xl">
                <p className="text-xs text-gray-400 mb-2">Theme</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentTheme('dark')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentTheme === 'dark'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-[#0d1e36] text-gray-400 hover:text-white'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setCurrentTheme('blue')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentTheme === 'blue'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-[#0d1e36] text-gray-400 hover:text-white'
                    }`}
                  >
                    Blue
                  </button>
                  <button
                    onClick={() => setCurrentTheme('purple')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentTheme === 'purple'
                        ? 'bg-purple-500 text-white'
                        : 'bg-[#0d1e36] text-gray-400 hover:text-white'
                    }`}
                  >
                    Purple
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Cute Chatbot Character */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {/* Background glow */}
            <div className={`absolute w-[500px] h-[500px] rounded-full blur-3xl transition-all duration-700 ${
              isSpeaking || agentAudioLevel > 5 ? 'bg-indigo-500/25 scale-110' : 'bg-indigo-500/10'
            }`}></div>

            {/* Wave Ripple Effects - Circular waves when audio detected */}
            {(isSpeaking || agentAudioLevel > 5) && (
              <>
                <div className="absolute w-80 h-80 rounded-full border-2 border-indigo-500/20 animate-ping" style={{animationDuration: '2s'}}></div>
                <div className="absolute w-96 h-96 rounded-full border border-indigo-500/15 animate-ping" style={{animationDuration: '2.5s', animationDelay: '0.5s'}}></div>
                <div className="absolute w-[450px] h-[450px] rounded-full border border-indigo-500/10 animate-ping" style={{animationDuration: '3s', animationDelay: '1s'}}></div>
              </>
            )}

            {/* Floating Particles when speaking */}
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full bg-indigo-400 animate-pulse pointer-events-none"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: `calc(50% + ${particle.x}px)`,
                  top: `calc(50% + ${particle.y}px)`,
                  opacity: particle.opacity,
                  animation: 'float 3s ease-in-out infinite',
                }}
              />
            ))}

            {/* Cute Chatbot - Blue round face with headphones */}
            {/* Floating + Breathing Animation Container */}
            <div className="relative z-10 animate-float">
              <div className="relative animate-breathe">

                {/* Left Antenna with Glow Pulse */}
                <div className="absolute -top-16 left-8 flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
                    connectionStatus === 'connected'
                      ? 'bg-indigo-300 shadow-lg shadow-indigo-400/80 animate-pulse'
                      : 'bg-indigo-500'
                  }`}></div>
                  <div className="w-2 h-12 bg-indigo-500 rounded-full"></div>
                </div>

                {/* Right Antenna with Glow Pulse */}
                <div className="absolute -top-16 right-8 flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
                    connectionStatus === 'connected'
                      ? 'bg-indigo-300 shadow-lg shadow-indigo-400/80 animate-pulse'
                      : 'bg-indigo-500'
                  }`} style={{animationDelay: '0.5s'}}></div>
                  <div className="w-2 h-12 bg-indigo-500 rounded-full"></div>
                </div>

                {/* Main Head - Blue round */}
                <div className={`w-72 h-72 bg-indigo-500 rounded-full relative shadow-2xl transition-all duration-300 ${
                  isSpeaking || agentAudioLevel > 5 ? 'shadow-indigo-500/60 shadow-2xl' : 'shadow-indigo-500/30'
                }`}>

                  {/* Left Headphone/Ear with Beat Animation */}
                  <div
                    className="absolute -left-8 top-1/2 -translate-y-1/2 transition-transform duration-100"
                    style={{
                      transform: `translateY(-50%) scale(${1 + (isSpeaking || agentAudioLevel > 5 ? audioLevel * 0.002 : 0)})`,
                    }}
                  >
                    <div className="w-16 h-24 bg-indigo-500 rounded-3xl flex items-center justify-center">
                      <div className="w-10 h-16 bg-indigo-600 rounded-2xl"></div>
                    </div>
                  </div>

                  {/* Right Headphone/Ear with Beat Animation */}
                  <div
                    className="absolute -right-8 top-1/2 -translate-y-1/2 transition-transform duration-100"
                    style={{
                      transform: `translateY(-50%) scale(${1 + (isSpeaking || agentAudioLevel > 5 ? audioLevel * 0.002 : 0)})`,
                    }}
                  >
                    <div className="w-16 h-24 bg-indigo-500 rounded-3xl flex items-center justify-center">
                      <div className="w-10 h-16 bg-indigo-600 rounded-2xl"></div>
                    </div>
                  </div>

                  {/* Face Area - White rounded rectangle */}
                  <div className="absolute inset-8 top-12 bottom-16 bg-white rounded-[40px] flex flex-col items-center justify-center">

                    {/* Eyes - Cute curved/closed happy eyes with blinking */}
                    <div className="flex gap-16 mb-4">
                      {/* Left Eye */}
                      <div className="relative">
                        <svg width="50" height="30" viewBox="0 0 50 30" className="overflow-visible">
                          {isBlinking ? (
                            /* Closed eye - horizontal line when blinking */
                            <path
                              d="M5 15 L45 15"
                              fill="none"
                              stroke="#4f46e5"
                              strokeWidth="6"
                              strokeLinecap="round"
                            />
                          ) : (
                            /* Open eye - curved smile shape */
                            <>
                              <path
                                d="M5 25 Q25 0 45 25"
                                fill="none"
                                stroke="#4f46e5"
                                strokeWidth="8"
                                strokeLinecap="round"
                                className={`transition-all duration-300 ${isSpeaking ? 'opacity-100' : 'opacity-90'}`}
                              />
                              {/* Small dot/pupil when eyes are more open */}
                              {isSpeaking && (
                                <circle cx="25" cy="15" r="4" fill="#4f46e5" />
                              )}
                            </>
                          )}
                        </svg>
                      </div>

                      {/* Right Eye */}
                      <div className="relative">
                        <svg width="50" height="30" viewBox="0 0 50 30" className="overflow-visible">
                          {isBlinking ? (
                            /* Closed eye - horizontal line when blinking */
                            <path
                              d="M5 15 L45 15"
                              fill="none"
                              stroke="#4f46e5"
                              strokeWidth="6"
                              strokeLinecap="round"
                            />
                          ) : (
                            /* Open eye - curved smile shape */
                            <>
                              <path
                                d="M5 25 Q25 0 45 25"
                                fill="none"
                                stroke="#4f46e5"
                                strokeWidth="8"
                                strokeLinecap="round"
                                className={`transition-all duration-300 ${isSpeaking ? 'opacity-100' : 'opacity-90'}`}
                              />
                              {isSpeaking && (
                                <circle cx="25" cy="15" r="4" fill="#4f46e5" />
                              )}
                            </>
                          )}
                        </svg>
                      </div>
                    </div>

                    {/* Mouth - Cute smile (animates when user OR agent speaks) */}
                    <div className="mt-2">
                      {isSpeaking || audioLevel > 5 || agentAudioLevel > 5 ? (
                        /* Animated mouth when speaking (user or agent) */
                        <div className="flex items-end justify-center gap-1 h-8">
                          {[0.5, 0.8, 1, 0.9, 0.6, 0.85, 0.7].map((scale, i) => (
                            <div
                              key={i}
                              className="w-2 bg-indigo-500 rounded-full transition-all duration-75"
                              style={{
                                height: `${Math.max(4, animatedBars[i % 8] * 0.35 * scale)}px`,
                              }}
                            ></div>
                          ))}
                        </div>
                      ) : (
                        /* Static smile when not speaking */
                        <svg width="60" height="30" viewBox="0 0 60 30">
                          <path
                            d="M10 8 Q30 30 50 8"
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="6"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Speech Bubble Chin/Pointer */}
                  <div className="absolute -bottom-4 left-6 w-8 h-8 bg-indigo-500 transform rotate-45"></div>
                </div>

              </div>

              {/* Status text under robot */}
              <div className="text-center mt-8">
                {/* Main Status */}
                <p className={`text-xl font-semibold transition-all ${
                  isSpeaking ? 'text-green-400' :
                  agentAudioLevel > 5 ? 'text-cyan-400' :
                  'text-indigo-400'
                }`}>
                  {connectionStatus === 'disconnected'
                    ? 'Ready to Connect'
                    : isSpeaking
                    ? 'Listening...'
                    : agentAudioLevel > 5
                    ? 'Speaking...'
                    : 'Standing By'}
                </p>

                {/* Elegant Quotation - Dark Theme Style */}
                <div className="mt-6 mx-auto max-w-xs">
                  <div className="bg-[#0d1e36] rounded-2xl p-4 border border-[#1a3a5c]">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-indigo-500/70 text-2xl font-serif">"</span>
                      <p className="text-indigo-400 italic text-sm tracking-wide">
                        Built to listen<span className="text-indigo-300 mx-0.5">.</span>Designed to help<span className="text-indigo-300">.</span>
                      </p>
                      <span className="text-indigo-500/70 text-2xl font-serif">"</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Volume Control - Bottom right */}
            {connectionStatus === 'connected' && (
              <div className="absolute bottom-8 right-8 flex items-center gap-3 bg-[#0d1e36] px-4 py-3 rounded-2xl">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-sm text-cyan-400 w-8">{volume}%</span>
              </div>
            )}

            {/* Connection Status Badge */}
            <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-[#0d1e36] rounded-full">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' :
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'
              }`}></div>
              <span className="text-sm text-gray-400">
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
              {connectionStatus === 'connected' && (
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Chat Panel (Slide from right) */}
        <div className={`fixed right-0 top-0 h-full w-96 bg-[#0d1e36] border-l border-[#1a3a5c] transform transition-transform duration-300 z-50 ${
          showChat ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#1a3a5c]">
            <h2 className="text-lg font-semibold text-cyan-400">Chat Mode</h2>
            <button
              onClick={() => setShowChat(false)}
              className="w-8 h-8 rounded-lg bg-[#1a3a5c] hover:bg-[#2a4a6c] flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="h-[calc(100%-8rem)] overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No messages yet</p>
                <p className="text-sm mt-2">Start a conversation!</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500/20 ml-8 border border-cyan-500/30'
                      : 'bg-[#1a3a5c] mr-8'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {msg.sender === 'user' ? 'You' : 'Agent'}
                  </div>
                  <p className="text-gray-200">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1a3a5c] bg-[#0d1e36]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={connectionStatus === 'connected' ? "Type a message..." : "Connect first..."}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                disabled={connectionStatus !== 'connected'}
                className="flex-1 px-4 py-3 bg-[#1a3a5c] border border-[#2a5a8c] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
              />
              <button
                onClick={handleSendChat}
                disabled={connectionStatus !== 'connected' || !chatInput.trim()}
                className="px-4 py-3 bg-green-500 hover:bg-green-600 rounded-xl disabled:opacity-50 disabled:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {showChat && (
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowChat(false)}
          />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/50 px-6 py-3 rounded-xl text-red-300 backdrop-blur-sm z-50">
          {error}
        </div>
      )}

      {/* Custom Animation Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }

        @keyframes particleFade {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.5) translateY(-20px); }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }

        .animate-particle {
          animation: particleFade 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
