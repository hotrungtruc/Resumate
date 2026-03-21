"""
Job, Job Application, and AI Log Models

Based on the database diagram:
- JOBS: Job listings with AI embeddings for matching
- JOB_APPLICATIONS: Application tracking (Kanban board)
- AI_LOGS: AI usage tracking for billing and analytics
"""

from __future__ import annotations
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, AliasChoices, ConfigDict, model_validator
from app.models.pyobjectid import PyObjectId


# ============================================================================
# Job Enums
# ============================================================================


class JobType(str, Enum):
    """Type of employment"""

    FULL_TIME = "full-time"
    PART_TIME = "part-time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    REMOTE = "remote"


class JobStatus(str, Enum):
    """Job listing status"""

    ACTIVE = "active"
    CLOSED = "closed"
    EXPIRED = "expired"


class ApplicationStatus(str, Enum):
    """Job application status for Kanban board"""

    WISHLIST = "wishlist"
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    REJECTED = "rejected"
    ACCEPTED = "accepted"
    WITHDRAWN = "withdrawn"


class AIAction(str, Enum):
    """Type of AI action performed"""

    GENERATE_SUMMARY = "generate_summary"
    OPTIMIZE_RESUME = "optimize_resume"
    MATCH_JOB = "match_job"
    EXTRACT_REQUIREMENTS = "extract_requirements"
    GENERATE_COVER_LETTER = "generate_cover_letter"
    ANALYZE_JOB = "analyze_job"
    SUGGEST_SKILLS = "suggest_skills"
    OTHER = "other"


# ============================================================================
# Job Models
# ============================================================================


class Job(BaseModel):
    """Job listing document"""

    id: Optional[PyObjectId] = Field(
        default=None,
        validation_alias=AliasChoices("_id", "id"),
        serialization_alias="id",
    )
    title: str = Field(max_length=300)
    company_name: str = Field(max_length=200)
    company_logo_url: Optional[str] = None
    location: Optional[str] = None
    job_type: JobType = JobType.FULL_TIME
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    currency: Optional[str] = None
    description: Optional[str] = None
    # AI-extracted requirements from job description
    requirements_extracted: List[str] = Field(default_factory=list)
    # AI-generated embedding for matching
    job_embedding: List[float] = Field(
        default_factory=list, description="AI-generated embedding vector for matching"
    )
    source_url: Optional[str] = None
    status: JobStatus = JobStatus.ACTIVE
    posted_date: Optional[datetime] = None
    expires_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_salary(self) -> Job:
        """Validate salary range"""
        if (
            self.salary_min is not None
            and self.salary_max is not None
            and self.salary_min > self.salary_max
        ):
            raise ValueError("salary_min must be less than or equal to salary_max")
        return self


class JobCreate(BaseModel):
    """Create job request body"""

    title: str = Field(max_length=300)
    company_name: str = Field(max_length=200)
    company_logo_url: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[JobType] = JobType.FULL_TIME
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    currency: Optional[str] = None
    description: Optional[str] = None
    source_url: Optional[str] = None
    posted_date: Optional[datetime] = None
    expires_date: Optional[datetime] = None


class JobUpdate(BaseModel):
    """Update job request body"""

    title: Optional[str] = Field(None, max_length=300)
    company_name: Optional[str] = Field(None, max_length=200)
    company_logo_url: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[JobType] = None
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    currency: Optional[str] = None
    description: Optional[str] = None
    source_url: Optional[str] = None
    status: Optional[JobStatus] = None
    posted_date: Optional[datetime] = None
    expires_date: Optional[datetime] = None


# ============================================================================
# Job Application Models
# ============================================================================


class OfferDetails(BaseModel):
    """Details of a job offer"""

    salary: Optional[int] = None
    currency: Optional[str] = None
    start_date: Optional[datetime] = None
    benefits: Optional[str] = None


class JobApplication(BaseModel):
    """Job application tracking document"""

    id: Optional[PyObjectId] = Field(
        default=None,
        validation_alias=AliasChoices("_id", "id"),
        serialization_alias="id",
    )
    user_id: PyObjectId = Field(validation_alias=AliasChoices("user_id", "userId"))
    job_id: PyObjectId = Field(validation_alias=AliasChoices("job_id", "jobId"))
    resume_id: Optional[PyObjectId] = Field(
        default=None, validation_alias=AliasChoices("resume_id", "resumeId")
    )
    # Kanban status
    status: ApplicationStatus = ApplicationStatus.WISHLIST
    # AI-calculated match score (0-100)
    match_score: Optional[int] = Field(None, ge=0, le=100)
    applied_date: Optional[datetime] = None
    notes: Optional[str] = None
    interview_dates: List[datetime] = Field(default_factory=list)
    offer_details: Optional[OfferDetails] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    model_config = ConfigDict(from_attributes=True)


class JobApplicationCreate(BaseModel):
    """Create job application request body"""

    job_id: PyObjectId = Field(validation_alias=AliasChoices("job_id", "jobId"))
    resume_id: Optional[PyObjectId] = Field(
        default=None, validation_alias=AliasChoices("resume_id", "resumeId")
    )
    status: Optional[ApplicationStatus] = ApplicationStatus.WISHLIST
    notes: Optional[str] = None


class JobApplicationUpdate(BaseModel):
    """Update job application request body"""

    resume_id: Optional[PyObjectId] = Field(
        default=None, validation_alias=AliasChoices("resume_id", "resumeId")
    )
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None
    applied_date: Optional[datetime] = None
    interview_dates: Optional[List[datetime]] = None
    offer_details: Optional[OfferDetails] = None


# ============================================================================
# AI Logs Models
# ============================================================================


class AILog(BaseModel):
    """AI usage log document for tracking and billing"""

    id: Optional[PyObjectId] = Field(
        default=None,
        validation_alias=AliasChoices("_id", "id"),
        serialization_alias="id",
    )
    user_id: PyObjectId = Field(validation_alias=AliasChoices("user_id", "userId"))
    action: AIAction = AIAction.OTHER
    model: Optional[str] = None  # AI model used (e.g., "gpt-4", "claude-3")
    prompt_tokens: int = Field(0, ge=0)
    completion_tokens: int = Field(0, ge=0)
    total_tokens: int = Field(0, ge=0)
    cost_usd: Optional[float] = Field(None, ge=0, description="Estimated cost in USD")
    input_preview: Optional[str] = Field(None, max_length=500)
    output_preview: Optional[str] = Field(None, max_length=500)
    duration_ms: Optional[int] = Field(
        None, ge=0, description="Request duration in milliseconds"
    )
    success: bool = True
    error_message: Optional[str] = None
    metadata: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    model_config = ConfigDict(from_attributes=True)


class AILogCreate(BaseModel):
    """Create AI log entry (internal use)"""

    action: AIAction
    model: Optional[str] = None
    prompt_tokens: int = Field(0, ge=0)
    completion_tokens: int = Field(0, ge=0)
    input_preview: Optional[str] = Field(None, max_length=500)
    output_preview: Optional[str] = Field(None, max_length=500)
    duration_ms: Optional[int] = None
    success: bool = True
    error_message: Optional[str] = None
    metadata: Optional[dict] = None
