"""
FastAPI backend for LiveKit agent - JWT token generation and room management
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from common.cors import configure_cors

from .models import TokenRequest, TokenResponse, RoomCreateRequest, RoomCreateResponse
from .auth import generate_access_token, create_room

# Import session routes
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../agent'))
from app.routes.sessions import router as sessions_router
from app.core.db import get_db, engine
from app.core.models import ConversationSession
from sqlalchemy.orm import Session

# Load environment variables
load_dotenv(os.getenv("ENV_FILE", ".env.local"))

app = FastAPI(
    title="LiveKit Agent API",
    description="API for generating JWT tokens and managing LiveKit rooms",
    version="1.0.0"
)

# Configure CORS with centralized configuration
configure_cors(app)

# Include session routes for admin panel
app.include_router(sessions_router)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "LiveKit Agent API",
        "version": "1.0.0"
    }

@app.post("/api/generate-token", response_model=TokenResponse)
async def generate_token(request: TokenRequest):
    """
    Generate JWT token for a participant to join a LiveKit room
    Each user gets a unique room with format: room-{user_id}

    Args:
        request: TokenRequest containing room_name and participant_name

    Returns:
        TokenResponse with JWT token and LiveKit server URL
    """
    try:
        # Generate unique room name per user based on participant name
        # This ensures each user gets their own room with dedicated agent
        unique_room_name = f"room-{request.participant_name}"

        token = generate_access_token(
            room_name=unique_room_name,
            participant_name=request.participant_name,
            metadata=request.metadata
        )

        livekit_url = os.getenv("LIVEKIT_URL", "ws://localhost:7880")

        return TokenResponse(
            token=token,
            url=livekit_url,
            room_name=unique_room_name,
            participant_name=request.participant_name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token generation failed: {str(e)}")

@app.post("/api/create-room", response_model=RoomCreateResponse)
async def create_room_endpoint(request: RoomCreateRequest):
    """
    Create a new LiveKit room

    Args:
        request: RoomCreateRequest containing room_name and optional config

    Returns:
        RoomCreateResponse with room details
    """
    try:
        room_info = await create_room(
            room_name=request.room_name,
            empty_timeout=request.empty_timeout,
            max_participants=request.max_participants
        )

        return RoomCreateResponse(
            room_name=room_info["name"],
            sid=room_info["sid"],
            created_at=room_info.get("creation_time", 0)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Room creation failed: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    livekit_url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")

    return {
        "status": "healthy",
        "livekit_configured": bool(livekit_url and api_key),
        "livekit_url": livekit_url or "not configured"
    }

@app.get("/api/debug/rooms")
async def debug_rooms():
    """Debug endpoint to list all active LiveKit rooms and participants"""
    try:
        from livekit import api as lk_api

        api_key = os.getenv("LIVEKIT_API_KEY")
        api_secret = os.getenv("LIVEKIT_API_SECRET")
        livekit_url = os.getenv("LIVEKIT_URL", "ws://localhost:7880")

        if not api_key or not api_secret:
            return {"error": "LiveKit credentials not configured"}

        # Convert WebSocket URL to HTTP
        http_url = livekit_url.replace("ws://", "http://").replace("wss://", "https://")

        lk_client = lk_api.LiveKitAPI(
            url=http_url,
            api_key=api_key,
            api_secret=api_secret
        )

        try:
            # List all rooms
            rooms_response = await lk_client.room.list_rooms(lk_api.ListRoomsRequest())

            rooms_info = []
            for room in rooms_response.rooms:
                # Get participants for each room
                participants_response = await lk_client.room.list_participants(
                    lk_api.ListParticipantsRequest(room=room.name)
                )

                participants_info = [
                    {
                        "identity": p.identity,
                        "name": p.name,
                        "kind": str(p.kind) if hasattr(p, 'kind') else "unknown",
                        "num_tracks": len(p.tracks) if hasattr(p, 'tracks') else 0,
                    }
                    for p in participants_response.participants
                ]

                rooms_info.append({
                    "name": room.name,
                    "sid": room.sid,
                    "num_participants": room.num_participants,
                    "creation_time": room.creation_time,
                    "participants": participants_info,
                })

            return {
                "success": True,
                "livekit_url": http_url,
                "rooms_count": len(rooms_info),
                "rooms": rooms_info,
            }
        finally:
            await lk_client.aclose()

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "type": type(e).__name__,
        }

@app.get("/admin", response_class=HTMLResponse)
async def admin_panel():
    """Admin panel to view all sessions and transcripts with component status"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agent Admin Panel</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            h1 { color: #333; margin-bottom: 10px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .status-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .status-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
            .status-value { font-size: 24px; font-weight: bold; }
            .status-active { color: #4CAF50; }
            .status-inactive { color: #999; }
            .session { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .session-id { color: #666; font-size: 12px; }
            .transcript { background: #f9f9f9; padding: 15px; border-left: 3px solid #4CAF50; margin-top: 10px; white-space: pre-wrap; max-height: 400px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 13px; }
            .data { background: #e3f2fd; padding: 10px; margin-top: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; }
            button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
            button:hover { background: #45a049; }
            .auto-refresh { background: #2196F3; }
            .auto-refresh:hover { background: #0b7dda; }
            .auto-refresh.active { background: #ff9800; }
            .message-line { margin: 5px 0; padding: 5px; border-radius: 3px; }
            .user-message { background: #e3f2fd; color: #1565c0; }
            .agent-message { background: #f1f8e9; color: #558b2f; }
            .system-message { color: #666; font-style: italic; }
            .component-status { display: flex; gap: 5px; align-items: center; }
            .status-indicator { width: 12px; height: 12px; border-radius: 50%; }
            .status-green { background: #4CAF50; }
            .status-red { background: #f44336; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎤 Voice Agent Admin Panel</h1>
            <div>
                <button onclick="loadSessions()">🔄 Refresh Now</button>
                <button id="autoRefreshBtn" class="auto-refresh" onclick="toggleAutoRefresh()">⏸️ Auto-Refresh: ON</button>
            </div>
        </div>

        <!-- Component Status Cards -->
        <div class="status-grid">
            <div class="status-card">
                <h3>🎤 STT (Speech-to-Text)</h3>
                <div class="component-status">
                    <div class="status-indicator status-green" id="stt-indicator"></div>
                    <div class="status-value status-active" id="stt-status">Faster Whisper</div>
                </div>
                <small id="stt-details">GPU Accelerated</small>
            </div>
            <div class="status-card">
                <h3>🤖 LLM (Language Model)</h3>
                <div class="component-status">
                    <div class="status-indicator status-green" id="llm-indicator"></div>
                    <div class="status-value status-active" id="llm-status">Ollama</div>
                </div>
                <small id="llm-details">Model: gemma3:1b</small>
            </div>
            <div class="status-card">
                <h3>🔊 TTS (Text-to-Speech)</h3>
                <div class="component-status">
                    <div class="status-indicator status-green" id="tts-indicator"></div>
                    <div class="status-value status-active" id="tts-status">Edge TTS</div>
                </div>
                <small id="tts-details">Voice: en-US-GuyNeural</small>
            </div>
            <div class="status-card">
                <h3>📊 Active Sessions</h3>
                <div class="status-value status-active" id="session-count">0</div>
                <small>Total conversations</small>
            </div>
        </div>

        <h2>Recent Sessions</h2>
        <div id="sessions"></div>

        <script>
            let autoRefreshInterval = null;
            let isAutoRefresh = true;

            function parseTranscript(transcript) {
                if (!transcript) return '<span class="system-message">No transcript yet</span>';

                const lines = transcript.trim().split('\\n');
                return lines.map(line => {
                    if (line.startsWith('USER:') || line.startsWith('CHAT_USER:')) {
                        return `<div class="message-line user-message">👤 ${line}</div>`;
                    } else if (line.startsWith('AGENT:') || line.startsWith('CHAT_AGENT:')) {
                        return `<div class="message-line agent-message">🤖 ${line}</div>`;
                    } else if (line.trim()) {
                        return `<div class="message-line system-message">${line}</div>`;
                    }
                    return '';
                }).join('');
            }

            async function loadSessions() {
                try {
                    const response = await fetch('/admin/sessions');
                    const sessions = await response.json();

                    // Update session count
                    document.getElementById('session-count').textContent = sessions.length;

                    const container = document.getElementById('sessions');
                    container.innerHTML = '';

                    if (sessions.length === 0) {
                        container.innerHTML = '<div class="session">No sessions found. Start a conversation to see it here!</div>';
                        return;
                    }

                    sessions.forEach(session => {
                        const div = document.createElement('div');
                        div.className = 'session';

                        const transcriptHtml = parseTranscript(session.transcript);
                        const hasTranscript = session.transcript && session.transcript.trim().length > 0;

                        div.innerHTML = `
                            <h3>Session: ${session.tenant_id} <span class="session-id">(${session.session_id})</span></h3>
                            <p>
                                <strong>State:</strong> ${session.state} |
                                <strong>Created:</strong> ${new Date(session.created_at).toLocaleString()} |
                                <strong>Messages:</strong> ${session.transcript ? session.transcript.split('\\n').filter(l => l.trim()).length : 0}
                            </p>
                            <div class="data">
                                <strong>Collected Data:</strong><br>
                                <pre>${JSON.stringify(session.collected_data, null, 2)}</pre>
                            </div>
                            <div class="transcript">
                                <strong>Transcript:</strong><br>
                                ${transcriptHtml}
                            </div>
                        `;
                        container.appendChild(div);
                    });

                    // Update component status based on recent activity
                    if (sessions.length > 0 && sessions[0].transcript) {
                        const recentTranscript = sessions[0].transcript;
                        if (recentTranscript.includes('USER:')) {
                            document.getElementById('stt-details').textContent = '✅ Last detected: ' + new Date(sessions[0].updated_at || sessions[0].created_at).toLocaleTimeString();
                        }
                        if (recentTranscript.includes('AGENT:')) {
                            document.getElementById('tts-details').textContent = '✅ Last spoke: ' + new Date(sessions[0].updated_at || sessions[0].created_at).toLocaleTimeString();
                        }
                    }

                } catch (error) {
                    console.error('Failed to load sessions:', error);
                    document.getElementById('sessions').innerHTML = '<div class="session" style="background: #ffebee; color: #c62828;">Error loading sessions: ' + error.message + '</div>';
                }
            }

            function toggleAutoRefresh() {
                isAutoRefresh = !isAutoRefresh;
                const btn = document.getElementById('autoRefreshBtn');

                if (isAutoRefresh) {
                    btn.textContent = '⏸️ Auto-Refresh: ON';
                    btn.classList.add('active');
                    autoRefreshInterval = setInterval(loadSessions, 3000); // Refresh every 3 seconds
                } else {
                    btn.textContent = '▶️ Auto-Refresh: OFF';
                    btn.classList.remove('active');
                    if (autoRefreshInterval) {
                        clearInterval(autoRefreshInterval);
                        autoRefreshInterval = null;
                    }
                }
            }

            // Load on page load
            loadSessions();

            // Start auto-refresh
            autoRefreshInterval = setInterval(loadSessions, 3000);
        </script>
    </body>
    </html>
    """

@app.get("/admin/sessions")
async def get_all_sessions(db: Session = Depends(get_db)):
    """Get all sessions for admin panel"""
    sessions = db.query(ConversationSession).order_by(ConversationSession.created_at.desc()).limit(50).all()

    return [{
        "session_id": str(session.id),
        "tenant_id": session.tenant_id,
        "state": session.state,
        "collected_data": session.collected_data or {},
        "transcript": session.transcript or "",
        "created_at": session.created_at.isoformat() if session.created_at else None,
        "updated_at": session.updated_at.isoformat() if session.updated_at else None
    } for session in sessions]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
