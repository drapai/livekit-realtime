"""
Pydantic models for FastAPI request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional


class TokenRequest(BaseModel):
    """Request model for generating access token"""
    room_name: str = Field(
        ...,
        description="Name of the LiveKit room to join",
        example="user-session-123"
    )
    participant_name: str = Field(
        ...,
        description="Identity/name of the participant",
        example="user-faryal"
    )
    metadata: Optional[str] = Field(
        None,
        description="Optional metadata to attach to participant",
        example='{"user_id": "12345", "role": "customer"}'
    )


class TokenResponse(BaseModel):
    """Response model for generated access token"""
    token: str = Field(
        ...,
        description="JWT access token for LiveKit",
        example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )
    url: str = Field(
        ...,
        description="LiveKit server URL",
        example="wss://your-domain.com"
    )
    room_name: str = Field(
        ...,
        description="Room name participant will join"
    )
    participant_name: str = Field(
        ...,
        description="Participant identity"
    )


class RoomCreateRequest(BaseModel):
    """Request model for creating a new room"""
    room_name: str = Field(
        ...,
        description="Name of the room to create",
        example="support-session-456"
    )
    empty_timeout: int = Field(
        300,
        description="Seconds before empty room is deleted",
        example=300
    )
    max_participants: int = Field(
        10,
        description="Maximum number of participants allowed",
        example=10
    )


class RoomCreateResponse(BaseModel):
    """Response model for room creation"""
    room_name: str = Field(
        ...,
        description="Name of the created room"
    )
    sid: str = Field(
        ...,
        description="Room SID (unique identifier)"
    )
    created_at: int = Field(
        ...,
        description="Unix timestamp of room creation"
    )


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str = Field(
        ...,
        description="Service status",
        example="healthy"
    )
    livekit_configured: bool = Field(
        ...,
        description="Whether LiveKit credentials are configured"
    )
    livekit_url: str = Field(
        ...,
        description="Configured LiveKit server URL"
    )
