'use client';

import { useEffect, useRef } from 'react';
import { TranscriptMessage } from '@/lib/config';

interface TranscriptPanelProps {
  transcripts: TranscriptMessage[];
}

export default function TranscriptPanel({ transcripts }: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts]);

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-5 text-slate-100 flex items-center gap-2">
        <span>📝</span>
        <span>Live Transcript</span>
      </h2>

      <div
        ref={containerRef}
        className="max-h-[300px] overflow-y-auto p-4 bg-slate-900 rounded-lg custom-scrollbar"
      >
        {transcripts.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            No transcripts yet. Start speaking to see transcriptions here.
          </div>
        ) : (
          transcripts.map((transcript, index) => (
            <div
              key={index}
              className="p-3 mb-2.5 rounded-lg border-l-4 border-indigo-500 bg-indigo-500/10"
            >
              <div className="font-semibold text-indigo-400 mb-1">
                {transcript.speaker}
              </div>
              <div className="text-slate-100">{transcript.text}</div>
              <div className="text-sm text-slate-400 mt-1">
                {transcript.timestamp}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
