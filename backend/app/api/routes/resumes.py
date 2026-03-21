from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from bson.errors import InvalidId
from app.api.dependencies import get_current_user
from app.models.user import UserInDB
from app.models.resume import Resume, ResumeCreate, ResumeUpdate, ResumeData
from app.core.db import get_client
from app.core.logging_config import get_logger
from datetime import datetime, timezone

logger = get_logger(__name__)

router = APIRouter(prefix="/resumes", tags=["resumes"])


def _validate_objectid(obj_id: str) -> ObjectId:
    """Validate and convert string to ObjectId, raise 400 if invalid"""
    try:
        return ObjectId(obj_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resume ID format"
        )


@router.get("/")
async def get_resumes(user: UserInDB = Depends(get_current_user)):
    """Get all resumes for the current user"""
    try:
        db = get_client().get_default_database()
        resumes = db["resumes"]
        
        user_resumes = await resumes.find(
            {"user_id": ObjectId(user.id), "deleted_at": None}
        ).sort("updated_at", -1).to_list(None)
        
        # Convert ObjectId to string for JSON serialization
        for resume in user_resumes:
            resume["_id"] = str(resume["_id"])
            resume["user_id"] = str(resume["user_id"])
        
        return user_resumes
    except Exception as e:
        logger.error(f"Error fetching resumes for user {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch resumes"
        )

@router.post("/")
async def create_resume(
    resume_data: ResumeCreate,
    user: UserInDB = Depends(get_current_user)
):
    """Create a new resume for the current user"""
    try:
        db = get_client().get_default_database()
        resumes = db["resumes"]
        
        # Create resume document
        resume_doc = {
            "user_id": ObjectId(user.id),
            "name": resume_data.name,
            "data": resume_data.data.model_dump() if resume_data.data else {},
            "version": 1,
            "is_active": True,
            "deleted_at": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        
        result = await resumes.insert_one(resume_doc)
        resume_doc["_id"] = str(result.inserted_id)
        resume_doc["user_id"] = str(resume_doc["user_id"])
        
        logger.info(f"Resume created: {result.inserted_id} for user {user.email}")
        return resume_doc
    except Exception as e:
        logger.error(f"Error creating resume for user {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create resume"
        )

@router.get("/{resume_id}")
async def get_resume(
    resume_id: str,
    user: UserInDB = Depends(get_current_user)
):
    """Get a specific resume by ID"""
    try:
        obj_id = _validate_objectid(resume_id)
        db = get_client().get_default_database()
        resumes = db["resumes"]
        
        resume_doc = await resumes.find_one({
            "_id": obj_id,
            "user_id": ObjectId(user.id),
            "deleted_at": None
        })
        
        if not resume_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        resume_doc["_id"] = str(resume_doc["_id"])
        resume_doc["user_id"] = str(resume_doc["user_id"])
        
        return resume_doc
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching resume {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch resume"
        )

@router.put("/{resume_id}")
async def update_resume(
    resume_id: str,
    resume_data: ResumeUpdate,
    user: UserInDB = Depends(get_current_user)
):
    """Update a resume"""
    try:
        obj_id = _validate_objectid(resume_id)
        db = get_client().get_default_database()
        resumes = db["resumes"]
        
        # Verify ownership
        existing = await resumes.find_one({
            "_id": obj_id,
            "user_id": ObjectId(user.id),
            "deleted_at": None
        })
        
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        update_data = {
            "updated_at": datetime.now(timezone.utc),
        }
        
        if resume_data.name:
            update_data["name"] = resume_data.name
        
        if resume_data.data:
            update_data["data"] = resume_data.data.model_dump()
        
        await resumes.update_one(
            {"_id": obj_id},
            {"$set": update_data}
        )
        
        updated = await resumes.find_one({"_id": obj_id})
        updated["_id"] = str(updated["_id"])
        updated["user_id"] = str(updated["user_id"])
        
        logger.info(f"Resume updated: {resume_id} for user {user.email}")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating resume {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update resume"
        )

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    user: UserInDB = Depends(get_current_user)
):
    """Soft delete a resume"""
    try:
        obj_id = _validate_objectid(resume_id)
        db = get_client().get_default_database()
        resumes = db["resumes"]
        
        # Verify ownership
        existing = await resumes.find_one({
            "_id": obj_id,
            "user_id": ObjectId(user.id),
            "deleted_at": None
        })
        
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        # Soft delete - set deleted_at timestamp
        result = await resumes.update_one(
            {"_id": obj_id},
            {"$set": {"deleted_at": datetime.now(timezone.utc)}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete resume"
            )
        
        logger.info(f"Resume deleted: {resume_id} for user {user.email}")
        return {"message": "Resume deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting resume {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete resume"
        )
