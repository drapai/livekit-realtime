#!/usr/bin/env python3
"""
Generate a LiveKit token to join a room for testing
Usage: python3 generate_token.py [room_name] [participant_name]
"""

import sys
from livekit import api
from dotenv import load_dotenv
import os

load_dotenv(".env.local")

# Get credentials from environment
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "ws://localhost:7880")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "devkey")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "secret")

# Get room and participant name from command line or use defaults
room_name = sys.argv[1] if len(sys.argv) > 1 else "test-room"
participant_name = sys.argv[2] if len(sys.argv) > 2 else "user"

# Generate token
token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
token.with_identity(participant_name)
token.with_name(participant_name)
token.with_grants(
    api.VideoGrants(
        room_join=True,
        room=room_name,
        can_publish=True,
        can_subscribe=True,
    )
)

jwt_token = token.to_jwt()

print("=" * 70)
print("LiveKit Connection Details")
print("=" * 70)
print(f"LiveKit URL:     {LIVEKIT_URL}")
print(f"Room Name:       {room_name}")
print(f"Participant:     {participant_name}")
print(f"\nToken:")
print(jwt_token)
print("=" * 70)
print(f"\nOpen LiveKit Meet: https://meet.livekit.io/custom")
print(f"Paste the URL and token above to join the room")
print("=" * 70)
