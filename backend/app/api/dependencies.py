from __future__ import annotations
from typing import Any, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from bson import ObjectId
from app.core.config import settings
from app.core.db import get_client
from app.models.user import UserInDB


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload: dict[str, Any] = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id: Optional[str] = payload.get("uid")
        if user_id is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    client = get_client()
    db = client.get_default_database()
    user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise credentials_exception
    return UserInDB.model_validate(user_doc)
