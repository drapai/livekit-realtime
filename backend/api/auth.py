"""
Authentication and authorization logic for LiveKit
Handles JWT token generation and room management
"""
from livekit import api
import os
from typing import Optional

def generate_access_token(
    room_name: str,
    participant_name: str,
    metadata: Optional[str] = None
) -> str:
    """
    Generate a JWT access token for a participant to join a LiveKit room

    Args:
        room_name: Name of the room to join
        participant_name: Identity of the participant
        metadata: Optional metadata to attach to the participant

    Returns:
        JWT token as a string
    """
    # Get credentials from environment
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")

    if not api_key or not api_secret:
        raise ValueError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set")

    # Create access token
    token = api.AccessToken(api_key, api_secret)

    # Set participant identity and name
    token.with_identity(participant_name)
    token.with_name(participant_name)

    # Add metadata if provided
    if metadata:
        token.with_metadata(metadata)

    # Grant permissions
    token.with_grants(
        api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True,
            can_publish_data=True,
        )
    )

    # Generate and return JWT
    return token.to_jwt()


async def create_room(
    room_name: str,
    empty_timeout: int = 300,
    max_participants: int = 10
) -> dict:
    """
    Create a new LiveKit room

    Args:
        room_name: Name of the room to create
        empty_timeout: Seconds before empty room is deleted (default 5 minutes)
        max_participants: Maximum number of participants allowed

    Returns:
        Dictionary with room information
    """
    # Get credentials from environment
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    livekit_url = os.getenv("LIVEKIT_URL", "ws://localhost:7880")

    if not api_key or not api_secret:
        raise ValueError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set")

    # Create LiveKit API client
    lk_api = api.LiveKitAPI(
        url=livekit_url.replace("ws://", "http://").replace("wss://", "https://"),
        api_key=api_key,
        api_secret=api_secret
    )

    try:
        # Create room with configuration
        room = await lk_api.room.create_room(
            api.CreateRoomRequest(
                name=room_name,
                empty_timeout=empty_timeout,
                max_participants=max_participants,
            )
        )

        return {
            "name": room.name,
            "sid": room.sid,
            "creation_time": room.creation_time,
            "num_participants": room.num_participants,
            "max_participants": room.max_participants,
        }
    finally:
        await lk_api.aclose()


async def list_rooms() -> list:
    """
    List all active rooms

    Returns:
        List of room dictionaries
    """
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    livekit_url = os.getenv("LIVEKIT_URL", "ws://localhost:7880")

    if not api_key or not api_secret:
        raise ValueError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set")

    lk_api = api.LiveKitAPI(
        url=livekit_url.replace("ws://", "http://").replace("wss://", "https://"),
        api_key=api_key,
        api_secret=api_secret
    )

    try:
        rooms = await lk_api.room.list_rooms(api.ListRoomsRequest())
        return [
            {
                "name": room.name,
                "sid": room.sid,
                "num_participants": room.num_participants,
            }
            for room in rooms.rooms
        ]
    finally:
        await lk_api.aclose()
