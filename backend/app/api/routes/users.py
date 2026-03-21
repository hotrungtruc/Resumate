from fastapi import APIRouter, Depends, HTTPException, status
from app.api.dependencies import get_current_user
from app.models.user import UserInDB, UserUpdate
from app.core.db import get_client
from bson import ObjectId

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me")
async def get_current_user_me(user: UserInDB = Depends(get_current_user)):
    return user.model_dump(exclude={"hashed_password"})

@router.patch("/me")
async def update_user_me(
    payload: UserUpdate,
    user: UserInDB = Depends(get_current_user)
):
    client = get_client()
    db = client.get_default_database()
    
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return user.model_dump(exclude={"hashed_password"})
        
    await db["users"].update_one(
        {"_id": ObjectId(user.id)},
        {"$set": update_data}
    )
    
    # Return updated user
    updated_user_doc = await db["users"].find_one({"_id": ObjectId(user.id)})
    return UserInDB.model_validate(updated_user_doc).model_dump(exclude={"hashed_password"})
