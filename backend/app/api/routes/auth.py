import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel, EmailStr, Field
from google.oauth2 import id_token
from google.auth.transport import requests
from google.auth.exceptions import GoogleAuthError
from app.core.db import get_client
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.logging_config import get_logger
from app.core.rate_limiter import limiter
from app.models.user import UserInDB

logger = get_logger(__name__)

router = APIRouter(tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = Field(default=None, max_length=200)


class OAuthRequest(BaseModel):
    token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


def _normalize_email(email: EmailStr) -> str:
    return str(email).strip().lower()


def _build_auth_response(user_doc: dict) -> AuthResponse:
    user = UserInDB.model_validate(user_doc)
    token = create_access_token({"sub": user.email, "uid": str(user.id)})
    return AuthResponse(
        access_token=token, user=user.model_dump(exclude={"hashed_password"})
    )


@router.post("/register")
@limiter.limit("5/minute")
async def register(request: Request, payload: RegisterRequest):
    email = _normalize_email(payload.email)
    logger.info(f"Registration attempt for: {email}")

    db = get_client().get_default_database()
    users = db["users"]
    exists = await users.find_one({"email": email})
    if exists:
        logger.warning(f"Email already exists: {email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    password = payload.password.strip()
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="password: Password must be at least 8 characters",
        )
    if not any(c.isupper() for c in password):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="password: Password must contain at least one uppercase letter",
        )
    if not any(c.isdigit() for c in password):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="password: Password must contain at least one digit",
        )

    doc = {
        "email": email,
        "full_name": payload.full_name.strip() if payload.full_name else None,
        "is_active": True,
        "hashed_password": get_password_hash(password),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    try:
        result = await users.insert_one(doc)
        user_doc = await users.find_one({"_id": result.inserted_id})
        logger.info(f"Successfully registered: {email}")
        return _build_auth_response(user_doc)
    except Exception as e:
        logger.error(f"Error during registration for {email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, payload: LoginRequest):
    email = _normalize_email(payload.email)

    db = get_client().get_default_database()
    users = db["users"]
    user_doc = await users.find_one({"email": email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    user = UserInDB.model_validate(user_doc)
    if not user.hashed_password or not verify_password(
        payload.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    return _build_auth_response(user_doc)


@router.post("/google")
@limiter.limit("10/minute")
async def google_login(request: Request, payload: OAuthRequest):
    try:
        # Verify Google Token
        idinfo = id_token.verify_oauth2_token(
            payload.token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        email = str(idinfo["email"]).strip().lower()
        google_id = idinfo["sub"]
        full_name = idinfo.get("name")
        avatar_url = idinfo.get("picture")

        db = get_client().get_default_database()
        users = db["users"]

        # Find user by google_id first (prefer OAuth identity)
        user_doc = await users.find_one({"google_id": google_id})

        if not user_doc:
            # Check if email exists but not linked to Google
            existing_email = await users.find_one({"email": email, "google_id": None})
            if existing_email:
                # User has existing account but not linked to Google - require confirmation
                logger.warning(
                    f"Attempt to link Google account to existing email: {email}"
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already has an account. Please login with password first to link Google.",
                )

            # Create new user
            user_doc = {
                "email": email,
                "full_name": full_name,
                "google_id": google_id,
                "avatar_url": avatar_url,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
            result = await users.insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
            logger.info(f"New user created via Google: {email}")
        else:
            # Update avatar if changed
            if avatar_url and user_doc.get("avatar_url") != avatar_url:
                await users.update_one(
                    {"_id": user_doc["_id"]},
                    {
                        "$set": {
                            "avatar_url": avatar_url,
                            "updated_at": datetime.now(timezone.utc),
                        }
                    },
                )

        refreshed_user_doc = await users.find_one({"_id": user_doc["_id"]})
        return _build_auth_response(refreshed_user_doc)
    except HTTPException:
        raise
    except GoogleAuthError as e:
        logger.warning(f"Invalid Google token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token"
        )
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Google login failed"
        )


@router.post("/facebook")
@limiter.limit("10/minute")
async def facebook_login(request: Request, payload: OAuthRequest):
    try:
        # Verify Facebook Token
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://graph.facebook.com/me",
                params={
                    "fields": "id,name,email,picture",
                    "access_token": payload.token,
                },
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Facebook token",
                )

            fb_data = resp.json()
            fb_id = fb_data["id"]
            raw_email = fb_data.get("email")
            full_name = fb_data.get("name")
            avatar_url = fb_data.get("picture", {}).get("data", {}).get("url")

            # Email is required for user identification
            if not raw_email:
                logger.warning(f"Facebook login without email for fb_id: {fb_id}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is required from Facebook profile. Please grant email access permission.",
                )
            email = str(raw_email).strip().lower()

            db = get_client().get_default_database()
            users = db["users"]

            # Find user by facebook_id first (prefer OAuth identity)
            user_doc = await users.find_one({"facebook_id": fb_id})

            if not user_doc:
                # Check if email exists without Facebook link
                existing_email = await users.find_one(
                    {"email": email, "facebook_id": None}
                )
                if existing_email:
                    # User has existing account but not linked to Facebook
                    logger.warning(
                        f"Attempt to link Facebook account to existing email: {email}"
                    )
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email already has an account. Please login with password first to link Facebook.",
                    )

                # Create new user
                user_doc = {
                    "email": email,
                    "full_name": full_name,
                    "facebook_id": fb_id,
                    "avatar_url": avatar_url,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                }
                result = await users.insert_one(user_doc)
                user_doc["_id"] = result.inserted_id
                logger.info(f"New user created via Facebook: {email}")
            else:
                # Update avatar if changed
                if avatar_url and user_doc.get("avatar_url") != avatar_url:
                    await users.update_one(
                        {"_id": user_doc["_id"]},
                        {
                            "$set": {
                                "avatar_url": avatar_url,
                                "updated_at": datetime.now(timezone.utc),
                            }
                        },
                    )

            refreshed_user_doc = await users.find_one({"_id": user_doc["_id"]})
            return _build_auth_response(refreshed_user_doc)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Facebook login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Facebook login failed"
        )
