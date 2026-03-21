"""
MongoDB Database Initialization Script

This script creates all collections with validation schemas and indexes
based on the database diagram.

Collections:
- users: User accounts with auth info
- master_profiles: Reusable career data pool
- resumes: Individual resume documents
- jobs: Job listings with AI embeddings
- job_applications: Application tracking (Kanban)
- ai_logs: AI usage tracking for billing

Usage:
    python -m app.scripts.init_db
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from pymongo.errors import CollectionInvalid
from app.core.config import settings
from app.core.logging_config import setup_logging, get_logger

logger = get_logger(__name__)


# ============================================================================
# JSON Schema Validators for Collections
# ============================================================================

USERS_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["email", "created_at"],
        "properties": {
            "_id": {"bsonType": "objectId"},
            "email": {
                "bsonType": "string",
                "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                "description": "Must be a valid email address",
            },
            "full_name": {"bsonType": ["string", "null"], "maxLength": 200},
            "hashed_password": {"bsonType": ["string", "null"]},
            "avatar_url": {"bsonType": ["string", "null"]},
            "is_active": {"bsonType": "bool"},
            # OAuth
            "google_id": {"bsonType": ["string", "null"]},
            "facebook_id": {"bsonType": ["string", "null"]},
            # New fields from diagram
            "role": {
                "bsonType": "string",
                "enum": ["user", "admin", "premium"],
                "description": "User role",
            },
            "tier": {
                "bsonType": "string",
                "enum": ["free", "basic", "pro", "enterprise"],
                "description": "Subscription tier",
            },
            "preferences": {
                "bsonType": "object",
                "properties": {
                    "theme": {
                        "bsonType": "string",
                        "enum": ["light", "dark", "system"],
                    },
                    "language": {"bsonType": "string"},
                    "notifications_enabled": {"bsonType": "bool"},
                    "email_notifications": {"bsonType": "bool"},
                },
            },
            # Career Goals
            "next_career_goal": {"bsonType": ["string", "null"], "maxLength": 500},
            "target_title": {"bsonType": ["string", "null"], "maxLength": 200},
            "target_date": {"bsonType": ["string", "null"]},
            "salary_min": {"bsonType": "int", "minimum": 0},
            "salary_max": {"bsonType": "int", "minimum": 0},
            "currency": {"bsonType": "string"},
            # Timestamps
            "created_at": {"bsonType": "date"},
            "updated_at": {"bsonType": "date"},
        },
    }
}

MASTER_PROFILES_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["user_id"],
        "properties": {
            "_id": {"bsonType": "objectId"},
            "user_id": {
                "bsonType": "objectId",
                "description": "Reference to users._id",
            },
            # New: Personal Info
            "personal_info": {
                "bsonType": "object",
                "properties": {
                    "full_name": {"bsonType": ["string", "null"]},
                    "email": {"bsonType": ["string", "null"]},
                    "phone": {"bsonType": ["string", "null"]},
                    "location": {"bsonType": ["string", "null"]},
                    "linkedin_url": {"bsonType": ["string", "null"]},
                    "github_url": {"bsonType": ["string", "null"]},
                    "portfolio_url": {"bsonType": ["string", "null"]},
                    "summary": {"bsonType": ["string", "null"]},
                },
            },
            "experiences": {"bsonType": "array"},
            "educations": {"bsonType": "array"},
            "skills": {"bsonType": "array"},
            "projects": {"bsonType": "array"},
            "awards": {"bsonType": "array"},
            "certifications": {"bsonType": "array"},
            "volunteering_leadership": {"bsonType": "array"},
            "publications": {"bsonType": "array"},
            # New: AI Embedding for matching
            "profile_embedding": {
                "bsonType": "array",
                "items": {"bsonType": "double"},
                "description": "AI-generated embedding vector for job matching",
            },
            # Timestamps
            "created_at": {"bsonType": "date"},
            "updated_at": {"bsonType": "date"},
        },
    }
}

RESUMES_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["user_id", "name"],
        "properties": {
            "_id": {"bsonType": "objectId"},
            "user_id": {
                "bsonType": "objectId",
                "description": "Reference to users._id",
            },
            "name": {"bsonType": "string", "maxLength": 200},
            # New fields from diagram
            "template_name": {
                "bsonType": "string",
                "description": "Resume template identifier",
            },
            "layout_order": {
                "bsonType": "array",
                "items": {"bsonType": "string"},
                "description": "Order of sections in resume",
            },
            # Embedded snapshot data
            "data": {
                "bsonType": "object",
                "properties": {
                    "contact_info": {"bsonType": "object"},
                    "target_title": {"bsonType": ["string", "null"]},
                    "professional_summary": {"bsonType": ["string", "null"]},
                    "work_experience": {"bsonType": "array"},
                    "education": {"bsonType": "array"},
                    "skills": {"bsonType": "array"},
                    "certifications": {"bsonType": "array"},
                    "awards": {"bsonType": "array"},
                    "projects": {"bsonType": "array"},
                    "volunteering_leadership": {"bsonType": "array"},
                    "publications": {"bsonType": "array"},
                },
            },
            "version": {"bsonType": "int", "minimum": 1},
            "is_active": {"bsonType": "bool"},
            "deleted_at": {"bsonType": ["date", "null"]},
            "created_at": {"bsonType": "date"},
            "updated_at": {"bsonType": "date"},
        },
    }
}

JOBS_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["title", "company_name"],
        "properties": {
            "_id": {"bsonType": "objectId"},
            "title": {"bsonType": "string", "maxLength": 300},
            "company_name": {"bsonType": "string", "maxLength": 200},
            "company_logo_url": {"bsonType": ["string", "null"]},
            "location": {"bsonType": ["string", "null"]},
            "job_type": {
                "bsonType": "string",
                "enum": ["full-time", "part-time", "contract", "internship", "remote"],
            },
            "salary_min": {"bsonType": ["int", "null"]},
            "salary_max": {"bsonType": ["int", "null"]},
            "currency": {"bsonType": ["string", "null"]},
            "description": {"bsonType": ["string", "null"]},
            "requirements_extracted": {
                "bsonType": "array",
                "items": {"bsonType": "string"},
                "description": "AI-extracted requirements from job description",
            },
            "job_embedding": {
                "bsonType": "array",
                "items": {"bsonType": "double"},
                "description": "AI-generated embedding for matching",
            },
            "source_url": {"bsonType": ["string", "null"]},
            "status": {
                "bsonType": "string",
                "enum": ["active", "closed", "expired"],
                "description": "Job listing status",
            },
            "posted_date": {"bsonType": ["date", "null"]},
            "expires_date": {"bsonType": ["date", "null"]},
            "created_at": {"bsonType": "date"},
            "updated_at": {"bsonType": "date"},
        },
    }
}

JOB_APPLICATIONS_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["user_id", "job_id", "status"],
        "properties": {
            "_id": {"bsonType": "objectId"},
            "user_id": {
                "bsonType": "objectId",
                "description": "Reference to users._id",
            },
            "job_id": {"bsonType": "objectId", "description": "Reference to jobs._id"},
            "resume_id": {
                "bsonType": ["objectId", "null"],
                "description": "Reference to resumes._id",
            },
            # Kanban status
            "status": {
                "bsonType": "string",
                "enum": [
                    "wishlist",
                    "applied",
                    "interviewing",
                    "offer",
                    "rejected",
                    "accepted",
                    "withdrawn",
                ],
                "description": "Application status for Kanban board",
            },
            "match_score": {
                "bsonType": ["int", "null"],
                "minimum": 0,
                "maximum": 100,
                "description": "AI-calculated match score (0-100)",
            },
            "applied_date": {"bsonType": ["date", "null"]},
            "notes": {"bsonType": ["string", "null"]},
            "interview_dates": {"bsonType": "array", "items": {"bsonType": "date"}},
            "offer_details": {
                "bsonType": "object",
                "properties": {
                    "salary": {"bsonType": ["int", "null"]},
                    "currency": {"bsonType": ["string", "null"]},
                    "start_date": {"bsonType": ["date", "null"]},
                    "benefits": {"bsonType": ["string", "null"]},
                },
            },
            "created_at": {"bsonType": "date"},
            "updated_at": {"bsonType": "date"},
        },
    }
}

AI_LOGS_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["user_id", "action", "created_at"],
        "properties": {
            "_id": {"bsonType": "objectId"},
            "user_id": {
                "bsonType": "objectId",
                "description": "Reference to users._id",
            },
            "action": {
                "bsonType": "string",
                "enum": [
                    "generate_summary",
                    "optimize_resume",
                    "match_job",
                    "extract_requirements",
                    "generate_cover_letter",
                    "analyze_job",
                    "suggest_skills",
                    "other",
                ],
                "description": "Type of AI action performed",
            },
            "model": {"bsonType": ["string", "null"], "description": "AI model used"},
            "prompt_tokens": {"bsonType": "int", "minimum": 0},
            "completion_tokens": {"bsonType": "int", "minimum": 0},
            "total_tokens": {"bsonType": "int", "minimum": 0},
            "cost_usd": {
                "bsonType": ["double", "null"],
                "description": "Estimated cost in USD",
            },
            "input_preview": {"bsonType": ["string", "null"], "maxLength": 500},
            "output_preview": {"bsonType": ["string", "null"], "maxLength": 500},
            "duration_ms": {
                "bsonType": ["int", "null"],
                "description": "Request duration in milliseconds",
            },
            "success": {"bsonType": "bool"},
            "error_message": {"bsonType": ["string", "null"]},
            "metadata": {"bsonType": "object"},
            "created_at": {"bsonType": "date"},
        },
    }
}


# ============================================================================
# Collection Creation Functions
# ============================================================================


async def create_collection_with_validator(db, name: str, validator: dict) -> None:
    """Create a collection with JSON schema validation"""
    try:
        await db.create_collection(name, validator=validator)
        logger.info(f"Created collection: {name}")
    except CollectionInvalid:
        # Collection already exists, update validator
        await db.command("collMod", name, validator=validator)
        logger.info(f"Updated validator for existing collection: {name}")


async def create_indexes(db) -> None:
    """Create all required database indexes"""

    # ========== USERS INDEXES ==========
    users = db["users"]
    await users.create_index("email", unique=True)
    await users.create_index("google_id", unique=True, sparse=True)
    await users.create_index("facebook_id", unique=True, sparse=True)
    await users.create_index("role")
    await users.create_index("tier")
    await users.create_index("created_at")
    logger.info("Created indexes for users collection")

    # ========== MASTER_PROFILES INDEXES ==========
    master_profiles = db["master_profiles"]
    await master_profiles.create_index("user_id", unique=True)
    await master_profiles.create_index("updated_at")
    logger.info("Created indexes for master_profiles collection")

    # ========== RESUMES INDEXES ==========
    resumes = db["resumes"]
    await resumes.create_index("user_id")
    await resumes.create_index([("user_id", ASCENDING), ("updated_at", DESCENDING)])
    await resumes.create_index([("user_id", ASCENDING), ("is_active", ASCENDING)])
    await resumes.create_index([("user_id", ASCENDING), ("deleted_at", ASCENDING)])
    await resumes.create_index("updated_at")
    logger.info("Created indexes for resumes collection")

    # ========== JOBS INDEXES ==========
    jobs = db["jobs"]
    await jobs.create_index("title")
    await jobs.create_index("company_name")
    await jobs.create_index("status")
    await jobs.create_index("job_type")
    await jobs.create_index([("status", ASCENDING), ("posted_date", DESCENDING)])
    await jobs.create_index("created_at")
    # Text index for search
    await jobs.create_index(
        [("title", "text"), ("description", "text"), ("company_name", "text")]
    )
    logger.info("Created indexes for jobs collection")

    # ========== JOB_APPLICATIONS INDEXES ==========
    job_applications = db["job_applications"]
    await job_applications.create_index("user_id")
    await job_applications.create_index("job_id")
    await job_applications.create_index("resume_id", sparse=True)
    await job_applications.create_index("status")
    await job_applications.create_index([("user_id", ASCENDING), ("status", ASCENDING)])
    await job_applications.create_index(
        [("user_id", ASCENDING), ("updated_at", DESCENDING)]
    )
    await job_applications.create_index(
        [("user_id", ASCENDING), ("job_id", ASCENDING)], unique=True
    )
    await job_applications.create_index("match_score")
    await job_applications.create_index("applied_date")
    logger.info("Created indexes for job_applications collection")

    # ========== AI_LOGS INDEXES ==========
    ai_logs = db["ai_logs"]
    await ai_logs.create_index("user_id")
    await ai_logs.create_index("action")
    await ai_logs.create_index("created_at")
    await ai_logs.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    await ai_logs.create_index([("user_id", ASCENDING), ("action", ASCENDING)])
    # TTL index - auto-delete logs after 90 days (optional)
    # await ai_logs.create_index("created_at", expireAfterSeconds=7776000)
    logger.info("Created indexes for ai_logs collection")


async def init_database(mongo_uri: str = None) -> None:
    """Initialize the database with all collections, validators, and indexes

    Args:
        mongo_uri: Optional MongoDB connection string. If not provided,
                   uses environment variable or localhost fallback.
    """

    setup_logging()
    logger.info("Starting database initialization...")

    # Determine connection string
    import os
    if mongo_uri:
        connection_uri = mongo_uri
    else:
        # Try environment variable, fallback to localhost with auth for local dev
        connection_uri = os.getenv(
            "MONGO_URI",
            "mongodb://admin:Truc123@localhost:27017/resumate?authSource=admin"
        )

    logger.info(f"Connecting to MongoDB...")

    # Connect to MongoDB
    client = AsyncIOMotorClient(connection_uri)
    db = client.get_default_database()

    try:
        # Create collections with validators
        logger.info("Creating collections with validation schemas...")

        await create_collection_with_validator(db, "users", USERS_VALIDATOR)
        await create_collection_with_validator(
            db, "master_profiles", MASTER_PROFILES_VALIDATOR
        )
        await create_collection_with_validator(db, "resumes", RESUMES_VALIDATOR)
        await create_collection_with_validator(db, "jobs", JOBS_VALIDATOR)
        await create_collection_with_validator(
            db, "job_applications", JOB_APPLICATIONS_VALIDATOR
        )
        await create_collection_with_validator(db, "ai_logs", AI_LOGS_VALIDATOR)

        # Create indexes
        logger.info("Creating database indexes...")
        await create_indexes(db)

        # List all collections
        collections = await db.list_collection_names()
        logger.info(f"Database initialized successfully. Collections: {collections}")

        # Print summary
        print("\n" + "=" * 60)
        print("DATABASE INITIALIZATION COMPLETE")
        print("=" * 60)
        print(f"Database: {db.name}")
        print(f"Collections created: {len(collections)}")
        for col in sorted(collections):
            count = await db[col].count_documents({})
            print(f"  - {col}: {count} documents")
        print("=" * 60 + "\n")

    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(init_database())
