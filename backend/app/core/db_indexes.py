"""Database indexes initialization and management"""

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, TEXT
from app.core.logging_config import get_logger

logger = get_logger(__name__)


async def create_indexes(client: AsyncIOMotorClient) -> None:
    """Create all required database indexes for optimal performance"""

    db = client.get_default_database()

    # ========== USERS COLLECTION INDEXES ==========
    users = db["users"]
    await users.create_index("email", unique=True)
    logger.info("Created index on users.email (unique)")

    # Sparse index for optional OAuth IDs
    await users.create_index("google_id", unique=True, sparse=True)
    logger.info("Created index on users.google_id (unique, sparse)")

    await users.create_index("facebook_id", unique=True, sparse=True)
    logger.info("Created index on users.facebook_id (unique, sparse)")

    # New indexes for role and tier
    await users.create_index("role")
    logger.info("Created index on users.role")

    await users.create_index("tier")
    logger.info("Created index on users.tier")

    # Created date index for sorting
    await users.create_index("created_at")
    logger.info("Created index on users.created_at")

    # ========== RESUMES COLLECTION INDEXES ==========
    resumes = db["resumes"]
    await resumes.create_index("user_id")
    logger.info("Created index on resumes.user_id")

    # Composite index for user resumes sorted by update date
    await resumes.create_index([("user_id", ASCENDING), ("updated_at", DESCENDING)])
    logger.info("Created composite index on resumes (user_id, updated_at)")

    # Updated date index for sorting
    await resumes.create_index("updated_at")
    logger.info("Created index on resumes.updated_at")

    # Active resumes index
    await resumes.create_index([("user_id", ASCENDING), ("is_active", ASCENDING)])
    logger.info("Created composite index on resumes (user_id, is_active)")

    # Soft delete filter
    await resumes.create_index([("user_id", ASCENDING), ("deleted_at", ASCENDING)])
    logger.info("Created composite index on resumes (user_id, deleted_at)")

    # ========== MASTER PROFILES COLLECTION INDEXES ==========
    master_profiles = db["master_profiles"]
    await master_profiles.create_index("user_id", unique=True)
    logger.info("Created index on master_profiles.user_id (unique)")

    # Updated date index for sorting
    await master_profiles.create_index("updated_at")
    logger.info("Created index on master_profiles.updated_at")

    # ========== JOBS COLLECTION INDEXES ==========
    jobs = db["jobs"]
    await jobs.create_index("title")
    logger.info("Created index on jobs.title")

    await jobs.create_index("company_name")
    logger.info("Created index on jobs.company_name")

    await jobs.create_index("status")
    logger.info("Created index on jobs.status")

    await jobs.create_index("job_type")
    logger.info("Created index on jobs.job_type")

    # Composite index for active jobs sorted by posted date
    await jobs.create_index([("status", ASCENDING), ("posted_date", DESCENDING)])
    logger.info("Created composite index on jobs (status, posted_date)")

    await jobs.create_index("created_at")
    logger.info("Created index on jobs.created_at")

    # Text index for full-text search (handle if already exists with different name)
    try:
        # Try to drop any existing text index first
        existing_indexes = await jobs.list_indexes().to_list(None)
        for idx in existing_indexes:
            if idx.get("textIndexVersion"):
                await jobs.drop_index(idx["name"])
                logger.info(f"Dropped existing text index: {idx['name']}")
                break
        await jobs.create_index(
            [("title", TEXT), ("description", TEXT), ("company_name", TEXT)],
            name="jobs_text_search",
        )
        logger.info("Created text index on jobs (title, description, company_name)")
    except Exception as e:
        logger.warning(f"Text index already exists or error: {e}")

    # ========== JOB APPLICATIONS COLLECTION INDEXES ==========
    job_applications = db["job_applications"]
    await job_applications.create_index("user_id")
    logger.info("Created index on job_applications.user_id")

    await job_applications.create_index("job_id")
    logger.info("Created index on job_applications.job_id")

    await job_applications.create_index("resume_id", sparse=True)
    logger.info("Created index on job_applications.resume_id (sparse)")

    await job_applications.create_index("status")
    logger.info("Created index on job_applications.status")

    # Composite index for user's applications by status (Kanban)
    await job_applications.create_index([("user_id", ASCENDING), ("status", ASCENDING)])
    logger.info("Created composite index on job_applications (user_id, status)")

    # Composite index for user's applications sorted by update date
    await job_applications.create_index(
        [("user_id", ASCENDING), ("updated_at", DESCENDING)]
    )
    logger.info("Created composite index on job_applications (user_id, updated_at)")

    # Unique composite index to prevent duplicate applications
    await job_applications.create_index(
        [("user_id", ASCENDING), ("job_id", ASCENDING)], unique=True
    )
    logger.info("Created unique composite index on job_applications (user_id, job_id)")

    await job_applications.create_index("match_score")
    logger.info("Created index on job_applications.match_score")

    await job_applications.create_index("applied_date")
    logger.info("Created index on job_applications.applied_date")

    # ========== AI LOGS COLLECTION INDEXES ==========
    ai_logs = db["ai_logs"]
    await ai_logs.create_index("user_id")
    logger.info("Created index on ai_logs.user_id")

    await ai_logs.create_index("action")
    logger.info("Created index on ai_logs.action")

    await ai_logs.create_index("created_at")
    logger.info("Created index on ai_logs.created_at")

    # Composite index for user's AI usage sorted by date
    await ai_logs.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    logger.info("Created composite index on ai_logs (user_id, created_at)")

    # Composite index for user's AI usage by action type
    await ai_logs.create_index([("user_id", ASCENDING), ("action", ASCENDING)])
    logger.info("Created composite index on ai_logs (user_id, action)")

    logger.info("All database indexes created successfully")


async def check_indexes(client: AsyncIOMotorClient) -> None:
    """Check and log all existing indexes"""

    db = client.get_default_database()

    collections = [
        "users",
        "resumes",
        "master_profiles",
        "jobs",
        "job_applications",
        "ai_logs",
    ]

    for collection_name in collections:
        collection = db[collection_name]
        indexes = await collection.list_indexes().to_list(None)
        logger.info(
            f"Indexes for {collection_name}: {[idx['name'] for idx in indexes]}"
        )
