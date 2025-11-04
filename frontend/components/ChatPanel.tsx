'use client';

export default function ChatPanel() {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-5 text-slate-100 flex items-center gap-2">
        <span>💬</span>
        <span>Chat History</span>
      </h2>

      {/* Chat Container */}
      <div className="h-[400px] overflow-y-auto p-4 bg-slate-900 rounded-lg mb-4 custom-scrollbar">
        <div className="p-3 rounded-lg bg-slate-700/20 flex gap-2.5">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-xl">ℹ️</span>
            <span>Chat feature coming soon. Currently voice-only mode.</span>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="flex gap-2.5">
        <input
          type="text"
          placeholder="Type a message (coming soon)..."
          disabled
          className="flex-1 px-3 py-3 border-2 border-slate-700 rounded-lg bg-slate-900 text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          disabled
          className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl">📤</span>
          <span>Send</span>
        </button>
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
