# app/models/__init__.py
"""
Pydantic models for Resumate application.

Collections:
- users: User accounts with auth info (UserRole, UserTier, UserPreferences)
- master_profiles: Reusable career data pool (PersonalInfo, profile_embedding)
- resumes: Individual resume documents (ResumeTemplate, layout_order)
- jobs: Job listings with AI embeddings (JobType, JobStatus)
- job_applications: Application tracking Kanban (ApplicationStatus)
- ai_logs: AI usage tracking (AIAction)
"""

from app.models.pyobjectid import PyObjectId

# User models
from app.models.user import (
    UserRole,
    UserTier,
    ThemePreference,
    UserPreferences,
    UserBase,
    UserCreate,
    UserUpdate,
    UserInDB,
)

# Resume and Master Profile models
from app.models.resume import (
    ResumeTemplate,
    ResumeSectionType,
    Experience,
    Education,
    Skill,
    Project,
    Award,
    Certification,
    VolunteeringLeadership,
    Publication,
    PersonalInfo,
    MasterProfile,
    ResumeContactInfo,
    ResumeData,
    Resume,
    ResumeCreate,
    ResumeUpdate,
    DEFAULT_LAYOUT_ORDER,
)

# Job and Application models
from app.models.job import (
    JobType,
    JobStatus,
    ApplicationStatus,
    AIAction,
    Job,
    JobCreate,
    JobUpdate,
    OfferDetails,
    JobApplication,
    JobApplicationCreate,
    JobApplicationUpdate,
    AILog,
    AILogCreate,
)

__all__ = [
    # PyObjectId
    "PyObjectId",
    # User
    "UserRole",
    "UserTier",
    "ThemePreference",
    "UserPreferences",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    # Resume
    "ResumeTemplate",
    "ResumeSectionType",
    "Experience",
    "Education",
    "Skill",
    "Project",
    "Award",
    "Certification",
    "VolunteeringLeadership",
    "Publication",
    "PersonalInfo",
    "MasterProfile",
    "ResumeContactInfo",
    "ResumeData",
    "Resume",
    "ResumeCreate",
    "ResumeUpdate",
    "DEFAULT_LAYOUT_ORDER",
    # Job
    "JobType",
    "JobStatus",
    "ApplicationStatus",
    "AIAction",
    "Job",
    "JobCreate",
    "JobUpdate",
    "OfferDetails",
    "JobApplication",
    "JobApplicationCreate",
    "JobApplicationUpdate",
    "AILog",
    "AILogCreate",
]
