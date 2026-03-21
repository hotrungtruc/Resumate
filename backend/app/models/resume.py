from __future__ import annotations
from datetime import date, datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import (
    BaseModel,
    Field,
    AliasChoices,
    ConfigDict,
    AnyUrl,
    field_validator,
    model_validator,
)
from app.models.pyobjectid import PyObjectId


# ============================================================================
# Enums
# ============================================================================


class ResumeTemplate(str, Enum):
    """Available resume templates"""

    CLASSIC = "classic"
    MODERN = "modern"
    MINIMAL = "minimal"
    CREATIVE = "creative"
    PROFESSIONAL = "professional"
    ACADEMIC = "academic"


class ResumeSectionType(str, Enum):
    """Resume section types for layout ordering"""

    CONTACT = "contact"
    SUMMARY = "summary"
    EXPERIENCE = "experience"
    EDUCATION = "education"
    SKILLS = "skills"
    PROJECTS = "projects"
    CERTIFICATIONS = "certifications"
    AWARDS = "awards"
    PUBLICATIONS = "publications"
    VOLUNTEERING = "volunteering"


# ============================================================================
# Shared Components
# ============================================================================


class Experience(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list, max_length=50)

    @model_validator(mode="after")
    def validate_dates(self) -> Experience:
        if self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be greater than or equal to start_date")
        return self


class Education(BaseModel):
    school: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    gpa: Optional[float] = Field(None, ge=0, le=4.0)

    @model_validator(mode="after")
    def validate_dates(self) -> Education:
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be greater than or equal to start_date")
        return self


class Skill(BaseModel):
    name: str
    level: Optional[str] = None
    keywords: List[str] = Field(default_factory=list, max_length=20)


class Project(BaseModel):
    name: str
    description: Optional[str] = None
    role: Optional[str] = None
    technologies: List[str] = Field(default_factory=list, max_length=50)
    url: Optional[AnyUrl] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @model_validator(mode="after")
    def validate_dates(self) -> Project:
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be greater than or equal to start_date")
        return self


class Award(BaseModel):
    title: str
    issuer: Optional[str] = None
    date: Optional[date] = None


class Certification(BaseModel):
    name: str
    issuer: Optional[str] = None
    date: Optional[date] = None


class VolunteeringLeadership(BaseModel):
    role: str
    organization: Optional[str] = None
    description: Optional[str] = None


class Publication(BaseModel):
    title: str
    publication: Optional[str] = None
    date: Optional[date] = None


# ============================================================================
# Personal Info (for Master Profile)
# ============================================================================


class PersonalInfo(BaseModel):
    """Personal information stored in Master Profile"""

    full_name: Optional[str] = Field(None, max_length=200)
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = Field(None, max_length=2000)


# ============================================================================
# Master Profile
# ============================================================================


class MasterProfile(BaseModel):
    id: Optional[PyObjectId] = Field(
        default=None,
        validation_alias=AliasChoices("_id", "id"),
        serialization_alias="id",
    )
    user_id: PyObjectId = Field(validation_alias=AliasChoices("user_id", "userId"))
    # New: Personal Info
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    experiences: List[Experience] = Field(default_factory=list, max_length=100)
    educations: List[Education] = Field(default_factory=list, max_length=100)
    skills: List[Skill] = Field(default_factory=list, max_length=100)
    projects: List[Project] = Field(default_factory=list, max_length=100)
    awards: List[Award] = Field(default_factory=list, max_length=100)
    certifications: List[Certification] = Field(default_factory=list, max_length=100)
    volunteering_leadership: List[VolunteeringLeadership] = Field(
        default_factory=list, max_length=100
    )
    publications: List[Publication] = Field(default_factory=list, max_length=100)
    # New: AI Embedding for job matching
    profile_embedding: List[float] = Field(
        default_factory=list, description="AI-generated embedding vector"
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    model_config = ConfigDict(from_attributes=True)


class ResumeContactInfo(BaseModel):
    full_name: Optional[str] = Field(None, max_length=200)
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linked_in: Optional[str] = None


class ResumeData(BaseModel):
    contact_info: ResumeContactInfo = Field(default_factory=ResumeContactInfo)
    target_title: Optional[str] = Field(None, max_length=200)
    professional_summary: Optional[str] = Field(None, max_length=2000)
    work_experience: List[Experience] = Field(default_factory=list, max_length=100)
    education: List[Education] = Field(default_factory=list, max_length=100)
    skills: List[str] = Field(default_factory=list, max_length=100)
    certifications: List[Certification] = Field(default_factory=list, max_length=100)
    awards: List[Award] = Field(default_factory=list, max_length=100)
    projects: List[Project] = Field(default_factory=list, max_length=100)
    volunteering_leadership: List[VolunteeringLeadership] = Field(
        default_factory=list, max_length=100
    )
    publications: List[Publication] = Field(default_factory=list, max_length=100)


# ============================================================================
# Resume
# ============================================================================

# Default section order for resumes
DEFAULT_LAYOUT_ORDER = [
    ResumeSectionType.CONTACT.value,
    ResumeSectionType.SUMMARY.value,
    ResumeSectionType.EXPERIENCE.value,
    ResumeSectionType.EDUCATION.value,
    ResumeSectionType.SKILLS.value,
    ResumeSectionType.PROJECTS.value,
    ResumeSectionType.CERTIFICATIONS.value,
    ResumeSectionType.AWARDS.value,
]


class Resume(BaseModel):
    id: Optional[PyObjectId] = Field(
        default=None,
        validation_alias=AliasChoices("_id", "id"),
        serialization_alias="id",
    )
    user_id: PyObjectId = Field(validation_alias=AliasChoices("user_id", "userId"))
    name: str = Field(max_length=200)
    # New fields from diagram
    template_name: ResumeTemplate = ResumeTemplate.CLASSIC
    layout_order: List[str] = Field(default_factory=lambda: DEFAULT_LAYOUT_ORDER.copy())
    # Embedded snapshot data
    data: ResumeData = Field(default_factory=ResumeData)
    version: int = 1
    is_active: bool = True
    deleted_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    model_config = ConfigDict(from_attributes=True)


class ResumeCreate(BaseModel):
    name: str = Field(max_length=200)
    template_name: Optional[ResumeTemplate] = ResumeTemplate.CLASSIC
    layout_order: Optional[List[str]] = None
    data: Optional[ResumeData] = None


class ResumeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    template_name: Optional[ResumeTemplate] = None
    layout_order: Optional[List[str]] = None
    data: Optional[ResumeData] = None
