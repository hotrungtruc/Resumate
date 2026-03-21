from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.api.dependencies import get_current_user
from app.models.user import UserInDB
from app.models.resume import MasterProfile
from app.core.db import get_client
from app.core.logging_config import get_logger
from datetime import datetime, timezone

logger = get_logger(__name__)

router = APIRouter(prefix="/master-profile", tags=["master-profile"])


@router.get("/")
async def get_master_profile(user: UserInDB = Depends(get_current_user)):
    """Get master profile for the current user"""
    try:
        db = get_client().get_default_database()
        profiles = db["master_profiles"]
        
        profile = await profiles.find_one({"user_id": ObjectId(user.id)})
        
        if not profile:
            # Create empty master profile if doesn't exist
            profile_doc = {
                "user_id": ObjectId(user.id),
                "experiences": [],
                "educations": [],
                "skills": [],
                "projects": [],
                "awards": [],
                "certifications": [],
                "volunteering_leadership": [],
                "publications": [],
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
            result = await profiles.insert_one(profile_doc)
            profile_doc["_id"] = str(result.inserted_id)
            profile_doc["user_id"] = str(profile_doc["user_id"])
            logger.info(f"Master profile created for user {user.email}")
            return profile_doc
        
        profile["_id"] = str(profile["_id"])
        profile["user_id"] = str(profile["user_id"])
        return profile
    except Exception as e:
        logger.error(f"Error fetching master profile for user {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch master profile"
        )


@router.put("/")
async def update_master_profile(
    profile_data: MasterProfile,
    user: UserInDB = Depends(get_current_user)
):
    """Update master profile for the current user"""
    try:
        db = get_client().get_default_database()
        profiles = db["master_profiles"]
        
        update_data = {
            "experiences": [exp.model_dump() for exp in profile_data.experiences],
            "educations": [edu.model_dump() for edu in profile_data.educations],
            "skills": [skill.model_dump() for skill in profile_data.skills],
            "projects": [proj.model_dump() for proj in profile_data.projects],
            "awards": [award.model_dump() for award in profile_data.awards],
            "certifications": [cert.model_dump() for cert in profile_data.certifications],
            "volunteering_leadership": [vol.model_dump() for vol in profile_data.volunteering_leadership],
            "publications": [pub.model_dump() for pub in profile_data.publications],
            "updated_at": datetime.now(timezone.utc),
        }
        
        await profiles.update_one(
            {"user_id": ObjectId(user.id)},
            {"$set": update_data},
            upsert=True
        )
        
        updated = await profiles.find_one({"user_id": ObjectId(user.id)})
        updated["_id"] = str(updated["_id"])
        updated["user_id"] = str(updated["user_id"])
        
        logger.info(f"Master profile updated for user {user.email}")
        return updated
    except Exception as e:
        logger.error(f"Error updating master profile for user {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update master profile"
        )
