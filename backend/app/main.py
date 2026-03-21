from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from app.core.db import connect_to_mongo, close_mongo_connection, get_client
from app.core.db_indexes import create_indexes
from app.core.config import settings
from app.core.logging_config import setup_logging, get_logger
from app.core.rate_limiter import setup_rate_limiter
from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.resumes import router as resumes_router
from app.api.routes.master_profile import router as master_profile_router

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup logging
    setup_logging()
    # Connect to MongoDB
    await connect_to_mongo()
    # Create database indexes
    await create_indexes(get_client())
    try:
        yield
    finally:
        await close_mongo_connection()


app = FastAPI(lifespan=lifespan, title="Resumate API", version="0.1.0")

# Setup rate limiting
setup_rate_limiter(app)

# Add CORS middleware with configurable origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=settings.get_allowed_methods(),
    allow_headers=["Content-Type", "Authorization"],
)

# Custom exception handler for Pydantic validation errors
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """Convert Pydantic validation errors to user-friendly messages"""
    errors = exc.errors()
    error_messages = []
    
    for error in errors:
        field = '.'.join(str(x) for x in error['loc'][1:])
        msg = error['msg']
        
        # Make error messages more user-friendly
        if 'at least' in msg.lower():
            error_messages.append(f"{field}: {msg}")
        elif 'must be' in msg.lower():
            error_messages.append(f"{field}: {msg}")
        else:
            error_messages.append(f"{field}: {msg}")
    
    detail = " | ".join(error_messages) if error_messages else "Validation error"
    logger.warning(f"Validation error: {detail}")
    
    return JSONResponse(
        status_code=422,
        content={"detail": detail}
    )

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(resumes_router)
app.include_router(master_profile_router)


@app.get("/health")
async def health():
    """Health check endpoint that verifies service and database status"""
    db_status = "ok"
    try:
        # Try to ping MongoDB
        client = get_client()
        await client.admin.command("ping")
    except Exception as e:
        db_status = "error"
        logger.error(f"Database health check failed: {str(e)}")
    
    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "resumate-api"
    }
