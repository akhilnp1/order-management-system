import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas import LoginRequest, TokenResponse
from app.auth import create_access_token
from app.config import settings

logger = logging.getLogger("app.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """
    Mock authentication endpoint. Validates against a single configured
    username/password pair and issues a JWT on success.
    """
    if payload.username != settings.mock_username or payload.password != settings.mock_password:
        logger.info("Failed login attempt for username=%s", payload.username)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token, expires_in = create_access_token(subject=payload.username)
    logger.info("User '%s' logged in successfully", payload.username)
    return TokenResponse(access_token=token, expires_in=expires_in)
